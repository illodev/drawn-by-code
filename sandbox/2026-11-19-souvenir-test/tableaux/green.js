// Picture 3 · «Verde que te quiero verde»: Lorca's «Romance sonámbulo» as a half-abstract
// dream in greens, without its people, in the brush manner (no contour line), almost
// monochrome: every green from black-green to a pale cold moonlit green, silver for the
// moonlight, and one warm colour used once (the trail of blood on the high railing).
//   Tableau.green(z0) → layers; the first stratum's nearest sheet at depth z0.
//
// The order is the poem's own, and goes from the call to the end:
//   1 · «Verde viento. Verdes ramas.» (z0 … z0 + 280) The dream begins inside the fig tree's
//       crown, in the green wind: the fig «rubs its wind with the sandpaper of its branches».
//       The way through is a gap between its leaves.
//   2 · «El barco sobre la mar y el caballo en la montaña» (z0 + 520 … 800) What the dreamer
//       looks out at: the night, the mountain as «a thieving cat» bristling its sour agaves
//       (a ridge arched like a cat's back, two summits for ears, agaves standing up along its
//       spine like fur), the ship and the horse as ghosts in the haze, the big stars of frost
//       and the fish of shadow that opens the road of dawn. The way through is the pass
//       under the cat's arched belly.
//   3 · «Barandales de la luna por donde retumba el agua» (z0 + 1040 … 1320) The house: the
//       high green railings the two compadres climbed, the trail of blood they left on the
//       hand-rail (the one warm colour), the tin lanterns trembling on the roofs, a thousand
//       glass tambourines wounding the dawn. The way through is the open window.
//   4 · The cistern (z0 + 1760, the plate): «sobre el rostro del aljibe…», seen from above,
//       black water, and on it the moon's thick crescent drawn down into «an icicle of
//       moon». The way out is the cistern's mouth, into black water.
//
// What a second look finds (stratum · sheet):
//   1 · a tree frog on the fig's branch (Hyla meridionalis: the stripe stops at the
//       shoulder); a Spanish moon moth (Graellsia isabellae) on a leaf; latex beading from a
//       broken fig stalk; hoar frost on the leaves' edges facing the night; leaves turned
//       by the wind to their pale undersides; the ringed nodes and leaf scars of fig wood
//   2 · the cat's two eyes (two lights in the mountain's head); olive groves in rows on its
//       flanks; the agaves' bud prints; a flowering pole («quiote») gone to seed; a prickly
//       pear with its fruit; one arm broken on a frost star; the pennant of the ship blown
//       the same way as the horse's mane (the same wind)
//   3 · the compadres' trades («mi caballo por su casa, mi montura por su espejo, mi
//       cuchillo por su manta»): the horseshoe nailed over the window, the mirror on the
//       wall, the blanket thrown over the rail; the wind's taste «de hiel, de menta y de
//       albahaca»: mint and basil growing in tins on the balcony; a gecko on the wall;
//       houseleeks on the roof tiles; water beading under the rails
//   4 · the rope's grooves worn into the cistern's curb; maidenhair fern («culantrillo de
//       pozo») in its damp joints; Granada's pebble paving round it; a fig leaf floating
//       on the water; rings where drops fall
window.Tableau = window.Tableau || {};
Tableau.green = (z0, opt = null) => {
    const S = Souvenir, G = Green, TAU = Math.PI * 2;
    const box = { x: -1200, y: -720, w: 2400, h: 1440 };
    const plateBox = { x: -1650, y: -940, w: 3300, h: 1880 };
    const D = Tableau.green.Z;
    const canvas = (w, h) => {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil(w));
        c.height = Math.max(1, Math.ceil(h));
        return c;
    };
    const Q = (res, q = 1) => Math.max(0.5, Math.round(res * q * 4) / 4); // a sprite's pixels per unit
    // ------------------------------------------------------------------ light and air
    // Moonlight and shade laid over a finished sheet, on its paint only: `paint(q)` draws
    // lights (white) and shades (black) on a grey map a quarter of the sheet's size.
    function relight(g, bx, res, paint, o = {}) {
        const W = g.canvas.width, H = g.canvas.height, f = 0.25;
        const small = canvas(W * f, H * f), q = small.getContext('2d');
        q.fillStyle = '#808080';
        q.fillRect(0, 0, small.width, small.height);
        q.setTransform(res * f, 0, 0, res * f, -bx.x * res * f, -bx.y * res * f);
        paint(q);
        const map = canvas(W, H), mq = map.getContext('2d', { willReadFrequently: true });
        mq.imageSmoothingQuality = 'high';
        mq.drawImage(small, 0, 0, W, H);
        const L = mq.getImageData(0, 0, W, H).data;
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        const img = g.getImageData(0, 0, W, H), px = img.data, sun = o.sun ?? 1, sh = o.shade ?? 1;
        for (let i = 0; i < px.length; i += 4) {
            if (!px[i + 3]) continue;
            const l = L[i];
            if (l > 129) {
                // the moon: lifts and cools
                const k = ((l - 128) / 127) * sun;
                px[i] = Math.min(250, px[i] * (1 + 0.3 * k) + 10 * k);
                px[i + 1] = Math.min(252, px[i + 1] * (1 + 0.36 * k) + 16 * k);
                px[i + 2] = Math.min(252, px[i + 2] * (1 + 0.42 * k) + 16 * k);
            } else if (l < 127) {
                const k = ((128 - l) / 128) * sh;
                px[i] *= 1 - 0.55 * k;
                px[i + 1] *= 1 - 0.45 * k;
                px[i + 2] *= 1 - 0.4 * k;
            }
        }
        g.putImageData(img, 0, 0);
        g.restore();
    }
    // the map: the moon from the top left, pools of shade, patches of light
    const moonMap = (seed, bx, o = {}) => (q) => {
        const r = Motion.rng('moon' + seed), m = q.getTransform();
        const group = (blur, draw) => {
            const c = canvas(q.canvas.width, q.canvas.height), p = c.getContext('2d');
            p.setTransform(m);
            draw((x, y, rx, ry, a, col) => {
                p.fillStyle = col;
                p.beginPath();
                p.ellipse(x, y, rx, ry, a, 0, TAU);
                p.fill();
            });
            q.save();
            q.setTransform(1, 0, 0, 1, 0, 0);
            q.filter = `blur(${(blur * m.a).toFixed(2)}px)`;
            q.drawImage(c, 0, 0);
            q.restore();
        };
        const gr = q.createLinearGradient(bx.x, bx.y, bx.x + bx.w * 0.7, bx.y + bx.h);
        gr.addColorStop(0, `rgba(255,255,255,${o.lift ?? 0.18})`);
        gr.addColorStop(0.5, 'rgba(128,128,128,0)');
        gr.addColorStop(1, `rgba(0,0,0,${o.fall ?? 0.3})`);
        q.fillStyle = gr;
        q.fillRect(bx.x, bx.y, bx.w, bx.h);
        group(30, (blob) => {
            for (let i = 0; i < (o.pools ?? 20); i++) blob(bx.x + r() * bx.w, bx.y + r() * bx.h, 120 + r() * 240, 80 + r() * 140, r() * 3, `rgba(0,0,0,${0.15 + r() * 0.3})`);
            for (const [x, y, rad, a] of o.dark ?? []) blob(x, y, rad, rad * 0.8, 0, `rgba(0,0,0,${a})`);
        });
        group(10, (blob) => {
            for (let i = 0; i < (o.lights ?? 30); i++) {
                const x = bx.x + r() * bx.w, y = bx.y + r() * bx.h * 0.8, a = 0.75 + (r() - 0.5) * 0.6, al = 0.25 + r() * 0.45;
                for (let j = 0; j < 3; j++) blob(x + (r() - 0.5) * 120, y + (r() - 0.5) * 80, 24 + r() * 60, 10 + r() * 26, a, `rgba(255,255,255,${al})`);
            }
            for (const [x, y, rx, ry, a, al] of o.lit ?? []) blob(x, y, rx, ry, a, `rgba(255,255,255,${al})`);
        });
    };
    // air between the eye and a sheet: its paint drifts towards the haze
    const veil = (g, bx, color) => {
        g.save();
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = color;
        g.fillRect(bx.x, bx.y, bx.w, bx.h);
        g.restore();
    };
    // mist laid in soft bands (on the paint only, unless `free`)
    const mist = (g, bx, o = {}) => {
        const r = Motion.rng('mist' + (o.seed ?? 1));
        G.softly(g, o.blur ?? 30, (q) => {
            if (!o.free) q.globalCompositeOperation = 'source-over';
            for (let i = 0; i < (o.n ?? 10); i++) {
                const x = bx.x + r() * bx.w, y = (o.y0 ?? bx.y) + r() * (o.h ?? bx.h), rx = 200 + r() * 400, ry = 30 + r() * 70;
                const gr = q.createRadialGradient(x, y, 0, x, y, rx);
                gr.addColorStop(0, o.color ?? 'rgba(150,200,180,0.25)');
                gr.addColorStop(1, 'rgba(150,200,180,0)');
                q.fillStyle = gr;
                q.save();
                q.translate(x, y);
                q.scale(1, ry / rx);
                q.translate(-x, -y);
                q.fillRect(x - rx, y - rx, rx * 2, rx * 2);
                q.restore();
            }
        });
    };
    // a gap about the axis, wobbled so that it is never a clean oval
    const blob = (rx, ry, seed, wob = 0.12) => {
        const r = Motion.rng('gap' + seed), ph = [r() * 6, r() * 6, r() * 6];
        const f = (th) => 1 + wob * (0.6 * Math.sin(th * 2 + ph[0]) + 0.3 * Math.sin(th * 3 + ph[1]) + 0.25 * Math.sin(th * 5 + ph[2]));
        return { rx, ry, f, out: (x, y, pad = 0) => {
            const th = Math.atan2(y / ry, x / rx), k = f(th);
            return Math.hypot(x / (rx * k + pad), y / (ry * k + pad)) > 1;
        } };
    };

    // ------------------------------------------------------------------ 1 · the fig tree
    const GAP1 = blob(310, 210, 'fig1');
    // A body of fig foliage over a sheet: leaves on a jittered grid outside the gap, each
    // turned and tipped its own way, the lit ones towards the moon's side.
    function foliage(g, res, o) {
        const r = Motion.rng('foliage' + o.seed), rs = Q(res, o.q ?? 1.05), gap = o.gap, bx = o.box ?? box;
        const step = o.step ?? 120, items = [];
        for (let y = bx.y - 40; y < bx.y + bx.h + 60; y += step * 0.8) {
            for (let x = bx.x - 40; x < bx.x + bx.w + 60; x += step) {
                const px = x + (r() - 0.5) * step * 0.9, py = y + (r() - 0.5) * step * 0.7;
                if (gap && !gap.out(px, py, o.pad ?? 120)) continue;
                const lit = S.clamp(0.5 - (px / bx.w) * 0.55 - (py / bx.h) * 0.75 + (r() - 0.5) * 0.5);
                let kind = r() < (o.under ?? 0.07) ? 'under' : r() < (o.lime ?? 0.015) ? 'lime' : lit > 0.62 ? 'moon' : lit > 0.32 ? 'shade' : 'deep';
                if (o.kinds) kind = o.kinds(kind, px, py, r);
                items.push({ x: px, y: py, rot: r() * TAU, s: (o.s ?? 1) * (0.7 + r() * r() * 0.9), kind, v: Math.floor(r() * (kind === 'under' || kind === 'lime' ? 2 : o.vars ?? 4)) + (kind === 'under' ? 4 : kind === 'lime' ? 6 : 0), fx: 0.62 + r() * 0.38, fy: 0.55 + r() * 0.45 });
            }
        }
        // the deep ones first, the lit ones over them
        const rank = { deep: 0, shade: 1, under: 2, lime: 2, moon: 3 };
        items.sort((a, b) => rank[a.kind] - rank[b.kind] || a.y - b.y);
        for (const it of items) {
            const sp = G.figLeaf(it.v, it.rot, rs, it.kind);
            // aim the joint so the leaf's middle sits on the spot
            const c = Math.cos(it.rot), sn = Math.sin(it.rot), off = sp.G.L * 0.42 * it.s * it.fx;
            const x = it.x - c * off, y = it.y - sn * off;
            if (o.shadow !== false) G.shadow(g, sp, x, y, it.s, { rot: it.rot, fx: it.fx, fy: it.fy, dx: 10, dy: 15, alpha: 0.5, blur: 12 });
            G.put(g, sp, x, y, it.s, { rot: it.rot, fx: it.fx, fy: it.fy });
            it.sp = sp;
            it.jx = x;
            it.jy = y;
        }
        return items;
    }
    // A fig limb with its shoots: leaves at the nodes (alternate, on long petioles), figs in
    // the axils, the stipule rings, the leaf scars of the ones that fell, a bud at each tip.
    function limb(g, res, o) {
        const r = Motion.rng('limb' + o.seed), rs = Q(res, o.q ?? 1.05), s = o.s ?? 1;
        const W = G.figWood(g, o.path, { w0: o.w0 ?? 40, w1: o.w1 ?? 12, seed: 'limb' + o.seed, nodes: [], wrinkles: o.wrinkles ?? [], dens: o.dens });
        const nodes = [];
        for (let d = W.total * 0.25; d < W.total * 0.97; d += (70 + r() * 60) * s) nodes.push(d);
        const front = [];
        nodes.forEach((d, i) => {
            const p = W.at(d), sg = i % 2 ? 1 : -1, a = p.a + sg * (0.9 + r() * 0.6);
            if (o.gap && !o.gap.out(p.x + Math.cos(a) * 160 * s, p.y + Math.sin(a) * 160 * s, 60)) {
                G.leafScar(g, p.x - Math.sin(p.a) * sg * p.w * 0.3, p.y + Math.cos(p.a) * sg * p.w * 0.3, p.a, Math.min(14, p.w * 0.8));
                return;
            }
            if (r() < (o.scars ?? 0.18)) {
                G.leafScar(g, p.x - Math.sin(p.a) * sg * p.w * 0.3, p.y + Math.cos(p.a) * sg * p.w * 0.3, p.a, Math.min(14, p.w * 0.8));
                return;
            }
            const kind = o.kinds ? o.kinds[Math.floor(r() * o.kinds.length)] : r() < 0.5 ? 'moon' : 'shade';
            const it = { x: p.x, y: p.y, rot: a, s: s * (0.9 + r() * 0.35), kind, v: Math.floor(r() * 4) + (kind === 'under' ? 4 : kind === 'lime' ? 6 : 0), fx: 0.7 + r() * 0.3, fy: 0.6 + r() * 0.4, front: r() < 0.6 };
            if (!it.front) {
                const sp = G.figLeaf(it.v, it.rot, rs, it.kind);
                G.shadow(g, sp, it.x, it.y, it.s, { rot: it.rot, fx: it.fx, fy: it.fy, dx: 12, dy: 18, alpha: 0.55, blur: 12 });
                G.put(g, sp, it.x, it.y, it.s, { rot: it.rot, fx: it.fx, fy: it.fy });
            } else front.push(it);
            // figs in the axil: one or two, on the side away from the leaf
            if (r() < (o.figs ?? 0.5)) {
                for (let k = 0; k < (r() < 0.4 ? 2 : 1); k++) {
                    const fa = p.a - sg * (0.6 + r() * 0.8) + (k ? 0.5 : 0), fs = s * (1.1 + r() * 0.35);
                    const fsp = G.figFruit(Math.floor(r() * 5), fa - Math.PI / 2, rs);
                    const bx = p.x + Math.cos(fa) * (p.w * 0.4 + 8), by = p.y + Math.sin(fa) * (p.w * 0.4 + 8);
                    const c = Math.cos(fa - Math.PI / 2), sn = Math.sin(fa - Math.PI / 2), tx = fsp.top[0] * fs, ty = fsp.top[1] * fs;
                    const fx = bx - (tx * c - ty * sn), fy = by - (tx * sn + ty * c);
                    G.shadow(g, fsp, fx, fy, fs, { rot: fa - Math.PI / 2, dx: 8, dy: 12, alpha: 0.55, blur: 9 });
                    G.put(g, fsp, fx, fy, fs, { rot: fa - Math.PI / 2 });
                }
            }
            // the stipule ring at the node
            G.line(g, [[p.x - Math.sin(p.a) * p.w * 0.5, p.y + Math.cos(p.a) * p.w * 0.5], [p.x + Math.sin(p.a) * p.w * 0.5, p.y - Math.cos(p.a) * p.w * 0.5]], 1.2, 'rgba(10,22,16,0.55)');
        });
        const e = W.at(W.total);
        G.figBud(g, e.x, e.y, e.a, 22 * s);
        for (const it of front) {
            const sp = G.figLeaf(it.v, it.rot, rs, it.kind);
            G.shadow(g, sp, it.x, it.y, it.s, { rot: it.rot, fx: it.fx, fy: it.fy, dx: 12, dy: 18, alpha: 0.55, blur: 12 });
            G.put(g, sp, it.x, it.y, it.s, { rot: it.rot, fx: it.fx, fy: it.fy });
        }
        return W;
    }

    // ------------------------------------------------------------------ 2 · the night
    // The cat-mountain: its silhouette in sheet units (tail ridge on the left, the back
    // arched over the pass, two summits for ears on the right, legs as spurs into the sea).
    const CAT = [
        [-1260, 0], [-920, -30], [-780, -80], // a low ridge from the far left
        [-700, -170], [-730, -250], [-670, -300], [-606, -272], [-598, -210], // the tail, a rising curl
        [-530, -160], [-410, -200], [-250, -228], [-90, -240], [70, -236], [220, -216], [340, -190], // the arched back
        [390, -220], [428, -290], [458, -335], [488, -285], [532, -270], [572, -273], [606, -342], [638, -280], [700, -224], [780, -190], // the ears and the head
        [900, -120], [1260, -90], [1260, 190], // down to the sea
        [430, 190], [398, 118], [340, 40], [260, -40], [160, -100], [0, -128], [-160, -100], [-260, -40], [-340, 40], [-398, 118], [-430, 190], // the belly's arch
        [-1260, 190],
    ];
    const SEA = 190; // the sea's line in the far sheet
    const GAP2 = blob(300, 200, 'night2', 0.08);
    const GAP2N = blob(330, 220, 'night2n', 0.1);
    // ------------------------------------------------------------------ 3 · the house
    const WIN = { w: 380, top: -300, sill: 150, arch: 190 }; // the window, in far-sheet units
    const winPath = (pad = 0) => {
        const pts = [], hw = WIN.w / 2 + pad, cy = WIN.top + WIN.arch;
        pts.push([-hw, WIN.sill + pad]);
        for (let i = 0; i <= 24; i++) {
            const a = Math.PI + (i / 24) * Math.PI;
            pts.push([Math.cos(a) * hw, cy + Math.sin(a) * (WIN.arch + pad)]);
        }
        pts.push([hw, WIN.sill + pad]);
        return pts;
    };
    const GAP3N = blob(330, 230, 'house3n', 0.1);

    // =========================================================== the stratum (round 7)
    // The same world condensed into ONE stratum of loose things for the film's second
    // passage (see Tableau.green.stratum below): the fig's crown as the body, agaves pushing
    // in from the corners, and on it, whole and large, the poem's things.
    if (opt && opt.stratum) return stratum(z0);
    function stratum(z) {
        const GAPS = blob(430, 300, 'stratum', 0.13);
        // a thing laid on what is there: drawn on its own sheet, its shadow cast on the paint
        // under it (only on paint), then the thing
        const lay = (g, draw, o = {}) => {
            const m = g.getTransform(), k = Math.hypot(m.a, m.b), c = canvas(g.canvas.width, g.canvas.height), q = c.getContext('2d');
            q.setTransform(m);
            draw(q);
            const sil = canvas(c.width, c.height), sq = sil.getContext('2d');
            sq.drawImage(c, 0, 0);
            sq.globalCompositeOperation = 'source-in';
            sq.fillStyle = o.color ?? '#010805';
            sq.fillRect(0, 0, sil.width, sil.height);
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.globalCompositeOperation = 'source-atop';
            g.globalAlpha = o.alpha ?? 0.6;
            g.filter = `blur(${((o.blur ?? 14) * k).toFixed(1)}px)`;
            g.drawImage(sil, (o.dx ?? 16) * k, (o.dy ?? 24) * k);
            g.restore();
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.drawImage(c, 0, 0);
            g.restore();
        };
        // a ghost: a dark breath behind it so its silhouette reads, then the pale thing
        const ghost = (g, draw) => {
            lay(g, draw, { alpha: 0.75, blur: 22, dx: 10, dy: 14 });
            G.softly(g, 18, (q) => {
                q.globalCompositeOperation = 'source-over';
                draw(q);
            });
        };
        // a puddle of black water on the leaves with the moon's crescent in it, drawn down
        // into its «icicle»: a wet rim, rings, a leaf lying across its edge
        const puddle = (g, x, y, w, h, res, r) => {
            const pts = [];
            for (let i = 0; i < 40; i++) {
                const a = (i / 40) * TAU, k = 1 + 0.12 * Math.sin(a * 3 + 1) + 0.07 * Math.sin(a * 5 + 2);
                pts.push([x + Math.cos(a) * w * 0.5 * k, y + Math.sin(a) * h * 0.5 * k]);
            }
            // the leaves round it darkened by the wet
            G.softly(g, 10, (q) => {
                q.fillStyle = 'rgba(1,8,5,0.5)';
                G.poly(q, pts.map(([a, b]) => [x + (a - x) * 1.14, y + (b - y) * 1.2]));
            });
            // the water: flat and black, the sky's glow lying in its upper half, the crescent
            // in it drawn down into a drip, rings where a drop fell, a bright meniscus
            g.fillStyle = '#04100b';
            G.poly(g, pts);
            g.save();
            g.beginPath();
            S.trace(g, pts);
            g.clip();
            const sk = g.createLinearGradient(0, y - h * 0.6, 0, y + h * 0.5);
            sk.addColorStop(0, 'rgba(120,180,158,0.38)');
            sk.addColorStop(0.5, 'rgba(60,110,92,0.12)');
            sk.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = sk;
            g.fillRect(x - w, y - h, w * 2, h * 2);
            // the leaves at its edge mirrored dark in it
            for (let i = 0; i < 6; i++) {
                const a = -2.6 + i * 0.5;
                g.fillStyle = 'rgba(2,12,8,0.6)';
                G.oval(g, x + Math.cos(a) * w * 0.48, y + Math.sin(a) * h * 0.42, 36, 16, a);
            }
            // the shard of moon: a thick waxing crescent, lit on its right, its lower horn
            // drawn down into a drip, two ripples breaking it
            {
                const R = h * 0.34, cx = x - w * 0.1, cy = y - h * 0.08;
                const gl = g.createRadialGradient(cx, cy, 0, cx, cy, R * 2.4);
                gl.addColorStop(0, 'rgba(190,232,214,0.35)');
                gl.addColorStop(1, 'rgba(190,232,214,0)');
                g.fillStyle = gl;
                g.fillRect(cx - R * 2.4, cy - R * 2.4, R * 4.8, R * 4.8);
                const cr = [];
                for (let i = 0; i <= 30; i++) {
                    const a = -Math.PI / 2 + (i / 30) * Math.PI;
                    cr.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R * 1.25]);
                }
                for (let i = 30; i >= 0; i--) {
                    const a = -Math.PI / 2 + (i / 30) * Math.PI;
                    cr.push([cx - R * 0.15 + Math.cos(a) * R * 0.45, cy + Math.sin(a) * R * 1.2]);
                }
                g.save();
                g.shadowColor = 'rgba(214,246,232,0.9)';
                g.shadowBlur = R * 0.5 * S.pxScale(g);
                g.fillStyle = '#e4f4ec';
                G.poly(g, cr);
                G.poly(g, S.curve([[cx + R * 0.05, cy + R * 1.1], [cx + R * 0.25, cy + R * 1.5], [cx + R * 0.14, cy + R * 2.2], [cx + R * 0.06, cy + R * 1.55]], true, 6));
                g.restore();
                g.fillStyle = 'rgba(8,24,18,0.6)';
                g.fillRect(cx - R, cy + R * 0.25, R * 2, 1.6);
                g.fillRect(cx - R, cy + R * 0.75, R * 2, 1.4);
            }
            for (const [rx, ry, n] of [[x + w * 0.22, y + h * 0.18, 3], [x - w * 0.3, y + h * 0.22, 2]]) {
                for (let k = 0; k < n; k++) {
                    g.strokeStyle = `rgba(170,214,196,${0.45 - k * 0.12})`;
                    g.lineWidth = 1.3;
                    g.beginPath();
                    g.ellipse(rx, ry, 7 + k * 10, 3 + k * 4, 0, 0, TAU);
                    g.stroke();
                }
            }
            g.restore();
            g.strokeStyle = 'rgba(200,236,222,0.6)';
            g.lineWidth = 1.8;
            g.beginPath();
            S.trace(g, pts.slice(4, 18), false);
            g.stroke();
            g.strokeStyle = 'rgba(200,236,222,0.3)';
            g.lineWidth = 1;
            g.beginPath();
            S.trace(g, pts.slice(22, 36), false);
            g.stroke();
            // a fig leaf lying across its edge, half in the water
            const sp = G.figLeaf(3, 2.6, Q(res, 0.85), 'shade');
            G.shadow(g, sp, x + w * 0.46, y + h * 0.05, 0.75, { rot: 2.6, dx: 8, dy: 12, alpha: 0.5, blur: 10 });
            G.put(g, sp, x + w * 0.46, y + h * 0.05, 0.75, { rot: 2.6 });
        };
        const L2 = [];
        L2.push({
            // the body: the fig's crown, leaves of every kind lying on one another, limbs,
            // figs, agaves pushing in at the corners; on it the ghost horse, a frost star,
            // the moon in a puddle, a tree frog to find
            id: 'green-s-far', z: z + 150, box, brush: false,
            paint(g, res) {
                const r = Motion.rng('stratum-far');
                const gr = g.createLinearGradient(box.x, box.y, box.x + box.w * 0.6, box.y + box.h);
                gr.addColorStop(0, '#163a2c');
                gr.addColorStop(0.5, '#0a2018');
                gr.addColorStop(1, '#05120d');
                g.fillStyle = gr;
                g.beginPath();
                g.rect(box.x, box.y, box.w, box.h);
                for (let i = 0; i <= 72; i++) {
                    const th = (i / 72) * TAU, k = GAPS.f(th) * 1.3;
                    const x = Math.cos(th) * GAPS.rx * k, y = Math.sin(th) * GAPS.ry * k;
                    if (i) g.lineTo(x, y);
                    else g.moveTo(x, y);
                }
                g.fill('evenodd');
                G.figWood(g, [[-1260, 520], [-900, 380], [-640, 360], [-520, 420]], { w0: 64, w1: 30, seed: 'sf1', wrinkles: [[300, 60]], lichen: 0.7 });
                G.figWood(g, [[1260, -470], [900, -400], [640, -430], [540, -520]], { w0: 56, w1: 26, seed: 'sf2', lichen: 0.7 });
                foliage(g, res, { seed: 'stratum', gap: GAPS, pad: 150, step: 108, s: 1.1, under: 0.1, lime: 0, q: 0.85, vars: 3 });
                // the inner edge: leaves on long petioles reaching in over the gap from all
                // round it, overlapping, each its own size and turn
                {
                    const rs = Q(res, 0.85), items = [];
                    for (let i = 0; i < 30; i++) {
                        const th = (i / 30) * TAU + r() * 0.15, k = GAPS.f(th) * (1.22 + r() * 0.12);
                        const jx = Math.cos(th) * (GAPS.rx * k + 60), jy = Math.sin(th) * (GAPS.ry * k + 60);
                        const rot = th + Math.PI + (r() - 0.5) * 0.9, kind = r() < 0.18 ? 'under' : r() < 0.45 ? 'moon' : r() < 0.8 ? 'shade' : 'deep';
                        items.push({ jx, jy, rot, kind, v: kind === 'under' ? 4 + Math.floor(r() * 2) : Math.floor(r() * 3), s: 0.8 + r() * 0.35, fx: 0.7 + r() * 0.3, fy: 0.6 + r() * 0.4 });
                    }
                    for (const it of items) {
                        const sp = G.figLeaf(it.v, it.rot, rs, it.kind);
                        G.shadow(g, sp, it.jx, it.jy, it.s, { rot: it.rot, fx: it.fx, fy: it.fy, dx: 10, dy: 15, alpha: 0.5, blur: 12 });
                        G.put(g, sp, it.jx, it.jy, it.s, { rot: it.rot, fx: it.fx, fy: it.fy });
                    }
                }
                // figs among the leaves, in pairs and threes
                for (let i = 0; i < 16; i++) {
                    const a = r() * TAU, d = 560 + r() * 500, x = Math.cos(a) * d * 1.3, y = Math.sin(a) * d * 0.75, rot = r() * TAU, fs = 1.1 + r() * 0.4;
                    const sp = G.figFruit(Math.floor(r() * 5), rot, Q(res, 0.85));
                    G.shadow(g, sp, x, y, fs, { rot, dx: 8, dy: 12, alpha: 0.55, blur: 9 });
                    G.put(g, sp, x, y, fs, { rot });
                }
                // agaves pushing in at the corners
                G.agave(g, { x: -1130, y: 820, s: 0.95, seed: 11, n: 16, dry: 2, res: Q(res, 0.8) });
                G.agave(g, { x: 1150, y: 800, s: 0.9, seed: 12, n: 16, dry: 1, res: Q(res, 0.8) });
                G.agave(g, { x: 1290, y: 120, s: 0.6, seed: 13, n: 12, dry: 1, res: Q(res, 0.8) });
                relight(g, box, res, moonMap('stratum', box, { pools: 22, lights: 30, lift: 0.3, fall: 0.4, dark: [[0, 0, 520, 0.55]] }), { sun: 1.3, shade: 1.1 });
                veil(g, box, 'rgba(10,38,32,0.14)');
                // the things on it
                ghost(g, (q) => G.horse(q, { x: -400, y: 60, s: 0.9, alpha: 1, seed: 2 }));
                G.frost(g, { x: 380, y: -300, r: 100, rot: 0.2, seed: 'sfar' });
                puddle(g, 440, 350, 400, 150, res, r);
                G.frog(g, { x: -600, y: 360, s: 1.2, rot: -0.7 });
                S.tooth(g, box, { amp: 0.05 });
            },
        });
        L2.push({
            // the ship on its wisp of sea, the fish of shadow, a glass tambourine, a fig limb,
            // the moon moth on a leaf
            id: 'green-s-mid', z, box, brush: false,
            paint(g, res) {
                const r = Motion.rng('stratum-mid');
                limb(g, res, { seed: 'smid', path: [[1260, 620], [1000, 520], [780, 470], [660, 500]], w0: 44, w1: 12, figs: 0.7, kinds: ['moon', 'shade', 'moon'] });
                // a wisp of sea, dark, its swell lit by the moon, the ship on it
                const sx = -540, sy = -230;
                lay(g, (q) => {
                    G.softly(q, 16, (p) => {
                        const sg = p.createRadialGradient(sx, sy + 110, 10, sx, sy + 110, 320);
                        sg.addColorStop(0, 'rgba(6,22,16,0.95)');
                        sg.addColorStop(0.7, 'rgba(8,28,20,0.85)');
                        sg.addColorStop(1, 'rgba(8,28,20,0)');
                        p.fillStyle = sg;
                        p.beginPath();
                        p.ellipse(sx, sy + 110, 320, 170, -0.04, 0, TAU);
                        p.fill();
                    });
                    for (let i = 0; i < 60; i++) {
                        const y = sy + 4 + r() * 240, x = sx - 230 + r() * 460 * (1 - Math.abs(y - sy - 110) / 260);
                        G.line(q, [[x, y], [x + 14 + r() * 50, y + (r() - 0.5) * 2]], 1 + r(), `rgba(170,220,200,${0.15 + r() * 0.35})`);
                    }
                    G.ship(q, { x: sx, y: sy, s: 0.78, alpha: 1, seed: 3 });
                }, { alpha: 0.5, blur: 18, dx: 14, dy: 20 });
                G.softly(g, 16, (q) => G.ship(q, { x: sx, y: sy, s: 0.78, alpha: 0.35, seed: 3 }));
                lay(g, (q) => G.fish(q, { x: 520, y: -330, s: 0.85, rot: Math.PI - 0.08, seed: 2 }), { alpha: 0.55, blur: 16 });
                // the road of dawn the fish opens, behind it
                G.wind(g, { x: 700, y: -420, w: 560, h: 160 }, { seed: 'sdawn', n: 14, alpha: 0.3, dir: -0.08, len: 420, w: 16, cols: ['#a6d4c0', '#cfeade', '#7fb6a0'] });
                lay(g, (q) => G.tambourine(q, { x: 590, y: 120, r: 115, rot: -0.3, tilt: 0.35, seed: 21 }), { alpha: 0.35, blur: 10, dx: 10, dy: 14 });
                G.moth(g, { x: -330, y: 430, s: 1.2, rot: -0.9 });
                G.wind(g, box, { seed: 'smw', n: 16, alpha: 0.18, dir: -0.15, len: 700, w: 12, clear: (x, y) => Math.hypot(x / 520, y / 380) > 1 });
                S.tooth(g, box, { amp: 0.05 });
            },
        });
        L2.push({
            // the largest things, cut by the frame: a length of the high railing lying across,
            // the trail of blood on its hand-rail; a tin lantern; a big frost star
            id: 'green-s-near', z: z - 160, box, brush: { amp: 0.06 }, res: 0.85,
            paint(g, res) {
                lay(g, (q) => {
                    q.save();
                    q.translate(-640, 470);
                    q.rotate(-0.3);
                    const R = G.railing(q, { x0: -520, x1: 520, top: -150, bottom: 160, seed: 'srail', pitch: 40 });
                    const trail = [];
                    const rr = Motion.rng('strail');
                    for (let x = -480; x < 300; x += 40 + rr() * 50) trail.push([x, -157 + (rr() - 0.5) * 3]);
                    G.blood(q, trail, { seed: 'srail', r: 6.5 });
                    const b = R.bars.find((x) => x > 300) ?? 320;
                    G.blood(q, [[b, -80], [b + 1, 20]], { seed: 'sbar', r: 4.5, run: true });
                    q.restore();
                }, { alpha: 0.6, blur: 20, dx: 22, dy: 32 });
                lay(g, (q) => {
                    G.line(q, [[660, box.y - 10], [660, -594]], 3, 'rgba(10,24,18,0.9)');
                    G.lantern(q, { x: 660, y: -600, s: 1.75, seed: 31, turn: 0.4, shiver: 4 });
                }, { alpha: 0.55, blur: 20, dx: 22, dy: 32 });
                G.frost(g, { x: -760, y: -480, r: 150, rot: 0.35, seed: 'snear' });
                S.tooth(g, box, { amp: 0.05 });
            },
        });
        return L2;
    }

    // =========================================================== the loose stratum (round 8)
    // The same world come off its sheets: every thing its own layer, floating at its own depth
    // in the slab z − 280 … z + 280, turning slowly, nothing holding it (see
    // Tableau.green.loose below). Composed in rings round the axis, because the frame rolls:
    //   heroes (330 … 950 from the axis, all round, each at its own depth)
    //     the fig's limb with its leaves and figs and the tree frog on it · a second limb, a
    //     fig gone soft and the moon moth on its wood · the ghost ship on its tongue of sea ·
    //     the ghost horse on its crag of the thieving-cat mountain, agaves bristling on it ·
    //     an agave rosette · the prickly pear with its fruit · a tin lantern on its hook · a
    //     glass tambourine, cracked · the big frost star · the fish of shadow with the road of
    //     dawn behind it · the moon's icicle · a length of the high railing's hand-rail torn
    //     off, the trail of blood along it (the one warm colour) and a gecko on it
    //   matter (280 … 1500, denser inside): single fig leaves of every light (moonlit, in
    //     shade, deep, turned to their pale undersides, young), fig twigs, single figs, agave
    //     leaves broken off (blue, green, dry), prickly-pear pads, small frost stars,
    //     maidenhair fronds from the cistern, shards of the glass tambourines
    // The moon is one light field over the whole slab, in stratum units, painted into every
    // piece per pixel: the pieces share it as they drift.
    if (opt && opt.loose) return loose(z0);
    function loose(z) {
        const out = [], R = Motion.rng('green-loose');
        // ---------------------------------------------------------- one moon for all
        // > 0: in the moonlight (lifted, greener, cooler); < 0: in a pool of shade
        const field = (x, y) => S.clamp(-((x * 0.55 + y * 0.83) / 1500) * 0.55 + 0.42 * S.noise2(x / 560 + 7, y / 560, 41) + 0.22 * S.noise2(x / 210, y / 210 + 3, 42), -1, 1);
        const shine = (c, bx, res, k = 1) => {
            const W = c.width, H = c.height, q = c.getContext('2d', { willReadFrequently: true }), img = q.getImageData(0, 0, W, H), px = img.data;
            const st = 8, gw = Math.ceil(W / st) + 2, gh = Math.ceil(H / st) + 2, F = new Float32Array(gw * gh);
            for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) F[j * gw + i] = field(bx.x + (i * st) / res, bx.y + (j * st) / res) * k;
            for (let y = 0; y < H; y++) {
                const fy = y / st, j = Math.floor(fy), v = fy - j;
                for (let x = 0; x < W; x++) {
                    const o = (y * W + x) * 4;
                    if (!px[o + 3]) continue;
                    const fx = x / st, i = Math.floor(fx), u = fx - i, a = F[j * gw + i], b = F[j * gw + i + 1], c2 = F[(j + 1) * gw + i], d = F[(j + 1) * gw + i + 1];
                    const f = (a + (b - a) * u) * (1 - v) + (c2 + (d - c2) * u) * v;
                    if (f > 0) {
                        px[o] = Math.min(250, px[o] * (1 + 0.16 * f) + 3 * f);
                        px[o + 1] = Math.min(252, px[o + 1] * (1 + 0.34 * f) + 12 * f);
                        px[o + 2] = Math.min(248, px[o + 2] * (1 + 0.2 * f) + 6 * f);
                    } else {
                        px[o] *= 1 + 0.55 * f;
                        px[o + 1] *= 1 + 0.42 * f;
                        px[o + 2] *= 1 + 0.38 * f;
                    }
                }
            }
            q.putImageData(img, 0, 0);
        };
        // a piece: painted flat in stratum units on its own canvas, the moon laid on it, then
        // pasted (so a copy turned by the bench, or anything, still gets the same paint)
        const piece = (id, dz, bx, draw, o = {}) => {
            out.push({
                id: 'green-l-' + id, z: z + dz, loose: o.float ?? true, box: bx, res: o.res, brush: o.brush ?? false,
                paint(g, res) {
                    const c = canvas(bx.w * res, bx.h * res), q = c.getContext('2d');
                    q.setTransform(res, 0, 0, res, -bx.x * res, -bx.y * res);
                    draw(q, res);
                    if (o.shine !== 0) shine(c, bx, res, o.shine ?? 1);
                    g.drawImage(c, bx.x, bx.y, bx.w, bx.h);
                    c.width = c.height = 0;
                },
            });
        };
        const around = (x, y, hw, hh = hw) => ({ x: x - hw, y: y - hh, w: hw * 2, h: hh * 2 });
        const polar = (deg, d) => [Math.cos((deg * Math.PI) / 180) * d, Math.sin((deg * Math.PI) / 180) * d];
        const rot2 = (pts, a, cx, cy) => pts.map(([u, v]) => [cx + u * Math.cos(a) - v * Math.sin(a), cy + u * Math.sin(a) + v * Math.cos(a)]);
        const taken = []; // [x, y, dz, radius] of what is placed, so the matter falls between

        // ---------------------------------------------------------- heroes
        const hero = (id, deg, d, dz, rad, bx, draw, o) => {
            const [x, y] = polar(deg, d);
            taken.push([x, y, dz, rad]);
            piece(id, dz, bx(x, y), (g, res) => draw(g, res, x, y), o);
        };
        // 1 · the fig's limb: wood with its stipule rings, leaves at the nodes, figs in the
        // axils, the bud at its tip, and the tree frog on the wood
        hero('limb', 0, 600, -190, 320, (x, y) => around(x, y, 720), (g, res, x, y) => {
            const path = rot2([[-280, 70], [-110, 20], [60, -10], [250, -80]], -0.25, x, y);
            const W = limb(g, res, { seed: 'loose1', path, w0: 34, w1: 10, figs: 0.7, scars: 0.15, kinds: ['verd', 'vshade', 'verd', 'vunder'], q: 1 });
            const p = W.at(W.total * 0.36);
            G.frog(g, { x: p.x + Math.sin(p.a) * p.w * 0.3, y: p.y - Math.cos(p.a) * p.w * 0.3 - 8, s: 1.15, rot: p.a + 0.15 });
        });
        // 2 · a second limb, thinner, the moon moth resting on its wood
        hero('limb2', 333, 440, 250, 240, (x, y) => around(x, y, 520), (g, res, x, y) => {
            const path = rot2([[-200, 40], [-60, 0], [90, -30], [200, -10]], 0.9, x, y);
            const W = limb(g, res, { seed: 'loose2', path, w0: 22, w1: 8, figs: 0.9, scars: 0.3, kinds: ['vshade', 'verd', 'lime'], q: 1 });
            const p = W.at(W.total * 0.55);
            G.moth(g, { x: p.x, y: p.y, s: 1.25, rot: p.a - 1.3 });
        });
        // 2b · a heavy bough, near and large (the frame cuts it), leaves of every light
        hero('bough', 200, 900, -270, 360, (x, y) => around(x, y, 820), (g, res, x, y) => {
            const path = rot2([[-360, 60], [-150, 20], [60, -30], [300, -40], [400, -110]], 0.5, x, y);
            limb(g, res, { seed: 'loose3', path, w0: 46, w1: 12, figs: 0.6, scars: 0.12, kinds: ['verd', 'vshade', 'vdeep', 'verd', 'vunder'], s: 1.1, q: 0.9 });
        });
        // 3 · the ghost ship on its own tongue of sea, its reflection broken by the swell
        hero('ship', 62, 600, 200, 300, (x, y) => ({ x: x - 420, y: y - 500, w: 840, h: 660 }), (g, res, x, y) => {
            G.ship(g, { x: x - 10, y: y + 80, s: 1.02, alpha: 0.95, seed: 3, sea: true });
        }, { brush: { amp: 0.05 } });
        // 4 · the ghost horse on a crag of the mountain, agaves bristling on it
        hero('horse', 272, 560, -230, 260, (x, y) => around(x, y, 360), (g, res, x, y) => crag(g, res, x, y), { brush: { amp: 0.05 } });
        // 5 · an agave rosette, the heart clasped, dry leaves at its foot
        hero('agave', 125, 760, -250, 360, (x, y) => around(x, y, 620), (g, res, x, y) => {
            G.agave(g, { x, y: y + 180, s: 0.9, seed: 31, n: 18, dry: 3, res: Q(res, 0.9) });
        });
        // 6 · the prickly pear with its fruit on the top rims
        hero('opuntia', 305, 800, 100, 340, (x, y) => around(x, y, 680), (g, res, x, y) => {
            G.opuntia(g, { x, y: y + 180, s: 0.9, seed: 6, n: 9, res: Q(res, 0.9) });
        });
        // 7 · a tin lantern on its hook and a twist of wire
        hero('lantern', 95, 460, -40, 220, (x, y) => ({ x: x - 200, y: y - 340, w: 400, h: 760 }), (g, res, x, y) => {
            const top = y - 250;
            G.line(g, S.curve([[x - 18, top - 70], [x - 30, top - 46], [x - 8, top - 30], [x, top - 6]], false, 8), 2.6, 'rgba(10,26,18,0.9)');
            G.line(g, S.curve([[x - 19, top - 71], [x - 31, top - 47]], false, 4), 0.9, 'rgba(190,220,206,0.6)');
            G.lantern(g, { x, y: top, s: 1.45, seed: 31, turn: 0.4, shiver: 0 });
            tinWear(g, { x: x - 130, y: top - 80, w: 260, h: 560 });
        }, { brush: { amp: 0.08 } });
        // 8 · a glass tambourine, struck and cracked
        hero('pandero', 152, 420, 240, 180, (x, y) => around(x, y, 300), (g, res, x, y) => {
            G.tambourine(g, { x, y, r: 150, rot: -0.35, tilt: 0.3, seed: 21 });
        }, { brush: { amp: 0.04 } });
        // 9 · the big frost star
        hero('frost', 215, 380, 150, 150, (x, y) => around(x, y, 240), (g, res, x, y) => {
            G.frost(g, { x, y, r: 140, rot: 0.3, seed: 'lbig' });
        });
        // 10 · the fish of shadow and the road of dawn it opens behind it
        hero('fish', 185, 620, 60, 280, (x, y) => around(x, y, 620, 460), (g, res, x, y) => {
            const a = Math.PI + 0.2;
            G.wind(g, { x: x + 60, y: y - 50, w: 220, h: 110 }, { seed: 'ldawn', n: 18, alpha: 0.34, dir: a - Math.PI, len: 200, w: 13, cols: ['#a6d4b0', '#d2ecd0', '#7fb68c'] });
            G.fish(g, { x, y, s: 1.1, rot: a, seed: 2 });
        }, { brush: { amp: 0.04 } });
        // 11 · the moon's icicle: the thick crescent drawn down into a drip
        hero('icicle', 32, 380, -100, 150, (x, y) => around(x, y, 240, 300), (g, res, x, y) => {
            moonIcicle(g, x, y - 60, 70);
        });
        // 12 · the hand-rail of the high railing, torn off with two scrolls and a stub of bar,
        // the trail of blood along it, water beading under it, a gecko on it
        hero('rail', 242, 700, -20, 300, (x, y) => around(x, y, 420), (g, res, x, y) => handrail(g, x, y, -0.35));

        // ---------------------------------------------------------- matter
        // fall between: a spot at a depth where nothing of its size is already near
        const spot = (rad, d0, d1, seed) => {
            for (let k = 0; k < 60; k++) {
                const a = R() * TAU, d = d0 + (d1 - d0) * Math.pow(R(), 1.8), dz = -270 + R() * 540, x = Math.cos(a) * d, y = Math.sin(a) * d;
                if (taken.some(([X, Y, Z, rr]) => Math.abs(Z - dz) < 150 && Math.hypot(X - x, Y - y) < (rr + rad) * 0.75)) continue;
                taken.push([x, y, dz, rad]);
                return { x, y, dz };
            }
            const a = R() * TAU, d = d0 + (d1 - d0) * R();
            return { x: Math.cos(a) * d, y: Math.sin(a) * d, dz: -270 + R() * 540 };
        };
        // single fig leaves: every one its own drawing, light, size and turn
        const kinds = ['verd', 'verd', 'vshade', 'verd', 'vdeep', 'vunder', 'verd', 'vshade', 'lime', 'verd', 'vshade', 'vunder', 'vdeep', 'verd', 'vshade'];
        for (let i = 0; i < 32; i++) {
            const s = 0.45 + R() * 0.38, kind = kinds[i % kinds.length], rot = R() * TAU, fx = 0.7 + R() * 0.3, fy = 0.6 + R() * 0.4, v = 20 + i;
            const p = spot(130 * s, 280, i < 26 ? 1000 : 1450);
            piece('leaf' + i, p.dz, around(p.x, p.y, 360 * s + 20), (g, res) => {
                const sp = G.figLeaf(v, rot, Q(res, 0.8), kind), off = sp.G.L * 0.42 * s * fx;
                G.put(g, sp, p.x - Math.cos(rot) * off, p.y - Math.sin(rot) * off, s, { rot, fx, fy });
            });
        }
        // fig twigs: a short shoot, two leaves, a fig, the bud
        for (let i = 0; i < 14; i++) {
            const p = spot(170, 300, 1000), a = R() * TAU, ts = 0.5 + R() * 0.2;
            piece('twig' + i, p.dz, around(p.x, p.y, 420), (g, res) => {
                const path = rot2([[-120, 10], [-30, -4], [60, 6], [130, -6]], a, p.x, p.y);
                limb(g, res, { seed: 'ltwig' + i, path, w0: 13, w1: 5, figs: 0.7, scars: 0.15, kinds: i % 3 ? ['verd', 'vshade', 'verd'] : ['vdeep', 'vunder', 'lime'], s: ts, q: 0.8 });
            });
        }
        // single figs, one with its broken stalk bleeding latex
        for (let i = 0; i < 7; i++) {
            const p = spot(50, 280, 900), rot = R() * TAU, fs = 1.4 + R() * 0.6;
            piece('fig' + i, p.dz, around(p.x, p.y, 150), (g, res) => {
                const sp = G.figFruit(10 + i, rot, Q(res, 0.9));
                G.put(g, sp, p.x, p.y, fs, { rot });
                if (i === 1) {
                    const c = Math.cos(rot), sn = Math.sin(rot), tx = sp.top[0] * fs, ty = sp.top[1] * fs;
                    G.latex(g, p.x + tx * c - ty * sn, p.y + tx * sn + ty * c, 3.2);
                    G.latex(g, p.x + tx * c - (ty + 9) * sn + 3, p.y + tx * sn + (ty + 9) * c, 2.2);
                }
            });
        }
        // agave leaves broken off the mountain: blue, green, one dry and split
        const agk = ['blue', 'green', 'dry', 'blue', 'blue', 'dry', 'green'];
        for (let i = 0; i < 7; i++) {
            const len = 240 + R() * 160, wid = 50 + R() * 30, rot = R() * TAU, p = spot(len * 0.45, 340, i < 5 ? 1000 : 1400);
            piece('agleaf' + i, p.dz, around(p.x, p.y, len * 0.62 + 40), (g, res) => {
                const sp = G.agaveLeaf(40 + i, rot, Q(res, 0.85), agk[i], len, wid);
                G.put(g, sp, p.x - Math.cos(rot) * len * 0.5, p.y - Math.sin(rot) * len * 0.5, 1, { rot });
            });
        }
        // prickly-pear pads, a young one, one with a fruit on its rim
        for (let i = 0; i < 5; i++) {
            const w = 140 + R() * 70, h = w * (0.68 + R() * 0.1), rot = R() * TAU, p = spot(w * 0.55, 320, i < 3 ? 1000 : 1400);
            piece('pad' + i, p.dz, around(p.x, p.y, w * 0.75 + 40), (g, res) => {
                const sp = G.padSprite(50 + i, rot, Q(res, 0.85), Math.round(w / 10) * 10, Math.round(h / 10) * 10, i === 2);
                G.put(g, sp, p.x, p.y, 1, { rot });
                if (i === 4) {
                    const fsp = G.padSprite(60, rot, Q(res, 0.85), 54, 40, true);
                    G.put(g, fsp, p.x + Math.cos(rot) * (w * 0.5 + 18), p.y + Math.sin(rot) * (w * 0.5 + 18), 1, { rot });
                }
            });
        }
        // small frost stars, no two alike
        for (let i = 0; i < 6; i++) {
            const rr = 26 + R() * 46, p = spot(rr, 290, 1000), rot = R();
            piece('star' + i, p.dz, around(p.x, p.y, rr * 1.5 + 12), (g) => G.frost(g, { x: p.x, y: p.y, r: rr, rot, seed: 'lstar' + i, glow: 0.7 }));
        }
        // maidenhair fronds from the cistern's damp joints
        for (let i = 0; i < 4; i++) {
            const p = spot(80, 290, 950), a = R() * TAU;
            piece('fern' + i, p.dz, around(p.x, p.y, 230), (g) => {
                const rr = Motion.rng('lfern' + i);
                g.save();
                g.translate(p.x, p.y);
                fern(g, a, 70, rr);
                g.restore();
            }, { brush: { amp: 0.05 } });
        }
        // shards of the glass tambourines: a jingle pair on its pin, broken panes
        for (let i = 0; i < 4; i++) {
            const p = spot(60, 290, 1000), a = R() * TAU, sz = 50 + R() * 50;
            piece('glass' + i, p.dz, around(p.x, p.y, sz * 1.6 + 20), (g) => shard(g, p.x, p.y, sz, a, i));
        }
        return out;

        // ---------------------------------------------------------- drawers for the pieces
        // a crag of the thieving-cat mountain: rock in facets, cracks, lichen, grass, two
        // agaves bristling, and the ghost horse standing on it
        function crag(g, res, x, y) {
            const r = Motion.rng('lcrag'), top = y + 90;
            // the crest: a summit to the right, a saddle where the horse stands, the rock broken
            // off below in a sharp underside (a piece of the mountain, not a ground)
            const crest = [];
            for (let i = 0; i <= 20; i++) {
                const t = i / 20, u = -220 + 450 * t;
                crest.push([u, -8 * Math.sin(t * Math.PI) - 34 * Math.exp(-Math.pow((t - 0.86) / 0.07, 2)) - 12 * Math.exp(-Math.pow((t - 0.08) / 0.06, 2)) + (r() - 0.5) * 7]);
            }
            const under = [[232, 18], [200, 52], [176, 60], [150, 98], [102, 112], [70, 150], [34, 168], [6, 150], [-30, 160], [-62, 128], [-110, 118], [-150, 84], [-182, 70], [-222, 22]];
            const outline = [...crest, ...under].map(([u, v]) => [u + (r() - 0.5) * 3, v]);
            const RAMP = [[0, '#05100b'], [0.22, '#10251b'], [0.42, '#22412f'], [0.58, '#3a5e47'], [0.72, '#5d8269'], [0.86, '#8fb096'], [1, '#c9dcc6']];
            const sp = G.memo('lcrag@' + res, () => S.form({
                box: S.bbox(outline, 8), res: Q(res, 1), seed: 'lcrag', light: S.LIGHT, relief: 0.55,
                mask: (q) => G.poly(q, outline), ramp: RAMP, soft: 0.85,
                height: (u, v) => 6 * S.noise2(u * 0.02, v * 0.03, 5) + 3 * S.noise2(u * 0.08, v * 0.06, 6) + 2.4 * Math.abs(S.noise2(u * 0.015 + v * 0.01, v * 0.05, 7)),
                mottle: { amp: 0.1, freq: 0.02 }, stroke: { amp: 0.05, freq: 0.05, tone: 6 },
                edge: { rough: 2, freq: 0.25, amp: 1 },
                marks: (q) => {
                    // bedding planes tilted with the mountain, joints across them, the brush's mix
                    for (let i = 0; i < 9; i++) {
                        const v0 = 12 + i * 17 + (r() - 0.5) * 6, pts = [];
                        for (let k = 0; k <= 12; k++) pts.push([-230 + k * 40, v0 + k * 2.2 + (r() - 0.5) * 4]);
                        S.dab(q, pts, { w: 3 + r() * 4, color: '#000', alpha: 0.35 + r() * 0.2, bristles: 4, seed: 'lcb' + i, dry: 0.5, taper: 0.6 });
                        S.dab(q, pts.map(([u, v]) => [u, v - 3]), { w: 2 + r() * 3, color: '#fff', alpha: 0.18 + r() * 0.15, bristles: 4, seed: 'lcl' + i, dry: 0.6, taper: 0.6 });
                    }
                    for (let i = 0; i < 14; i++) {
                        let u = -200 + r() * 400, v = r() * 60;
                        const pts = [[u, v]];
                        for (let k = 0; k < 4; k++) pts.push([(u += (r() - 0.5) * 14), (v += 8 + r() * 12)]);
                        S.dab(q, pts, { w: 2 + r() * 2, color: '#000', alpha: 0.5, bristles: 3, seed: 'lcj' + i, dry: 0.3, taper: 0.5 });
                    }
                    for (let i = 0; i < 40; i++) S.dab(q, [[-210 + r() * 420, r() * 140], [-210 + r() * 420, r() * 140]].map(([u, v], k, a) => (k ? [a[0][0] + (u - a[0][0]) * 0.08, a[0][1] + (v - a[0][1]) * 0.05] : [u, v])), { w: 6 + r() * 10, color: r() < 0.5 ? '#fff' : '#000', alpha: 0.12 + r() * 0.12, bristles: 6, seed: 'lcm' + i, dry: 0.5, taper: 0.8 });
                },
                tint: (u, v, tone, rgb) => {
                    // lichen in crusts on the lit faces, moss in the shade
                    const li = S.smooth(0.35, 0.6, S.noise2(u * 0.05 + 3, v * 0.05, 11)) * S.smooth(0.45, 0.7, tone);
                    if (li > 0) G.toward(rgb, 170 + 50 * tone, 186 + 40 * tone, 140 + 30 * tone, li * 0.45);
                    const mo = S.smooth(0.3, 0.6, S.noise2(u * 0.04, v * 0.06 + 5, 12)) * S.smooth(0.5, 0.2, tone);
                    if (mo > 0) G.toward(rgb, 30, 74, 34, mo * 0.6);
                },
                over: (q) => {
                    for (let i = 0; i < 50; i++) {
                        q.fillStyle = `rgba(${170 + r() * 50},${196 + r() * 40},${150 + r() * 40},${0.25 + r() * 0.4})`;
                        G.disc(q, -200 + r() * 400, r() * 120, 0.8 + r() * 2.2);
                    }
                },
            }));
            G.put(g, sp, x, top, 1, { rot: 0 });
            // the agaves bristling on its back, behind and beside the horse
            G.agave(g, { x: x - 160, y: top + 2, s: 0.22, seed: 41, n: 13, dry: 1, res: Q(res, 1.1) });
            G.agave(g, { x: x + 186, y: top - 30, s: 0.17, seed: 42, n: 12, dry: 1, res: Q(res, 1.1) });
            // the horse, a ghost but solid enough to stand on it, mane in the wind
            G.horse(g, { x: x - 30, y: top - 4, s: 0.95, alpha: 1, seed: 2, form: true });
            // grass at its hooves, blown the same way as its mane; stones
            for (let i = 0; i < 80; i++) {
                const t = r(), bx = x - 215 + 440 * t, by = top + crest[Math.round(t * 20)][1] + 3, l = 7 + r() * 18, a = -Math.PI / 2 - 0.45 - r() * 0.5;
                G.taper(g, [[bx, by], [bx + Math.cos(a) * l * 0.5, by + Math.sin(a) * l * 0.5], [bx + Math.cos(a) * l, by + Math.sin(a) * l]], 2.2, 0.3, r() < 0.4 ? '#24502c' : r() < 0.6 ? '#4f8a4c' : '#8cbc7e');
            }
        }
        // the hand-rail torn off the high railing: the flat rail, its stub of bar and two
        // scrolls under it, both ends broken, the blood along its top, beads of water under it
        function handrail(g, x, y, a) {
            const r = Motion.rng('lrail');
            g.save();
            g.translate(x, y);
            g.rotate(a);
            // a C-scroll: a spiral that runs out into a tail
            const scroll = (cx, cy, r0, sg, a0) => {
                const p = [];
                for (let k = 0; k <= 28; k++) {
                    const t = k / 28, rr = r0 * (1 - 0.62 * t), th = a0 + sg * t * TAU * 1.15;
                    p.push([cx + Math.cos(th) * rr, cy + Math.sin(th) * rr]);
                }
                return p.reverse();
            };
            const bars = [-150, -40, 110];
            bars.forEach((bx, i) => {
                const len = 150 + r() * 60, bend = i === 2 ? 26 : (r() - 0.5) * 6;
                G.bar(g, [[bx, 8], [bx + bend * 0.2, len * 0.5], [bx + bend, len]], 8, 'lrb' + i, { twist: i === 1 ? 0.55 : 0 });
                // the snapped end: a bright raw face of iron
                g.fillStyle = 'rgba(176,196,184,0.85)';
                G.oval(g, bx + bend, len + 1, 4.5, 2.2, 0.1);
            });
            for (const [cx, sg, a0] of [[-96, 1, 0.4], [30, -1, 2.6]]) {
                G.bar(g, scroll(cx, 52, 30, sg, a0), 5, 'lrs' + cx, { raw: false, shadeA: 0.7 });
                g.fillStyle = '#0e2219';
                g.fillRect(cx - 4, 20, 8, 11);
                g.fillStyle = 'rgba(120,170,146,0.6)';
                g.fillRect(cx - 4, 20, 8, 2);
            }
            G.bar(g, [[-260, 26], [260, 26]], 6.5, 'lrr', {});
            const hand = G.bar(g, [[-280, 0], [-100, -1], [100, 0], [280, 3]], 17, 'lrh', { shadeA: 1.3 });
            // the snapped ends of the rails: jagged, the fibre of the iron
            for (const [ex, ey, w] of [[-282, 0, 9], [281, 3, 9], [-262, 26, 4], [262, 26, 4]]) {
                g.fillStyle = 'rgba(150,176,164,0.8)';
                G.poly(g, [[ex, ey - w], [ex + (ex > 0 ? 4 : -4), ey - w * 0.4], [ex + (ex > 0 ? -1 : 1), ey], [ex + (ex > 0 ? 5 : -5), ey + w * 0.5], [ex, ey + w]]);
            }
            // flat top worn bright by hands
            g.fillStyle = 'rgba(150,200,176,0.45)';
            g.fillRect(-280, -7.5, 560, 2.4);
            for (let xx = -270; xx < 270; xx += 6 + r() * 30) {
                g.fillStyle = `rgba(190,226,210,${0.15 + r() * 0.35})`;
                g.fillRect(xx, -7.5, 3 + r() * 20, 1.4);
            }
            // the trail of blood: drops along the top, one run down a bar where a hand held
            const trail = [];
            for (let xx = -250; xx < 200; xx += 34 + r() * 40) trail.push([xx, -7 + (r() - 0.5) * 3]);
            G.blood(g, trail, { seed: 'lrail', r: 6 });
            G.blood(g, [[-40, 40], [-39, 100]], { seed: 'lbar', r: 3.6, run: true });
            for (let i = 0; i < 16; i++) G.drop(g, -260 + r() * 520, 9 + 1.6 + r() * 2, 1.6 + r() * r() * 3.2, r() < 0.3 ? 0.8 : 0.2);
            for (let i = 0; i < 8; i++) G.drop(g, -250 + r() * 500, 30 + r() * 2, 1.3 + r() * 2, 0.6);
            // the gecko, clinging under the rail by the left scroll
            gecko(g, -190, 40, 0.95, 0.25);
            g.restore();
        }
        // the wear of soldered tin, laid on the lantern's paint only: brushed streaks down the
        // sheet, dents (a dark and a lit lip), solder run along the seams, spots of verdigris
        // and of rust where the rain stood, a thumb-polished patch
        function tinWear(g, bx) {
            const r = Motion.rng('ltin');
            g.save();
            g.globalCompositeOperation = 'source-atop';
            for (let i = 0; i < 260; i++) {
                const x = bx.x + r() * bx.w, y = bx.y + r() * bx.h, l = 10 + r() * 40;
                G.line(g, [[x, y], [x + (r() - 0.5) * 2, y + l]], 0.5 + r() * 0.6, r() < 0.5 ? `rgba(240,250,246,${0.05 + r() * 0.1})` : `rgba(0,10,6,${0.06 + r() * 0.12})`);
            }
            for (let i = 0; i < 9; i++) {
                const x = bx.x + bx.w * (0.2 + r() * 0.6), y = bx.y + bx.h * (0.2 + r() * 0.7), rd = 4 + r() * 9;
                g.fillStyle = 'rgba(0,10,6,0.22)';
                G.oval(g, x + rd * 0.25, y + rd * 0.3, rd, rd * 0.7, r());
                g.fillStyle = 'rgba(236,248,242,0.2)';
                G.oval(g, x - rd * 0.3, y - rd * 0.3, rd * 0.6, rd * 0.35, r());
            }
            for (let i = 0; i < 70; i++) {
                const x = bx.x + r() * bx.w, y = bx.y + bx.h * (0.3 + r() * 0.7), rust = r() < 0.35;
                g.fillStyle = rust ? `rgba(70,52,34,${0.25 + r() * 0.3})` : `rgba(${60 + r() * 40},${150 + r() * 50},${120 + r() * 40},${0.25 + r() * 0.35})`;
                G.oval(g, x, y, 1 + r() * 3.5, 0.8 + r() * 2.2, r() * 3);
            }
            g.restore();
        }
        // the moon's icicle, loose: the thick waxing crescent as ice, its seas showing through
        // as pale grey-green shadows, frozen cracks, its lower horn drawn down into a drip with a
        // drop at its point, a cold halo; no water under it (it is the moon taken off the cistern)
        function moonIcicle(g, x, y, Rm) {
            const r = Motion.rng('lmoon'), shape = [];
            for (let i = 0; i <= 48; i++) {
                const a = -Math.PI / 2 + (i / 48) * Math.PI;
                shape.push([x + Math.cos(a) * Rm, y + Math.sin(a) * Rm * 1.3]);
            }
            // the drip: the lower horn running down
            shape.push([x + Rm * 0.02, y + Rm * 1.42], [x + Rm * 0.1, y + Rm * 1.75], [x + Rm * 0.06, y + Rm * 2.35], [x - Rm * 0.02, y + Rm * 1.8], [x - Rm * 0.08, y + Rm * 1.34]);
            for (let i = 48; i >= 0; i--) {
                const a = -Math.PI / 2 + (i / 48) * Math.PI;
                shape.push([x - Rm * 0.16 + Math.cos(a) * Rm * 0.46, y + Math.sin(a) * Rm * 1.26]);
            }
            const halo = g.createRadialGradient(x + Rm * 0.3, y, Rm * 0.4, x + Rm * 0.3, y, Rm * 2.4);
            halo.addColorStop(0, 'rgba(196,236,212,0.32)');
            halo.addColorStop(0.5, 'rgba(150,210,180,0.1)');
            halo.addColorStop(1, 'rgba(150,210,180,0)');
            g.fillStyle = halo;
            G.disc(g, x + Rm * 0.3, y, Rm * 2.4);
            g.save();
            g.shadowColor = 'rgba(214,248,230,0.85)';
            g.shadowBlur = Rm * 0.35 * S.pxScale(g);
            const body = g.createLinearGradient(x - Rm * 0.2, y - Rm, x + Rm, y + Rm * 1.5);
            body.addColorStop(0, '#f2fbf4');
            body.addColorStop(0.45, '#d4ecdc');
            body.addColorStop(1, '#93c2a8');
            g.fillStyle = body;
            G.poly(g, shape);
            g.restore();
            g.save();
            g.beginPath();
            S.trace(g, shape);
            g.clip();
            // the seas, soft, where the ice is thicker
            G.softly(g, 4, (q) => {
                for (const [u, v, rx, ry, al] of [[0.62, -0.5, 0.2, 0.26, 0.3], [0.78, 0.1, 0.16, 0.3, 0.26], [0.55, 0.55, 0.22, 0.2, 0.22], [0.86, -0.1, 0.08, 0.12, 0.3], [0.4, -0.95, 0.1, 0.08, 0.2]]) {
                    q.fillStyle = `rgba(96,140,118,${al})`;
                    G.oval(q, x + u * Rm, y + v * Rm, rx * Rm, ry * Rm, 0.3);
                }
            });
            // the terminator: the inner edge a little shaded, the ice thick and cold there
            G.softly(g, 6, (q) => {
                q.strokeStyle = 'rgba(70,120,96,0.35)';
                q.lineWidth = Rm * 0.12;
                q.beginPath();
                for (let i = 0; i <= 30; i++) {
                    const a = -Math.PI / 2 + (i / 30) * Math.PI, px = x - Rm * 0.16 + Math.cos(a) * Rm * 0.46, py = y + Math.sin(a) * Rm * 1.26;
                    if (i) q.lineTo(px, py);
                    else q.moveTo(px, py);
                }
                q.stroke();
            });
            // craters: rims lit on the side away from the moon's own light, small pits
            for (let i = 0; i < 16; i++) {
                const a = -1.3 + r() * 2.6, d = Rm * (0.6 + r() * 0.35), cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d * 1.28, cr = 1.5 + r() * 4.5;
                g.strokeStyle = 'rgba(90,136,112,0.45)';
                g.lineWidth = 0.9;
                g.beginPath();
                g.arc(cx, cy, cr, 0.6, 3.4);
                g.stroke();
                g.strokeStyle = 'rgba(255,255,255,0.6)';
                g.beginPath();
                g.arc(cx, cy, cr, 3.6, 6.1);
                g.stroke();
            }
            // frozen cracks, and the grain of the ice along the drip
            for (let i = 0; i < 6; i++) {
                let a = -1.2 + r() * 2.4, px = x + Math.cos(a) * Rm * 0.98, py = y + Math.sin(a) * Rm * 1.27;
                const pts = [[px, py]];
                for (let k = 0; k < 5; k++) pts.push([(px -= 4 + r() * 6), (py += (r() - 0.5) * 9)]);
                G.line(g, pts, 0.8, 'rgba(255,255,255,0.75)');
                G.line(g, pts.map(([u, v]) => [u + 0.8, v + 0.9]), 0.6, 'rgba(70,116,94,0.5)');
            }
            for (let k = 0; k < 7; k++) G.line(g, [[x + Rm * (0.0 + k * 0.012), y + Rm * (1.3 + k * 0.05)], [x + Rm * (0.05 + k * 0.006), y + Rm * (1.7 + k * 0.08)]], 0.6, `rgba(${k % 2 ? '255,255,255' : '80,130,104'},0.5)`);
            g.restore();
            // the drop at the point of the drip, about to fall
            G.drop(g, x + Rm * 0.07, y + Rm * 2.47, 4.6, 0.9);
            // its lit rim
            G.line(g, shape.slice(2, 40), 1.2, 'rgba(255,255,255,0.85)');
        }
        // a shard of a glass tambourine: a broken pane with a lit edge and a crack, or a jingle
        // pair on its pin
        function shard(g, x, y, sz, a, i) {
            const r = Motion.rng('lshard' + i);
            g.save();
            g.translate(x, y);
            g.rotate(a);
            if (i % 2) {
                // two jingles on a pin: discs of glass domed, a rim of light, the pin through
                for (const [ox, oy] of [[-sz * 0.12, 0], [sz * 0.12, sz * 0.06]]) {
                    const rr = sz * 0.42;
                    g.fillStyle = 'rgba(2,12,8,0.35)';
                    G.oval(g, ox + 3, oy + 4, rr, rr * 0.55);
                    g.fillStyle = 'rgba(150,214,184,0.22)';
                    G.oval(g, ox, oy, rr, rr * 0.55);
                    g.strokeStyle = 'rgba(226,248,236,0.85)';
                    g.lineWidth = 1.6;
                    g.beginPath();
                    g.ellipse(ox, oy, rr, rr * 0.55, 0, Math.PI * 0.9, Math.PI * 1.75);
                    g.stroke();
                    g.strokeStyle = 'rgba(40,90,70,0.6)';
                    g.lineWidth = 1;
                    g.beginPath();
                    g.ellipse(ox, oy, rr, rr * 0.55, 0, Math.PI * 1.9, Math.PI * 2.8);
                    g.stroke();
                    g.strokeStyle = 'rgba(220,246,232,0.5)';
                    g.beginPath();
                    g.ellipse(ox, oy, rr * 0.45, rr * 0.25, 0, Math.PI, Math.PI * 1.6);
                    g.stroke();
                    g.fillStyle = 'rgba(244,252,248,0.95)';
                    G.oval(g, ox - rr * 0.35, oy - rr * 0.22, rr * 0.12, rr * 0.05, -0.3);
                }
                G.line(g, [[0, -sz * 0.36], [sz * 0.02, sz * 0.4]], 2.2, 'rgba(8,24,16,0.9)');
                G.line(g, [[-0.8, -sz * 0.36], [-0.6, sz * 0.38]], 0.7, 'rgba(200,226,212,0.7)');
            } else {
                const pts = [];
                const n = 5 + Math.floor(r() * 3);
                for (let k = 0; k < n; k++) {
                    const t = (k / n) * TAU + (r() - 0.5) * 0.6, d = sz * (0.35 + r() * 0.65);
                    pts.push([Math.cos(t) * d, Math.sin(t) * d * 0.7]);
                }
                g.fillStyle = 'rgba(2,12,8,0.3)';
                G.poly(g, pts.map(([u, v]) => [u + 4, v + 5]));
                const gr = g.createLinearGradient(-sz, -sz, sz, sz);
                gr.addColorStop(0, 'rgba(206,240,222,0.42)');
                gr.addColorStop(0.5, 'rgba(110,180,150,0.16)');
                gr.addColorStop(1, 'rgba(40,100,76,0.3)');
                g.fillStyle = gr;
                G.poly(g, pts);
                // the edges: the broken face of the glass, bright where it faces the moon
                for (let k = 0; k < n; k++) {
                    const p = pts[k], q = pts[(k + 1) % n], nx = q[1] - p[1], ny = -(q[0] - p[0]), nl = Math.hypot(nx, ny) || 1;
                    const lit = -(nx / nl) * 0.6 - (ny / nl) * 0.66;
                    G.line(g, [p, q], lit > 0 ? 2 : 1.2, lit > 0 ? `rgba(236,252,244,${0.5 + lit * 0.45})` : 'rgba(20,60,44,0.7)');
                }
                // conchoidal ripples near a break, a crack across, a speck of light
                for (let k = 0; k < 3; k++) {
                    g.strokeStyle = `rgba(220,246,234,${0.35 - k * 0.08})`;
                    g.lineWidth = 0.8;
                    g.beginPath();
                    g.arc(pts[0][0], pts[0][1], 6 + k * 6, Math.PI * 0.6, Math.PI * 1.3);
                    g.stroke();
                }
                G.line(g, [pts[1], [(pts[1][0] + pts[3][0]) * 0.4, (pts[1][1] + pts[3][1]) * 0.45], [(pts[1][0] + pts[3][0]) * 0.5 + 3, (pts[1][1] + pts[3][1]) * 0.5]], 0.8, 'rgba(230,250,240,0.6)');
                g.fillStyle = 'rgba(250,255,252,0.9)';
                G.disc(g, pts[2][0] * 0.4, pts[2][1] * 0.4, 1.6);
            }
            g.restore();
        }
    }

    const L = [];
    // =========================================================== stratum 1 · the fig tree
    L.push({
        // the body: the fig's crown, deep, with the gap the camera goes through
        id: 'green-fig-far', z: z0 + D.s1[2], box, brush: false,
        paint(g, res) {
            const gr = g.createLinearGradient(box.x, box.y, box.x + box.w * 0.6, box.y + box.h);
            gr.addColorStop(0, '#16352a');
            gr.addColorStop(0.5, '#0b2018');
            gr.addColorStop(1, '#06130e');
            g.fillStyle = gr;
            g.beginPath();
            g.rect(box.x, box.y, box.w, box.h);
            for (let i = 0; i <= 72; i++) {
                const th = (i / 72) * TAU, k = GAP1.f(th) * 0.92;
                const x = Math.cos(th) * GAP1.rx * k, y = Math.sin(th) * GAP1.ry * k;
                if (i) g.lineTo(x, y);
                else g.moveTo(x, y);
            }
            g.fill('evenodd');
            // limbs deep in the crown
            G.figWood(g, [[-1260, 420], [-800, 260], [-460, 210], [-330, 240]], { w0: 70, w1: 34, seed: 'ff1', wrinkles: [[420, 60]], lichen: 0.6 });
            G.figWood(g, [[1260, -500], [820, -340], [470, -280], [330, -220]], { w0: 60, w1: 30, seed: 'ff2', lichen: 0.6 });
            G.figWood(g, [[200, 760], [300, 420], [440, 250], [700, 160], [1260, 180]], { w0: 54, w1: 26, seed: 'ff3', lichen: 0.6 });
            foliage(g, res, { seed: 'far', gap: GAP1, pad: 110, step: 112, s: 1.05, under: 0.06 });
            relight(g, box, res, moonMap('figfar', box, { pools: 26, lights: 30, lift: 0.3, fall: 0.45, dark: [[0, 0, 420, 0.6]] }), { sun: 1.1, shade: 1.2 });
            veil(g, box, 'rgba(10,38,32,0.2)');
            S.tooth(g, box, { amp: 0.05 });
        },
    });
    L.push({
        // the limbs that cross before the gap, with their figs, a frog, a moth, the wind
        id: 'green-fig-mid', z: z0 + D.s1[1], box, brush: false,
        paint(g, res) {
            const A = limb(g, res, { seed: 'a', path: [[-1260, 330], [-880, 250], [-560, 220], [-380, 250], [-300, 330], [-250, 450], [-230, 620]], w0: 58, w1: 16, gap: GAP1, wrinkles: [[690, 50]], figs: 0.7 });
            const B = limb(g, res, { seed: 'b', path: [[1260, -380], [900, -300], [600, -270], [400, -230], [250, -250], [120, -310], [0, -400]], w0: 50, w1: 12, gap: GAP1, figs: 0.6, kinds: ['moon', 'moon', 'shade', 'under'] });
            limb(g, res, { seed: 'c', path: [[1260, 330], [960, 300], [700, 270], [500, 290], [370, 360]], w0: 40, w1: 12, gap: GAP1, figs: 0.6, kinds: ['shade', 'moon', 'shade'] });
            limb(g, res, { seed: 'd', path: [[-1260, -420], [-980, -360], [-760, -330], [-560, -360], [-440, -440]], w0: 36, w1: 11, gap: GAP1, figs: 0.5, kinds: ['moon', 'shade', 'moon'] });
            // a broken stalk beading latex; the frog on the limb; the moth on a leaf
            const p = A.at(A.total * 0.42);
            G.figWood(g, [[p.x, p.y - 10], [p.x + 10, p.y - 40], [p.x + 14, p.y - 58]], { w0: 9, w1: 7, seed: 'stub', green: 0.2 });
            G.latex(g, p.x + 15, p.y - 58, 4.2);
            G.latex(g, p.x + 13, p.y - 47, 2.4);
            const q = A.at(A.total * 0.18);
            G.frog(g, { x: q.x + 10, y: q.y - 30, s: 1.1, rot: q.a - 0.2 });
            G.moth(g, { x: 520, y: -160, s: 1.2, rot: -2.5 });
            G.wind(g, box, { seed: 'm1', n: 26, alpha: 0.2, dir: -0.18, len: 800, w: 14, clear: (x, y) => GAP1.out(x, y, 40) });
            relight(g, box, res, moonMap('figmid', box, { pools: 12, lights: 30, lift: 0.4, fall: 0.3, lit: [[-420, -260, 160, 60, 0.7, 0.6], [380, -240, 140, 50, 0.7, 0.55], [-300, 330, 120, 50, 0.7, 0.4]] }), { sun: 1.6 });
            S.tooth(g, box, { amp: 0.05 });
        },
    });
    L.push({
        // what the camera brushes past: big leaves at the corners, the wind, a leaf torn off
        id: 'green-fig-near', z: z0 + D.s1[0], box, brush: false, res: 0.75,
        paint(g, res) {
            const rs = Q(res, 1.2);
            for (const [x, y, rot, s, kind, v] of [[-1060, -500, 0.5, 2.3, 'moon', 1], [-1100, 300, -0.4, 2.5, 'shade', 2], [1000, -470, 2.6, 2.2, 'shade', 3], [1060, 380, -2.6, 2.4, 'deep', 0], [-480, 640, -1.4, 1.9, 'under', 4], [420, -650, 1.8, 1.8, 'moon', 0], [1140, -40, 3.2, 1.9, 'deep', 1], [-1150, -60, 0.1, 1.8, 'moon', 2], [380, 640, -1.9, 1.7, 'shade', 3]]) {
                const sp = G.figLeaf(v, rot, rs, kind);
                G.shadow(g, sp, x, y, s, { rot, dx: 20, dy: 30, alpha: 0.5, blur: 20 });
                G.put(g, sp, x, y, s, { rot });
            }
            G.figWood(g, [[-1260, -260], [-900, -230], [-640, -300], [-520, -400]], { w0: 44, w1: 22, seed: 'n1', dens: 0.6 });
            // a leaf torn off, carried across in the wind
            const sp = G.figLeaf(5, -0.4, rs, 'under');
            G.put(g, sp, 330, 250, 0.9, { rot: -0.4, fy: 0.5 });
            G.wind(g, box, { seed: 'n1', n: 20, alpha: 0.28, dir: -0.15, len: 900, w: 26, clear: (x, y) => GAP1.out(x, y, 120) });
            veil(g, box, 'rgba(3,16,11,0.35)');
            S.tooth(g, box, { amp: 0.05 });
        },
    });

    // =========================================================== stratum 2 · the night
    L.push({
        // the body: the sky with its frost stars, the cat-mountain, the sea with the ghost
        // ship, the horse on the cat's shoulder; the pass under its belly
        id: 'green-night-far', z: z0 + D.s2[2], box, brush: { amp: 0.09, len: 12, drift: 0.05 },
        paint(g, res) {
            const r = Motion.rng('night');
            // sky: deep green above, a pale cold haze low and towards the moon's side
            // (its glow sits right above the cat's back, where the moon's haze lies)
            const sky = g.createLinearGradient(0, box.y, 0, -180);
            sky.addColorStop(0, '#03100a');
            sky.addColorStop(0.45, '#0d3124');
            sky.addColorStop(0.8, '#4a8a70');
            sky.addColorStop(1, '#c2e4d4');
            g.fillStyle = sky;
            g.fillRect(box.x, box.y, box.w, SEA - box.y + 10);
            const moon = g.createRadialGradient(-700, -620, 0, -700, -620, 1000);
            moon.addColorStop(0, 'rgba(190,226,210,0.5)');
            moon.addColorStop(1, 'rgba(170,214,196,0)');
            g.fillStyle = moon;
            g.fillRect(box.x, box.y, box.w, SEA - box.y);
            // clouds: long soft strokes lit on their top edges
            G.softly(g, 4, (q) => {
                for (let i = 0; i < 28; i++) {
                    const x = box.x + r() * box.w, y = box.y + 40 + r() * 520, len = 300 + r() * 700, pts = [];
                    for (let k = 0; k <= 16; k++) pts.push([x + len * (k / 16), y + Math.sin(k * 0.5 + i) * 10 - (k / 16) * 30]);
                    S.dab(q, pts, { w: 20 + r() * 40, color: r() < 0.5 ? '#3e7462' : '#163c30', alpha: 0.35 + r() * 0.3, bristles: 9, seed: 'cl' + i, dry: 0.5, taper: 0.9 });
                    S.dab(q, pts.map(([a, b]) => [a, b - 12]), { w: 6 + r() * 8, color: '#9ccab6', alpha: 0.18 + r() * 0.2, bristles: 5, seed: 'cle' + i, dry: 0.6, taper: 0.9 });
                }
            });
            // small stars
            for (let i = 0; i < 260; i++) {
                const x = box.x + r() * box.w, y = box.y + r() * 600;
                g.fillStyle = `rgba(214,240,228,${0.25 + r() * 0.6})`;
                G.disc(g, x, y, 0.6 + r() * r() * 2);
            }
            // the big stars of frost, high
            for (const [x, y, rad, rot] of [[-470, -380, 38, 0.2], [-320, -310, 20, 0.5], [190, -360, 42, 0.1], [520, -430, 34, 0.4], [780, -340, 24, 0.9], [-820, -380, 28, 0.3], [-420, -520, 24, 0.7], [380, -320, 16, 0.2], [-20, -440, 30, 0.6], [740, -560, 30, 0.15], [-700, -560, 26, 0.4], [60, -320, 14, 0.3]]) G.frost(g, { x, y, r: rad, rot, seed: 'sky' + x });
            // the sea
            const sea = g.createLinearGradient(0, SEA, 0, box.y + box.h);
            sea.addColorStop(0, '#24503f');
            sea.addColorStop(0.08, '#0f2c21');
            sea.addColorStop(1, '#040f0a');
            g.fillStyle = sea;
            g.fillRect(box.x, SEA, box.w, box.y + box.h - SEA);
            // the swell: long low waves, a dark trough under a lit crest, wider as they come near
            for (let i = 0; i < 160; i++) {
                const y = SEA + 4 + Math.pow(r(), 1.3) * 520, k = 1 + (y - SEA) / 120, x = box.x + r() * box.w, w = (40 + r() * 140) * k, pts = [];
                for (let j = 0; j <= 8; j++) pts.push([x + (w * j) / 8, y + Math.sin(j * 0.8 + i) * 1.5 * k]);
                G.line(g, pts, 1.2 * k, 'rgba(1,6,4,0.45)');
                G.line(g, pts.map(([a2, b]) => [a2 + w * 0.1, b - 1.6 * k]), 0.7 * k, `rgba(140,196,174,${0.12 + r() * 0.2})`);
            }
            // the moon's road on the water: broken scales of light from the left
            for (let i = 0; i < 520; i++) {
                const y = SEA + 6 + Math.pow(r(), 1.4) * 480, x = -700 + (r() - 0.5) * (240 + (y - SEA) * 1.8) + (y - SEA) * 0.4, w = 8 + r() * 40 * (1 + (y - SEA) / 200);
                g.fillStyle = `rgba(${170 + r() * 60},${214 + r() * 30},${196 + r() * 40},${0.12 + r() * 0.35})`;
                g.fillRect(x, y, w, 1.2 + r() * 2);
            }
            for (let i = 0; i < 300; i++) {
                const y = SEA + 4 + r() * 480, x = box.x + r() * box.w;
                g.fillStyle = `rgba(4,14,10,${0.2 + r() * 0.3})`;
                g.fillRect(x, y, 20 + r() * 80, 1 + r() * 2.5);
            }
            // the mountain: a cat arching its back
            const cat = S.curve(CAT, true, 10);
            g.save();
            g.beginPath();
            S.trace(g, cat);
            g.clip();
            const mg = g.createLinearGradient(-800, -500, 600, 300);
            mg.addColorStop(0, '#163a2c');
            mg.addColorStop(0.4, '#071a12');
            mg.addColorStop(1, '#020906');
            g.fillStyle = mg;
            g.fillRect(box.x, box.y, box.w, box.h);
            // its slopes: strokes down the fall line, terraces, olive groves in rows, rocks
            G.softly(g, 1.2, (q) => {
                for (let i = 0; i < 220; i++) {
                    const x = box.x + r() * box.w, y = -500 + r() * 740, a = 1.2 + (r() - 0.5) * 1.2 + (x < 0 ? 0.4 : -0.4), l = 40 + r() * 140;
                    S.dab(q, [[x, y], [x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 8 + r() * 22, color: r() < 0.3 ? (x < 0 ? '#3f7a64' : '#24503f') : '#020806', alpha: 0.18 + r() * 0.25, bristles: 6, seed: 'sl' + i, dry: 0.5, taper: 0.8 });
                }
            });
            // ravines down the fall line, dark, each with a lit lip on its left
            for (let i = 0; i < 26; i++) {
                const x0 = -700 + r() * 1500, y0 = -240 + r() * 120, len = 120 + r() * 260, a = 1.57 + (r() - 0.5) * 0.7, pts = [];
                for (let k = 0; k <= 10; k++) pts.push([x0 + Math.cos(a) * len * (k / 10) + Math.sin(k * 0.9 + i) * 8, y0 + Math.sin(a) * len * (k / 10)]);
                G.softly(g, 2.5, (q) => G.taper(q, pts.map(([x, y], k) => [x - Math.sin(k * 0.9 + i) * 6, y]), 16 + r() * 14, 2, 'rgba(1,6,4,0.5)'));
            }
            // rock: outcrops with a face to the moon and a face in shade
            for (let i = 0; i < 60; i++) {
                const x = -760 + r() * 1560, y = -230 + r() * 400, w = 10 + r() * r() * 46, h = w * (0.4 + r() * 0.6);
                const pts = [[x - w * 0.5, y + h * 0.5], [x - w * (0.2 + r() * 0.3), y - h * (0.3 + r() * 0.3)], [x - w * 0.05 + (r() - 0.5) * w * 0.3, y - h * (0.5 + r() * 0.3)], [x + w * (0.2 + r() * 0.3), y - h * (0.2 + r() * 0.4)], [x + w * 0.55, y + h * (0.3 + r() * 0.3)]];
                g.fillStyle = 'rgba(1,6,4,0.65)';
                G.poly(g, pts.map(([a2, b]) => [a2 + 3, b + 4]));
                g.fillStyle = '#0d241b';
                G.poly(g, pts);
                g.fillStyle = `rgba(${90 + r() * 50},${140 + r() * 50},${120 + r() * 40},${0.35 + r() * 0.3})`;
                G.poly(g, [pts[0], pts[1], pts[2], [x - w * 0.05 + (r() - 0.5) * w * 0.2, y + h * 0.1]]);
                G.line(g, [[x - w * 0.05, y + h * 0.1], [x + w * 0.1, y + h * 0.45]], 0.9, 'rgba(1,6,4,0.7)');
            }
            // scrub: esparto tufts and dwarf fan palms («palmitos»), dark, a light on their tips
            for (let i = 0; i < 520; i++) {
                const x = -800 + r() * 1640, y = -230 + r() * 420, sz = 4 + r() * 9, palm = r() < 0.12;
                const n = palm ? 9 : 5;
                for (let k = 0; k < n; k++) {
                    const a = -Math.PI / 2 + (k / (n - 1) - 0.5) * (palm ? 2.6 : 1.8), l = sz * (palm ? 1.6 : 1) * (0.7 + r() * 0.5);
                    G.line(g, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], palm ? 1.6 : 0.9, '#030c08');
                    if (k < n / 2 && r() < 0.5) G.line(g, [[x + Math.cos(a) * l * 0.6, y + Math.sin(a) * l * 0.6], [x + Math.cos(a) * l, y + Math.sin(a) * l]], 0.7, 'rgba(130,186,160,0.45)');
                }
            }
            // olive trees in loose rows along the contours of the lower slopes: each a clump
            // of small dark masses over its own shadow, a light on the moon's side
            for (let row = 0; row < 14; row++) {
                const sg = row % 2 ? 1 : -1, y0 = -20 + (row >> 1) * 26, x0 = sg * (520 + r() * 60), n = 6 + Math.floor(r() * 6);
                for (let k = 0; k < n; k++) {
                    if (r() < 0.15) continue; // a gap where a tree died
                    const x = x0 + sg * k * (30 + r() * 8), y = y0 + k * sg * 2 + (r() - 0.5) * 5;
                    g.fillStyle = 'rgba(1,5,3,0.55)';
                    G.oval(g, x + 5, y + 6, 9, 4);
                    for (let b = 0; b < 6; b++) {
                        g.fillStyle = b < 4 ? '#0b2219' : '#1f4a3a';
                        G.disc(g, x + (r() - 0.5) * 10, y - 4 + (r() - 0.5) * 7, 2.4 + r() * 2.2);
                    }
                    g.fillStyle = 'rgba(130,180,160,0.4)';
                    G.disc(g, x - 3, y - 7, 1.4);
                    G.line(g, [[x, y + 1], [x + 0.5, y + 5]], 1.2, '#06120c');
                }
            }
            // a path zigzagging up the shoulder
            G.line(g, S.curve([[690, 180], [620, 120], [710, 60], [630, -10], [700, -80], [650, -150], [680, -190]], false, 8), 2.2, 'rgba(150,196,176,0.4)');
            // the cat's eyes: two lights in its head
            for (const [x, y] of [[496, -240], [566, -243]]) {
                const gl = g.createRadialGradient(x, y, 0, x, y, 22);
                gl.addColorStop(0, 'rgba(220,246,232,0.95)');
                gl.addColorStop(0.2, 'rgba(160,226,196,0.5)');
                gl.addColorStop(1, 'rgba(160,226,196,0)');
                g.fillStyle = gl;
                g.fillRect(x - 22, y - 22, 44, 44);
            }
            g.restore();
            // moonlight on the ridge's top-left faces
            G.softly(g, 3, (q) => {
                q.lineCap = 'round';
                for (let i = 0; i < CAT.length - 1; i++) {
                    const [ax, ay] = CAT[i], [bx2, by2] = CAT[i + 1];
                    if (ay > 0 || by2 > 0) continue;
                    const up = (bx2 - ax) > 0 ? (by2 < ay ? 0.55 : 0.3) : 0;
                    if (up <= 0) continue;
                    G.line(q, [[ax, ay + 4], [bx2, by2 + 4]], 9, `rgba(190,230,212,${up * 1.4})`);
                }
            });
            // the agaves bristling on its spine, against the sky
            for (let i = 0; i < 70; i++) {
                const u = r(), x = -540 + u * 900;
                let yTop = -1e9;
                for (let k = 0; k < CAT.length - 1; k++) {
                    const [ax, ay] = CAT[k], [bx2, by2] = CAT[k + 1];
                    if (ay > 0 || by2 > 0) continue;
                    if ((x - ax) * (x - bx2) <= 0 && bx2 !== ax) yTop = Math.max(yTop, ay + ((by2 - ay) * (x - ax)) / (bx2 - ax));
                }
                if (yTop < -900) continue;
                const sz = 20 + r() * 46, n = 7 + Math.floor(r() * 6);
                for (let k = 0; k < n; k++) {
                    const a = -Math.PI / 2 + (k / (n - 1) - 0.5) * 2.6 + (r() - 0.5) * 0.2, l = sz * (0.6 + r() * 0.6) * (1 - Math.abs(k / (n - 1) - 0.5) * 0.6);
                    G.taper(g, [[x, yTop + 6], [x + Math.cos(a) * l * 0.5, yTop + 6 + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l, yTop + 6 + Math.sin(a) * l]], sz * 0.16, 0.6, '#061510');
                    if (Math.cos(a) < 0.2) G.taper(g, [[x - 1, yTop + 4], [x - 1 + Math.cos(a) * l * 0.9, yTop + 4 + Math.sin(a) * l * 0.9]], sz * 0.04, 0.3, 'rgba(150,200,180,0.5)');
                }
                // now and then a pole, gone to seed
                if (r() < 0.12) {
                    const h = 80 + r() * 120;
                    G.line(g, [[x, yTop + 4], [x + 3, yTop - h]], 2.4, '#08180f');
                    for (let k = 0; k < 4; k++) G.line(g, [[x + 3, yTop - h * (0.7 + k * 0.08)], [x + 3 + (k % 2 ? 14 : -14), yTop - h * (0.74 + k * 0.08)]], 1.4, '#08180f');
                }
            }
            // foam where the cat's feet stand in the sea, and their reflections
            for (const fx of [-430, -398, 398, 430, -1000, 1000]) {
                for (let k = 0; k < 14; k++) {
                    const x = fx + (r() - 0.5) * 120, y = SEA + 2 + r() * 14;
                    G.line(g, [[x, y], [x + 8 + r() * 30, y + (r() - 0.5) * 2]], 1 + r() * 1.5, `rgba(190,228,212,${0.2 + r() * 0.35})`);
                }
            }
            G.softly(g, 6, (q) => {
                q.fillStyle = 'rgba(1,6,4,0.45)';
                for (const [a2, b] of [[-500, -360], [360, 500]]) {
                    q.beginPath();
                    q.moveTo(a2, SEA);
                    q.lineTo(b, SEA);
                    q.lineTo(b + (b > 0 ? 40 : 30), SEA + 160);
                    q.lineTo(a2 - 30, SEA + 160);
                    q.fill();
                }
            });
            // the ghost ship, out on the sea, before the mountain's foot
            G.ship(g, { x: -560, y: SEA + 70, s: 0.46, alpha: 0.62, seed: 1 });
            // the horse, a ghost, on the cat's shoulder
            G.horse(g, { x: -180, y: -230, s: 0.5, alpha: 0.95, seed: 1 });
            // mist where the mountain meets the sea, and on its flanks
            mist(g, box, { seed: 'n1', n: 10, y0: SEA - 90, h: 110, color: 'rgba(130,186,164,0.2)', blur: 20 });
            mist(g, box, { seed: 'n2', n: 6, y0: -120, h: 200, color: 'rgba(110,170,150,0.08)', blur: 30 });
            S.tooth(g, box, { amp: 0.05 });
            // the pass under the cat's belly: the way through, cut clean (the rect less the mountain)
            g.save();
            g.beginPath();
            g.rect(-460, -150, 920, SEA + 2 + 150);
            g.clip();
            g.globalCompositeOperation = 'destination-out';
            g.fillStyle = '#000';
            g.beginPath();
            g.rect(-460, -150, 920, SEA + 2 + 150);
            S.trace(g, S.curve(CAT, true, 10));
            g.fill('evenodd');
            g.restore();
            // a breath of haze left in it, thickest at the sea
            G.softly(g, 20, (q) => {
                const hz = q.createLinearGradient(0, -100, 0, SEA);
                hz.addColorStop(0, 'rgba(120,180,158,0)');
                hz.addColorStop(1, 'rgba(120,180,158,0.12)');
                q.fillStyle = hz;
                q.fillRect(-420, -120, 840, SEA + 120);
            });
        },
    });
    L.push({
        // agaves and a prickly pear either side of the pass, the pole, the fish of shadow and
        // the road of dawn it opens, two frost stars
        id: 'green-night-mid', z: z0 + D.s2[1], box, brush: false,
        paint(g, res) {
            // the road of dawn: a paler band opening behind the fish
            G.softly(g, 26, (q) => {
                const gr = q.createLinearGradient(200, 0, 1200, 0);
                gr.addColorStop(0, 'rgba(160,212,190,0)');
                gr.addColorStop(0.25, 'rgba(160,212,190,0.4)');
                gr.addColorStop(1, 'rgba(200,236,220,0.6)');
                q.fillStyle = gr;
                q.beginPath();
                q.moveTo(270, -270);
                q.quadraticCurveTo(700, -360, 1260, -470);
                q.lineTo(1260, -170);
                q.quadraticCurveTo(700, -200, 270, -236);
                q.fill();
            });
            G.wind(g, { x: 290, y: -400, w: 980, h: 200 }, { seed: 'dawn', n: 22, alpha: 0.3, dir: -0.1, len: 500, w: 18, cols: ['#a6d4c0', '#cfeade', '#7fb6a0'] });
            G.fish(g, { x: 130, y: -235, s: 0.66, rot: Math.PI - 0.06, seed: 1 });
            G.frost(g, { x: 440, y: -190, r: 38, rot: 0.25, seed: 'm1' });
            G.frost(g, { x: -400, y: -250, r: 46, rot: 0.6, seed: 'm2' });
            G.frost(g, { x: -700, y: -380, r: 30, rot: 0.1, seed: 'm3' });
            G.quiote(g, { x: -560, y: 470, h: 1040, s: 0.8, seed: 2, lean: 0.1 });
            G.agave(g, { x: -930, y: 380, s: 0.5, seed: 7, n: 16, res: Q(res, 1), dry: 2 });
            G.agave(g, { x: -570, y: 470, s: 0.75, seed: 3, n: 22, res: Q(res, 1) });
            G.agave(g, { x: 880, y: 420, s: 0.55, seed: 8, n: 18, res: Q(res, 1) });
            G.opuntia(g, { x: 520, y: 480, s: 0.62, seed: 4, n: 12, res: Q(res, 1) });
            relight(g, box, res, moonMap('nightmid', box, { pools: 10, lights: 14, lift: 0.1, fall: 0.35 }), { sun: 0.6, shade: 1.1 });
            veil(g, box, 'rgba(10,36,28,0.12)');
            S.tooth(g, box, { amp: 0.05 });
        },
    });
    L.push({
        // brushed past: agave leaves cutting in from the corners, a big frost star, haze
        id: 'green-night-near', z: z0 + D.s2[0], box, brush: false, res: 0.75,
        paint(g, res) {
            G.agave(g, { x: -720, y: 580, s: 1.0, seed: 5, n: 16, dry: 1, res: Q(res, 1) });
            G.agave(g, { x: 740, y: 620, s: 0.95, seed: 6, n: 16, dry: 2, res: Q(res, 1) });
            G.quiote(g, { x: 700, y: 560, h: 1300, s: 1.1, seed: 9, lean: -0.25, dens: 0.6 });
            G.frost(g, { x: 480, y: -330, r: 95, rot: 0.1, seed: 'n1' });
            G.frost(g, { x: -520, y: -300, r: 62, rot: 0.4, seed: 'n2' });
            G.wind(g, box, { seed: 'nn', n: 16, alpha: 0.18, dir: -0.1, len: 900, w: 30, clear: (x, y) => GAP2N.out(x, y, 80) });
            S.tooth(g, box, { amp: 0.05 });
        },
    });

    // =========================================================== stratum 3 · the house
    L.push({
        // the body: the whitewashed wall in the moonlight, the open window (the way through),
        // its shutters, the eaves with their tiles and lanterns, the mirror, the horseshoe
        id: 'green-house-far', z: z0 + D.s3[2], box, brush: { amp: 0.11, len: 12, drift: 0.05 },
        paint(g, res) {
            const r = Motion.rng('wall');
            houseWall(g, res, r);
            relight(g, box, res, moonMap('wall', box, { pools: 10, lights: 10, lift: 0.22, fall: 0.3, dark: [[0, -60, 260, 0.4]] }), { sun: 0.6 });
            S.tooth(g, box, { amp: 0.06 });
        },
    });
    L.push({
        // the high railing, the blood on its hand-rail, the blanket, mint and basil in tins
        id: 'green-house-mid', z: z0 + D.s3[1], box, brush: { amp: 0.09, len: 10, drift: 0.04 },
        paint(g, res) {
            balcony(g, res);
            S.tooth(g, box, { amp: 0.05 });
        },
    });
    L.push({
        // brushed past: tin lanterns hanging from above, glass tambourines on threads
        id: 'green-house-near', z: z0 + D.s3[0], box, brush: false, res: 0.75,
        paint(g, res) {
            for (const [x, y, s, seed, turn] of [[-760, -560, 1.2, 3, 0.4], [800, -600, 1.1, 4, 0.6]]) {
                G.line(g, [[x, box.y - 10], [x, y + 4]], 2, 'rgba(10,24,18,0.8)');
                G.lantern(g, { x, y, s, seed, turn, shiver: 4 });
            }
            for (const [x, y, rad, rot, tilt, seed] of [[-450, 120, 90, 0.35, 0.45, 3], [470, 60, 84, -0.4, 0.6, 4], [400, 300, 66, 0.2, 0.3, 5], [-380, 320, 60, -0.6, 0.7, 6], [-650, 240, 48, 0.9, 0.5, 7], [660, 230, 54, -0.2, 0.4, 8], [-560, -100, 44, 0.4, 0.6, 9], [580, -160, 50, -0.7, 0.5, 10], [-760, 20, 64, 0.1, 0.3, 11], [780, -40, 44, 0.6, 0.6, 12], [-150, 330, 34, 0.3, 0.5, 13], [170, 350, 38, -0.4, 0.6, 14]]) {
                G.line(g, [[x + (seed % 2 ? 20 : -20), box.y - 10], [x, y - rad * (1 - tilt * 0.7)]], 1.2, 'rgba(180,220,204,0.5)');
                G.tambourine(g, { x, y, r: rad, rot, tilt, seed });
            }
            S.tooth(g, box, { amp: 0.05 });
        },
    });

    // =========================================================== the plate · the cistern
    L.push({
        id: 'green-cistern', z: z0 + D.plate, box: plateBox, res: 0.5, hole: Tableau.green.hole, brush: { amp: 0.09, len: 10 },
        paint(g, res) {
            cistern(g, res);
            S.tooth(g, plateBox, { amp: 0.05 });
            // the way out: the black water, cut clean
            g.globalCompositeOperation = 'destination-out';
            g.fillStyle = '#000';
            g.beginPath();
            g.arc(0, 0, Tableau.green.hole, 0, TAU);
            g.fill();
            g.globalCompositeOperation = 'source-over';
        },
    });

    // ------------------------------------------------------------------ the wall
    function houseWall(g, res, r) {
        // lime over lime: the coats, the damp, the drips under the eaves
        const gr = g.createLinearGradient(0, box.y, 0, box.y + box.h);
        gr.addColorStop(0, '#6e8f82');
        gr.addColorStop(0.5, '#86a598');
        gr.addColorStop(0.85, '#5f8070');
        gr.addColorStop(1, '#3b5a4b');
        g.fillStyle = gr;
        g.fillRect(box.x, box.y, box.w, box.h);
        G.softly(g, 1.4, (q) => {
            for (let i = 0; i < 260; i++) {
                const x = box.x + r() * box.w, y = box.y + r() * box.h, a = (r() - 0.5) * 0.8 + (r() < 0.5 ? 0 : Math.PI / 2), l = 60 + r() * 160;
                S.dab(q, [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 20 + r() * 40, color: r() < 0.5 ? '#a6c4b6' : '#5a7a6c', alpha: 0.12 + r() * 0.16, bristles: 10, seed: 'wb' + i, dry: 0.55, taper: 0.7 });
            }
        });
        // peeled patches: an older coat under the new, its edge lit on one side
        for (let i = 0; i < 18; i++) {
            const x = box.x + r() * box.w, y = box.y + 200 + r() * (box.h - 200), rx = 30 + r() * 110, ry = 20 + r() * 70;
            const pts = S.ellipse(x, y, rx, ry, 18, r() * 3).map(([a, b], k) => [a + (S.hashI(k, i, 1, 3) - 0.5) * rx * 0.5, b + (S.hashI(k, i, 2, 3) - 0.5) * ry * 0.5]);
            if (Math.abs(x) < WIN.w / 2 + 230 && y < WIN.sill + 60) continue;
            g.fillStyle = r() < 0.5 ? 'rgba(84,118,104,0.7)' : 'rgba(110,140,124,0.7)';
            G.poly(g, pts);
            g.strokeStyle = 'rgba(200,224,212,0.55)';
            g.lineWidth = 1.4;
            g.beginPath();
            S.trace(g, pts.slice(0, 10), false);
            g.stroke();
            g.strokeStyle = 'rgba(20,40,32,0.4)';
            g.beginPath();
            S.trace(g, pts.slice(9), false);
            g.stroke();
        }
        // damp: green algae rising from the foot, dark runs under the eaves
        G.softly(g, 8, (q) => {
            for (let i = 0; i < 40; i++) {
                const x = box.x + r() * box.w, y = box.y + box.h - r() * 260;
                q.fillStyle = `rgba(30,70,44,${0.15 + r() * 0.25})`;
                q.beginPath();
                q.ellipse(x, y, 40 + r() * 80, 30 + r() * 120, 0, 0, TAU);
                q.fill();
            }
            for (let i = 0; i < 26; i++) {
                const x = box.x + r() * box.w, y0 = -560, len = 80 + r() * 300;
                q.fillStyle = `rgba(30,50,40,${0.12 + r() * 0.18})`;
                q.fillRect(x, y0, 6 + r() * 26, len);
            }
        });
        // cracks
        for (let i = 0; i < 9; i++) {
            let x = box.x + r() * box.w, y = box.y + 220 + r() * 900, a = 1.2 + (r() - 0.5);
            if (Math.abs(x) < 420) x += x < 0 ? -420 : 420;
            const pts = [[x, y]];
            for (let k = 0; k < 12; k++) {
                a += (r() - 0.5) * 0.9;
                x += Math.cos(a) * 14;
                y += Math.sin(a) * 14;
                pts.push([x, y]);
            }
            G.line(g, pts, 1.4, 'rgba(14,30,22,0.65)');
            G.line(g, pts.map(([a2, b]) => [a2 - 1, b - 1]), 0.7, 'rgba(210,232,220,0.5)');
        }
        // the window: the reveal (the wall's thickness), lit on the right, shaded on the left
        const hw = WIN.w / 2, cy = WIN.top + WIN.arch, dep = 46;
        g.fillStyle = '#4e6e60';
        G.poly(g, winPath(dep));
        // the reveal faces
        const rev = (x0, sg) => {
            const gr2 = g.createLinearGradient(x0, 0, x0 + sg * dep, 0);
            gr2.addColorStop(0, sg > 0 ? '#2a463a' : '#a8c6b8');
            gr2.addColorStop(1, sg > 0 ? '#1c3428' : '#8cad9e');
            g.fillStyle = gr2;
            g.fillRect(Math.min(x0, x0 + sg * dep), cy, dep, WIN.sill - cy + dep * 0.6);
        };
        rev(-hw - dep, 1);
        rev(hw + dep, -1);
        // the arch's soffit
        g.save();
        g.beginPath();
        S.trace(g, winPath(dep));
        g.clip();
        const so = g.createLinearGradient(0, WIN.top - dep, 0, cy);
        so.addColorStop(0, '#1d3529');
        so.addColorStop(1, '#3d5c4e');
        g.fillStyle = so;
        g.fillRect(-hw - dep, WIN.top - dep, WIN.w + dep * 2, WIN.arch + dep);
        g.restore();
        // the sill: a stone ledge with a lit top
        g.fillStyle = '#21392e';
        g.fillRect(-hw - dep - 20, WIN.sill + dep * 0.5, WIN.w + dep * 2 + 40, 26);
        g.fillStyle = '#a9c8ba';
        g.fillRect(-hw - dep - 20, WIN.sill + dep * 0.5 - 4, WIN.w + dep * 2 + 40, 6);
        // the shutters, open flat against the wall either side
        for (const sg of [-1, 1]) shutter(g, sg * (hw + dep + 118), (WIN.top + WIN.sill) / 2 + 30, 200, WIN.sill - WIN.top - 30, sg, r);
        // the horseshoe over the keystone, points up, with its nails
        horseshoe(g, 0, WIN.top - dep - 70, 1.1);
        // the mirror on the wall, a little crooked, hung from a nail
        mirror(g, 610, -60, 70, -0.06, r);
        // the eaves: rafters' ends, the tiles' row with its mortar and moss, houseleeks
        eaves(g, -480, r);
        // lanterns hanging from the eaves' brackets
        for (const [x, s, seed] of [[-620, 0.85, 1], [560, 0.8, 2]]) {
            G.bar(g, [[x - 50, -428], [x, -428], [x, -410]], 6, 'br' + seed);
            G.lantern(g, { x, y: -410, s, seed, shiver: 2.5 });
        }
        // a gecko on the wall, head down, and a moth near the lantern
        gecko(g, -560, 210, 1.2, 1.9);
        G.moth(g, { x: 470, y: -180, s: 0.55, rot: -1.2 });
        // jasmine climbing from the foot on the left
        jasmine(g, r);
        // the cut-out: the window's opening
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = '#000';
        G.poly(g, winPath(0));
        g.globalCompositeOperation = 'source-over';
    }
    function shutter(g, cx, cy, w, h, sg, r) {
        const x0 = cx - w / 2, y0 = cy - h / 2;
        g.fillStyle = 'rgba(4,14,10,0.5)';
        g.fillRect(x0 + 8, y0 + 10, w, h);
        g.fillStyle = '#163c2c';
        g.fillRect(x0, y0, w, h);
        // stiles and rails
        g.fillStyle = '#245a42';
        g.fillRect(x0, y0, 16, h);
        g.fillRect(x0 + w - 16, y0, 16, h);
        g.fillRect(x0, y0, w, 18);
        g.fillRect(x0, y0 + h * 0.5 - 9, w, 18);
        g.fillRect(x0, y0 + h - 18, w, 18);
        g.fillStyle = 'rgba(170,214,192,0.45)';
        g.fillRect(x0, y0, 2.5, h);
        g.fillRect(x0, y0, w, 2.5);
        // the louvres: each slat lit along its top edge, its shadow on the one below
        for (const [a, b] of [[y0 + 18, y0 + h * 0.5 - 9], [y0 + h * 0.5 + 9, y0 + h - 18]]) {
            for (let y = a + 2; y < b - 8; y += 13) {
                // a slat lost, showing the dark room behind; another tilted open
                if (r() < 0.05) {
                    g.fillStyle = '#04100a';
                    g.fillRect(x0 + 16, y, w - 32, 12);
                    G.line(g, [[x0 + 18, y + 10], [x0 + w * 0.4, y + 3]], 3, '#2a5a44');
                    continue;
                }
                const open = r() < 0.08 ? 5 : 0;
                const gr = g.createLinearGradient(0, y - open, 0, y + 12);
                gr.addColorStop(0, '#5f9a7e');
                gr.addColorStop(0.35, '#2e6a50');
                gr.addColorStop(1, '#0b2419');
                g.fillStyle = gr;
                g.fillRect(x0 + 16, y - open, w - 32, 12 + open);
                // the paint has run and dried in a drip here and there
                if (r() < 0.12) {
                    const dx = x0 + 20 + r() * (w - 40);
                    G.taper(g, [[dx, y + 10], [dx + 0.5, y + 16 + r() * 8]], 2.6, 1.4, 'rgba(30,80,58,0.9)');
                }
                g.fillStyle = `rgba(190,226,208,${0.2 + r() * 0.3})`;
                g.fillRect(x0 + 16 + r() * 40, y, 20 + r() * (w - 80), 1.2);
                // each slat its own: a tone, the grain under the paint, a chip
                g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '200,230,214'},${r() * 0.12})`;
                g.fillRect(x0 + 16, y, w - 32, 12);
                for (let k = 0; k < 3; k++) {
                    const gx = x0 + 18 + r() * (w - 40);
                    g.fillStyle = 'rgba(6,20,14,0.35)';
                    g.fillRect(gx, y + 3 + r() * 6, 8 + r() * 30, 0.8);
                }
                if (r() < 0.25) {
                    g.fillStyle = 'rgba(126,146,134,0.7)';
                    G.oval(g, x0 + 20 + r() * (w - 40), y + 4, 3 + r() * 6, 1.6, 0);
                }
            }
        }
        // the paint worn to the grey wood in places, the hinges, the hook
        for (let i = 0; i < 16; i++) {
            g.fillStyle = `rgba(120,140,130,${0.25 + r() * 0.3})`;
            G.oval(g, x0 + r() * w, y0 + r() * h, 3 + r() * 10, 1.5 + r() * 4, r() * 3);
        }
        const hx = sg < 0 ? x0 + w : x0;
        for (const hy of [y0 + 40, y0 + h - 40]) {
            g.fillStyle = '#0a1812';
            g.fillRect(hx - (sg < 0 ? 26 : 0), hy - 5, 26, 10);
            g.fillStyle = 'rgba(160,200,184,0.6)';
            g.fillRect(hx - (sg < 0 ? 26 : 0), hy - 5, 26, 2);
        }
        const kx = sg < 0 ? x0 + 30 : x0 + w - 30;
        G.line(g, [[kx, y0 + h * 0.5], [kx + sg * 30, y0 + h * 0.5 + 18]], 2, '#0a1812');
    }
    function horseshoe(g, x, y, s) {
        const outer = [], inner = [];
        for (let i = 0; i <= 30; i++) {
            const a = Math.PI * (0.05 + (i / 30) * 0.9) + Math.PI; // points up: the luck kept in
            outer.push([x + Math.cos(a) * 46 * s, y - Math.sin(a) * 52 * s]);
            inner.push([x + Math.cos(a) * 30 * s, y - Math.sin(a) * 36 * s]);
        }
        g.fillStyle = 'rgba(4,12,8,0.5)';
        G.poly(g, [...outer, ...inner.slice().reverse()].map(([a, b]) => [a + 5, b + 7]));
        g.fillStyle = '#1d2a25';
        G.poly(g, [...outer, ...inner.slice().reverse()]);
        G.line(g, outer.slice(2, 16).map(([a, b]) => [a + 1, b + 1]), 2, 'rgba(170,200,188,0.55)');
        for (let i = 3; i < 28; i += 4) {
            const [a, b] = outer[i], [c, d] = inner[i];
            g.fillStyle = '#05100b';
            G.disc(g, (a + c) / 2, (b + d) / 2, 2.6 * s);
            g.fillStyle = 'rgba(190,214,204,0.6)';
            G.disc(g, (a + c) / 2 - 0.6, (b + d) / 2 - 0.6, 1 * s);
        }
    }
    function mirror(g, x, y, rad, rot, r) {
        G.line(g, [[x - rad * 0.6, y - rad * 0.8], [x, y - rad - 50], [x + rad * 0.6, y - rad * 0.8]], 1.4, 'rgba(14,26,20,0.8)');
        g.fillStyle = '#05100b';
        G.disc(g, x, y - rad - 50, 4);
        g.fillStyle = 'rgba(4,14,10,0.5)';
        G.oval(g, x + 8, y + 12, rad + 12, rad * 1.18 + 12, rot);
        // the frame: tin, beaded
        g.fillStyle = '#5d7770';
        G.oval(g, x, y, rad + 12, rad * 1.18 + 12, rot);
        g.fillStyle = '#9fb8b0';
        for (let k = 0; k < 40; k++) {
            const a = (k / 40) * TAU;
            G.disc(g, x + Math.cos(a) * (rad + 6), y + Math.sin(a) * (rad * 1.18 + 6), 2.2);
        }
        // the glass: the night sky in it, the moon's light low, the silvering gone at the rim
        const gr = g.createLinearGradient(x - rad, y - rad, x + rad, y + rad);
        gr.addColorStop(0, '#cfe6dc');
        gr.addColorStop(0.35, '#6e9c8a');
        gr.addColorStop(1, '#183a2c');
        g.fillStyle = gr;
        G.oval(g, x, y, rad, rad * 1.18, rot);
        for (let k = 0; k < 40; k++) {
            const a = r() * TAU, d = rad * (0.82 + r() * 0.16);
            g.fillStyle = `rgba(20,36,28,${0.2 + r() * 0.4})`;
            G.disc(g, x + Math.cos(a) * d, y + Math.sin(a) * d * 1.18, 1 + r() * 4);
        }
        g.fillStyle = 'rgba(240,252,246,0.5)';
        g.beginPath();
        g.ellipse(x - rad * 0.3, y - rad * 0.4, rad * 0.12, rad * 0.5, -0.6, 0, TAU);
        g.fill();
        G.line(g, [[x + rad * 0.2, y - rad * 0.9], [x + rad * 0.3, y - rad * 0.2], [x + rad * 0.55, y + rad * 0.6]], 1, 'rgba(240,252,246,0.7)');
    }
    function eaves(g, y0, r) {
        // the shadow the eave throws on the wall
        G.softly(g, 14, (q) => {
            q.fillStyle = 'rgba(4,14,10,0.5)';
            q.fillRect(box.x, y0 - 20, box.w, 70);
        });
        // the cornice and the rafters' ends
        g.fillStyle = '#4c6b5d';
        g.fillRect(box.x, y0 - 60, box.w, 40);
        g.fillStyle = '#a2c0b2';
        g.fillRect(box.x, y0 - 60, box.w, 4);
        for (let x = box.x + 30; x < box.x + box.w; x += 120) {
            g.fillStyle = '#18291f';
            g.fillRect(x, y0 - 24, 34, 26);
            g.fillStyle = '#4a5f52';
            g.fillRect(x, y0 - 24, 34, 4);
        }
        // the tiles: curved, their ends open, mortar between, moss and houseleeks on them
        for (let x = box.x - 30; x < box.x + box.w + 40; x += 64) {
            const w = 58 + r() * 6, tx = x + (r() - 0.5) * 4, ty = y0 - 64;
            const gr = g.createLinearGradient(tx - w / 2, 0, tx + w / 2, 0);
            gr.addColorStop(0, '#a8c6b6');
            gr.addColorStop(0.4, '#5f8a74');
            gr.addColorStop(1, '#1e3a2c');
            g.fillStyle = gr;
            g.fillRect(tx - w / 2, box.y, w, ty - box.y);
            // the tile's mouth: a dark crescent of the channel
            g.fillStyle = '#071510';
            g.beginPath();
            g.ellipse(tx, ty, w / 2, 16, 0, 0, Math.PI);
            g.fill();
            g.fillStyle = '#3c5c4c';
            g.beginPath();
            g.ellipse(tx, ty - 2, w / 2 - 6, 9, 0, 0, Math.PI);
            g.fill();
            // courses of tiles up the roof
            for (let y = ty - 70; y > box.y; y -= 70 + r() * 6) {
                g.fillStyle = 'rgba(8,20,14,0.45)';
                g.fillRect(tx - w / 2, y, w, 4);
                g.fillStyle = 'rgba(170,206,190,0.35)';
                g.fillRect(tx - w / 2 + 4, y + 4, w * 0.4, 2);
            }
            // moss in the joints
            for (let k = 0; k < 6; k++) {
                g.fillStyle = `rgba(${40 + r() * 30},${90 + r() * 40},${50 + r() * 20},0.7)`;
                G.disc(g, tx + w / 2 + (r() - 0.5) * 6, box.y + r() * (ty - box.y), 3 + r() * 6);
            }
        }
        // houseleeks: small rosettes on the tiles
        for (const hx of [-380, 120, 860]) {
            for (let k = 0; k < 12; k++) {
                const a = (k / 12) * TAU, l = 12 + (k % 3) * 3;
                G.taper(g, [[hx, y0 - 92], [hx + Math.cos(a) * l, y0 - 92 + Math.sin(a) * l * 0.6]], 6, 1, k % 2 ? '#3f7a5a' : '#6aa284');
            }
            g.fillStyle = '#9cc8b0';
            G.disc(g, hx, y0 - 93, 4);
        }
    }
    function gecko(g, x, y, s, rot) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        g.fillStyle = 'rgba(4,14,10,0.4)';
        G.poly(g, S.curve([[40, 3], [20, -6], [-10, -8], [-40, -4], [-80, 2], [-40, 8], [-10, 10], [20, 8]], true, 6).map(([a, b]) => [a + 4, b + 6]));
        for (const [lx, sg] of [[18, -1], [18, 1], [-18, -1], [-18, 1]]) {
            const e = [lx + (lx > 0 ? 10 : -6), sg * 22];
            G.taper(g, [[lx, sg * 4], [lx + (lx > 0 ? 4 : -2), sg * 14], e], 5, 3, '#4d6a5c');
            for (let k = -1; k <= 1; k++) {
                g.fillStyle = '#7d9a8c';
                G.disc(g, e[0] + k * 3.4, e[1] + sg * 3.5, 2);
            }
        }
        const gr = g.createLinearGradient(0, -10, 0, 10);
        gr.addColorStop(0, '#93ad9f');
        gr.addColorStop(1, '#3d584a');
        g.fillStyle = gr;
        G.poly(g, S.curve([[40, 0], [30, -7], [14, -7], [0, -9], [-20, -7], [-40, -4], [-80, 0], [-40, 4], [-20, 7], [0, 9], [14, 7], [30, 7]], true, 6));
        // its tubercles and the rings on its tail
        for (let i = 0; i < 40; i++) {
            const u = -36 + (i % 10) * 6.5, v = -5 + Math.floor(i / 10) * 3.4;
            g.fillStyle = 'rgba(200,220,210,0.55)';
            G.disc(g, u, v, 0.9);
        }
        for (let i = 0; i < 8; i++) G.line(g, [[-44 - i * 4.5, -3 + i * 0.3], [-44 - i * 4.5, 3 - i * 0.3]], 1, 'rgba(20,36,28,0.45)');
        g.fillStyle = '#0c1a14';
        G.disc(g, 30, -4.5, 2);
        G.disc(g, 30, 4.5, 2);
        g.restore();
    }
    function jasmine(g, r) {
        const stems = [[[-1260, 720], [-1120, 520], [-1060, 300], [-940, 140], [-880, -60]], [[-1200, 720], [-980, 600], [-820, 560], [-700, 620]]];
        stems.forEach((st, i) => {
            const pts = S.curve(st, false, 12);
            G.tube(g, pts, { w0: 6, w1: 3, seed: 'jas' + i, ramp: [[0, '#0b1a12'], [0.5, '#2e5038'], [1, '#9cc4a6']], shadeA: 0.6 });
            for (let k = 4; k < pts.length - 1; k += 3) {
                const [x, y] = pts[k];
                // leaflets, opposite, small and pointed
                for (const sg of [-1, 1]) {
                    const a = Math.atan2(pts[k + 1][1] - y, pts[k + 1][0] - x) + sg * (0.9 + r() * 0.4), l = 18 + r() * 12;
                    G.taper(g, [[x, y], [x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l, y + Math.sin(a) * l]], 7, 0.5, r() < 0.5 ? '#2c5a3a' : '#1a3d27');
                    G.taper(g, [[x, y], [x + Math.cos(a) * l * 0.8, y + Math.sin(a) * l * 0.8]], 1.6, 0.3, 'rgba(160,206,170,0.5)');
                }
                // the stars of its flowers, white in the moon
                if (r() < 0.45) {
                    const fx = x + (r() - 0.5) * 30, fy = y + (r() - 0.5) * 30, a0 = r() * TAU;
                    for (let p = 0; p < 5; p++) {
                        const a = a0 + (p / 5) * TAU;
                        g.fillStyle = 'rgba(232,246,240,0.92)';
                        G.oval(g, fx + Math.cos(a) * 6, fy + Math.sin(a) * 6, 6, 3, a);
                    }
                    g.fillStyle = '#7aa08a';
                    G.disc(g, fx, fy, 1.6);
                }
            }
        });
    }

    // ------------------------------------------------------------------ the balcony
    function balcony(g, res) {
        const r = Motion.rng('balcony'), top = 170, bottom = 470;
        // tins of mint and basil behind the bars, on the balcony's floor
        herbTin(g, -640, bottom - 6, 1.3, 'mint', r);
        herbTin(g, -470, bottom - 6, 1.1, 'basil', r);
        herbTin(g, 470, bottom - 6, 1.2, 'mint', r);
        // the slab and its moulded edge, the brackets under it
        g.fillStyle = '#1b3328';
        g.fillRect(box.x, bottom + 8, box.w, 54);
        g.fillStyle = '#86a898';
        g.fillRect(box.x, bottom + 8, box.w, 7);
        g.fillStyle = '#4b6a5c';
        g.fillRect(box.x, bottom + 15, box.w, 10);
        g.fillStyle = 'rgba(4,14,10,0.6)';
        g.fillRect(box.x, bottom + 62, box.w, 14);
        for (const bx2 of [-900, -300, 300, 900]) {
            G.bar(g, S.curve([[bx2, bottom + 70], [bx2 - 10, bottom + 130], [bx2 - 50, bottom + 170], [bx2 - 70, bottom + 140], [bx2 - 50, bottom + 120]], false, 10), 7, 'bk' + bx2, { raw: true });
        }
        const R = G.railing(g, { x0: box.x - 20, x1: box.x + box.w + 20, top, bottom, seed: 'balc', pitch: 38 });
        // the blanket thrown over the rail on the right
        manta(g, 330, 760, top, r);
        // tin lanterns hanging over the balcony either side of the window, trembling
        for (const [x, y, s2, seed, turn] of [[-430, -170, 0.95, 6, 0.35], [430, -190, 0.9, 7, 0.6]]) {
            G.line(g, [[x, box.y], [x, y + 4]], 1.6, 'rgba(10,24,18,0.85)');
            G.lantern(g, { x, y, s: s2, seed, turn, shiver: 3 });
        }
        // the trail of blood: up the steps on the left and along the hand-rail, a drop run
        // down a bar where a hand held on
        const trail = [];
        for (let x = -780; x < -260; x += 30 + r() * 34) trail.push([x, top - 6 + (r() - 0.5) * 3]);
        G.blood(g, trail, { seed: 'rail', r: 6 });
        const b = R.bars.find((x) => x > -300) ?? -280;
        G.blood(g, [[b, top + 60], [b + 1, top + 140]], { seed: 'bar', r: 3.6, run: true });
        G.blood(g, [[-210, bottom + 10], [-150, bottom + 12]], { seed: 'slab', r: 5 });
        relight(g, box, res, moonMap('balc', box, { pools: 8, lights: 10, lift: 0.15, fall: 0.25 }), { sun: 0.5 });
    }
    function herbTin(g, x, y, s, herb, r) {
        // an old oil tin, its ribs, a dent, a hole punched in the side
        const w = 70 * s, h = 86 * s;
        g.fillStyle = 'rgba(4,14,10,0.5)';
        g.fillRect(x - w / 2 + 8, y - h + 8, w, h);
        const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
        gr.addColorStop(0, '#9fb8b0');
        gr.addColorStop(0.3, '#d2e2dc');
        gr.addColorStop(0.6, '#6f8a82');
        gr.addColorStop(1, '#22352f');
        g.fillStyle = gr;
        g.fillRect(x - w / 2, y - h, w, h);
        for (const f of [0.18, 0.5, 0.82]) {
            g.fillStyle = 'rgba(10,24,18,0.35)';
            g.fillRect(x - w / 2, y - h + h * f, w, 2.5 * s);
            g.fillStyle = 'rgba(230,244,238,0.4)';
            g.fillRect(x - w / 2, y - h + h * f + 2.5 * s, w, 1.2 * s);
        }
        g.fillStyle = 'rgba(14,30,24,0.4)';
        G.oval(g, x + w * 0.15, y - h * 0.35, 8 * s, 5 * s, 0.3);
        g.fillStyle = '#b8ccc4';
        g.fillRect(x - w / 2 - 2, y - h - 4, w + 4, 6);
        // the plant
        const n = herb === 'mint' ? 9 : 7;
        for (let i = 0; i < n; i++) {
            const sx = x + (r() - 0.5) * w * 0.7, ht = (90 + r() * 70) * s, top = [sx + (r() - 0.5) * 30 * s, y - h - ht];
            G.line(g, [[sx, y - h], [(sx + top[0]) / 2 + (r() - 0.5) * 8, y - h - ht * 0.5], top], 2 * s, herb === 'mint' ? '#2a3f2a' : '#3a5a2c');
            for (let k = 1; k <= 5; k++) {
                const u = k / 5.5, px = sx + (top[0] - sx) * u, py = y - h - ht * u;
                for (const sg of [-1, 1]) {
                    if (herb === 'mint') {
                        // mint: opposite, oval, pointed, wrinkled, toothed
                        const a = (sg < 0 ? Math.PI : 0) + (r() - 0.5) * 0.6 - 0.4 * sg * 0, l = (20 + r() * 8) * s * (1.1 - u * 0.4);
                        const cx = px + Math.cos(a) * l * 0.55, cy = py + Math.sin(a) * l * 0.55 - 4 * s;
                        g.fillStyle = r() < 0.5 ? '#1f4a2a' : '#2b5e36';
                        G.oval(g, cx, cy, l * 0.55, l * 0.34, a);
                        g.strokeStyle = 'rgba(150,200,160,0.5)';
                        g.lineWidth = 0.8;
                        g.beginPath();
                        g.moveTo(px, py - 3 * s);
                        g.lineTo(cx + Math.cos(a) * l * 0.45, cy + Math.sin(a) * l * 0.45);
                        g.stroke();
                        for (let t = 0; t < 4; t++) {
                            g.fillStyle = 'rgba(8,24,14,0.5)';
                            G.disc(g, cx + Math.cos(a) * l * (t - 1.5) * 0.15 + (r() - 0.5) * 3, cy + (r() - 0.5) * 5, 1.2);
                        }
                    } else {
                        // basil: rounder, cupped, glossy, a white flower spike at the top
                        const a = (sg < 0 ? Math.PI : 0) + (r() - 0.5) * 0.5 - 0.3, l = (24 + r() * 8) * s * (1.1 - u * 0.4);
                        const cx = px + Math.cos(a) * l * 0.5, cy = py + Math.sin(a) * l * 0.5 - 3 * s;
                        g.fillStyle = r() < 0.5 ? '#3d7a3a' : '#4f8e44';
                        G.oval(g, cx, cy, l * 0.5, l * 0.38, a);
                        g.fillStyle = 'rgba(214,240,214,0.55)';
                        G.oval(g, cx - 2, cy - 3, l * 0.22, l * 0.08, a - 0.3);
                    }
                }
            }
            if (herb === 'basil' && r() < 0.6) {
                for (let k = 0; k < 6; k++) {
                    g.fillStyle = 'rgba(232,246,236,0.85)';
                    G.disc(g, top[0] + (r() - 0.5) * 6, top[1] - k * 6 * s, 2.4 * s);
                }
            }
        }
    }
    function manta(g, x0, x1, top, r) {
        // a striped blanket thrown over the hand-rail: the folded edge on the rail, the drop
        // hanging in folds, the fringe; every stripe a green or a grey of its own
        const hang = 300, cols = ['#0d2a1e', '#2e5e48', '#7aa894', '#163a2a', '#bcd6c8', '#24503c', '#5c8a74', '#0a2016', '#9ec4b2', '#18402e', '#4a7a64', '#d2e6dc', '#204836', '#6a9884'];
        const N = 40;
        g.fillStyle = 'rgba(4,12,8,0.5)';
        g.fillRect(x0 + 12, top + 10, x1 - x0, hang);
        for (let i = 0; i < N; i++) {
            const u0 = i / N, u1 = (i + 1) / N, xa = x0 + (x1 - x0) * u0, xb = x0 + (x1 - x0) * u1;
            const sag = (u) => top - 8 + Math.sin(u * Math.PI) * 6;
            const len = (u) => hang + Math.sin(u * 11) * 18 + Math.sin(u * 23) * 8;
            // a fold: the light on each pleat's face
            const f = Math.sin(u0 * 9 * Math.PI) * 0.5 + 0.5;
            const yb0 = sag(u0) + len(u0), yb1 = sag(u1) + len(u1);
            for (let s2 = 0; s2 < 14; s2++) {
                const v0 = s2 / 14, v1 = (s2 + 1) / 14, c = cols[(s2 * 5 + 3) % cols.length];
                g.fillStyle = S.mix(c, f > 0.5 ? '#d8eae2' : '#020806', Math.abs(f - 0.5) * 0.5);
                g.beginPath();
                g.moveTo(xa, sag(u0) + (yb0 - sag(u0)) * v0);
                g.lineTo(xb + 0.6, sag(u1) + (yb1 - sag(u1)) * v0);
                g.lineTo(xb + 0.6, sag(u1) + (yb1 - sag(u1)) * v1 + 0.6);
                g.lineTo(xa, sag(u0) + (yb0 - sag(u0)) * v1 + 0.6);
                g.fill();
            }
            // the fringe
            for (let k = 0; k < 3; k++) {
                const fx = xa + (xb - xa) * (k / 3);
                G.line(g, [[fx, yb0], [fx + (r() - 0.5) * 6, yb0 + 22 + r() * 10]], 1.4, k % 2 ? '#9cc0ae' : '#2f5a46');
            }
        }
        // woven bands: a zigzag in the pale stripes, ticks in the dark ones, the rag ends
        for (let s2 = 0; s2 < 14; s2++) {
            const v = (s2 + 0.5) / 14;
            for (let x = x0 + 4; x < x1 - 6; x += 9) {
                const u = (x - x0) / (x1 - x0), yy = top - 8 + Math.sin(u * Math.PI) * 6 + (hang + Math.sin(u * 11) * 18 + Math.sin(u * 23) * 8) * v;
                const pale = (s2 * 5 + 3) % 4 === 0;
                G.line(g, [[x, yy - 4], [x + 4.5, yy + 4], [x + 9, yy - 4]], 1.1, pale ? 'rgba(4,20,12,0.45)' : 'rgba(210,236,222,0.3)');
                if (r() < 0.12) G.line(g, [[x + 2, yy], [x + 5, yy + (r() - 0.5) * 6]], 1.6, 'rgba(230,244,236,0.4)');
            }
        }
        // the weave: fine hatching across the stripes
        g.strokeStyle = 'rgba(0,0,0,0.12)';
        g.lineWidth = 0.6;
        for (let x = x0; x < x1; x += 3) {
            g.beginPath();
            g.moveTo(x, top);
            g.lineTo(x, top + hang + 10);
            g.stroke();
        }
        // the roll over the rail
        G.tube(g, [[x0 - 4, top - 4], [x1 + 4, top - 2]], { w0: 26, w1: 26, seed: 'roll', ramp: [[0, '#06140e'], [0.4, '#1f4a38'], [0.75, '#5c8e78'], [1, '#bcd8ca']], edge: true, shadeA: 0.8 });
    }

    // ------------------------------------------------------------------ the cistern
    function cistern(g, res) {
        const r = Motion.rng('cistern');
        const RC = 460, RI = 345, RW = 275; // curb outside, curb inside, the water's edge
        // the paving: Granada pebbles set on edge, dark and pale, in rings and rays round the well
        g.fillStyle = '#10241c';
        g.fillRect(plateBox.x, plateBox.y, plateBox.w, plateBox.h);
        for (let rad = RC + 30; rad < 2000; rad += 22) {
            const ring = Math.floor((rad - RC) / 22), n = Math.floor((TAU * rad) / 16);
            for (let i = 0; i < n; i++) {
                const a = (i / n) * TAU + ring * 0.07, x = Math.cos(a) * rad, y = Math.sin(a) * rad;
                if (x < plateBox.x - 20 || x > plateBox.x + plateBox.w + 20 || y < plateBox.y - 20 || y > plateBox.y + plateBox.h + 20) continue;
                // a pattern: rays of pale pebbles every eighth of the circle, a pale ring every fifth
                const ray = Math.abs(((a * 16) / TAU) % 2 - 1) < 0.18, band = ring % 5 === 2;
                const pale = ray || band ? r() < 0.9 : r() < 0.12;
                const col = pale ? S.mix('#4f6e62', '#86a498', r()) : S.mix('#0d1f17', '#24402f', r());
                g.fillStyle = 'rgba(2,8,6,0.5)';
                G.oval(g, x + 1.5, y + 2, 7.5, 4.6, a + Math.PI / 2);
                g.fillStyle = col;
                G.oval(g, x, y, 7 + r() * 1.5, 4 + r() * 1.2, a + Math.PI / 2 + (r() - 0.5) * 0.3);
                g.fillStyle = `rgba(220,240,232,${pale ? 0.18 : 0.08})`;
                G.oval(g, x - 2, y - 1.5, 2.6, 1.3, a + Math.PI / 2);
            }
        }
        // moss in the joints, weeds, fallen fig leaves, a tin bucket on its side with its rope
        G.softly(g, 6, (q) => {
            for (let i = 0; i < 60; i++) {
                const a = r() * TAU, d = RC + 40 + r() * 1200;
                q.fillStyle = `rgba(30,80,46,${0.2 + r() * 0.3})`;
                q.beginPath();
                q.ellipse(Math.cos(a) * d, Math.sin(a) * d, 20 + r() * 60, 10 + r() * 30, a, 0, TAU);
                q.fill();
            }
        });
        const rs = Q(res, 1.6);
        for (let i = 0; i < 16; i++) {
            const a = r() * TAU, d = RC + 120 + r() * 900, rot = r() * TAU, kind = r() < 0.3 ? 'under' : 'deep';
            const sp = G.figLeaf(Math.floor(r() * 4) + (kind === 'under' ? 4 : 0), rot, rs, kind);
            G.shadow(g, sp, Math.cos(a) * d, Math.sin(a) * d, 1, { rot, dx: 6, dy: 9, alpha: 0.5, blur: 8 });
            G.put(g, sp, Math.cos(a) * d, Math.sin(a) * d, 1, { rot, fy: 0.8 });
        }
        bucket(g, 760, 360, r);
        // the shadow the curb throws on the paving (away from the moon)
        G.softly(g, 30, (q) => {
            q.fillStyle = 'rgba(2,8,6,0.6)';
            q.beginPath();
            q.arc(40, 55, RC + 30, 0, TAU);
            q.fill();
        });
        // the curb: an octagon of worn stone, its top lit, rope grooves on its inner lip
        const oct = (rad, k = 1) => {
            const pts = [];
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * TAU + Math.PI / 8;
                pts.push([Math.cos(a) * rad / Math.cos(Math.PI / 8) * k, Math.sin(a) * rad / Math.cos(Math.PI / 8) * k]);
            }
            return pts;
        };
        g.fillStyle = '#5e7a6e';
        G.poly(g, oct(RC));
        g.save();
        g.beginPath();
        S.trace(g, oct(RC));
        g.clip();
        // veins in the stone and its wear
        G.softly(g, 1, (q) => {
            for (let i = 0; i < 90; i++) {
                const a = r() * TAU, d = RI + r() * (RC - RI), x = Math.cos(a) * d, y = Math.sin(a) * d, b = a + (r() - 0.5) * 2, l = 30 + r() * 90;
                S.dab(q, [[x, y], [x + Math.cos(b) * l, y + Math.sin(b) * l]], { w: 2 + r() * 10, color: r() < 0.5 ? '#a6c2b6' : '#2f4a3e', alpha: 0.2 + r() * 0.3, bristles: 4, seed: 'cv' + i, dry: 0.4, taper: 0.8 });
            }
        });
        // pits, lichen, the wear of hands and buckets
        for (let i = 0; i < 260; i++) {
            const a = r() * TAU, d = RI + 6 + r() * (RC - RI - 10), x = Math.cos(a) * d, y = Math.sin(a) * d;
            if (r() < 0.6) {
                g.fillStyle = `rgba(4,14,10,${0.3 + r() * 0.4})`;
                G.disc(g, x, y, 0.8 + r() * 2.2);
            } else {
                g.fillStyle = `rgba(${150 + r() * 50},${180 + r() * 40},${150 + r() * 40},${0.25 + r() * 0.3})`;
                G.oval(g, x, y, 3 + r() * 9, 2 + r() * 6, r() * 3);
            }
        }
        // the moon on the curb's upper-left faces, shade on the lower-right ones
        const lg = g.createLinearGradient(-RC, -RC, RC, RC);
        lg.addColorStop(0, 'rgba(220,240,232,0.45)');
        lg.addColorStop(0.5, 'rgba(220,240,232,0)');
        lg.addColorStop(0.55, 'rgba(0,0,0,0)');
        lg.addColorStop(1, 'rgba(2,10,6,0.55)');
        g.fillStyle = lg;
        g.fillRect(-RC, -RC, RC * 2, RC * 2);
        // the joints between the curb's stones
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU + Math.PI / 8 + 0.2;
            G.line(g, [[Math.cos(a) * RI, Math.sin(a) * RI], [Math.cos(a) * RC * 1.1, Math.sin(a) * RC * 1.1]], 3, 'rgba(6,18,12,0.7)');
            G.line(g, [[Math.cos(a) * RI + 2, Math.sin(a) * RI + 2], [Math.cos(a) * RC * 1.1 + 2, Math.sin(a) * RC * 1.1 + 2]], 1.2, 'rgba(200,226,214,0.4)');
        }
        g.restore();
        // the shaft: the well's inner wall going down, stone by stone, darker with depth
        g.save();
        g.beginPath();
        S.trace(g, oct(RI));
        g.clip();
        g.fillStyle = '#06130d';
        g.fillRect(-RI * 1.2, -RI * 1.2, RI * 2.4, RI * 2.4);
        const courses = 6;
        for (let k = 0; k < courses; k++) {
            const r0 = RI - k * ((RI - RW) / courses), r1 = r0 - (RI - RW) / courses, t = k / courses, n = 30 - k * 2;
            for (let i = 0; i < n; i++) {
                const a0 = (i / n) * TAU + k * 0.11 + r() * 0.02, a1 = ((i + 1) / n) * TAU + k * 0.11 - 0.012, pts = [];
                for (let j = 0; j <= 4; j++) pts.push([Math.cos(a0 + ((a1 - a0) * j) / 4) * (r0 - 1.5), Math.sin(a0 + ((a1 - a0) * j) / 4) * (r0 - 1.5)]);
                for (let j = 4; j >= 0; j--) pts.push([Math.cos(a0 + ((a1 - a0) * j) / 4) * (r1 + 1.5), Math.sin(a0 + ((a1 - a0) * j) / 4) * (r1 + 1.5)]);
                const v = 0.7 + r() * 0.6, lit = 0.5 + 0.5 * Math.cos((a0 + a1) / 2 - Math.PI / 4); // the far wall, lower right, takes the moon
                g.fillStyle = `rgb(${(30 + 50 * lit) * v * (1 - t * 0.6)},${(52 + 70 * lit) * v * (1 - t * 0.6)},${(44 + 58 * lit) * v * (1 - t * 0.6)})`;
                G.poly(g, pts);
                // a wet glint on its upper edge, moss in its joint
                if (r() < 0.4) G.line(g, pts.slice(0, 5).map(([x, y]) => [x * 0.99, y * 0.99]), 1.2, `rgba(200,236,220,${0.15 + lit * 0.35})`);
                if (r() < 0.3) {
                    g.fillStyle = `rgba(${40 + r() * 30},${100 + r() * 40},${54 + r() * 20},0.75)`;
                    G.oval(g, pts[9][0], pts[9][1], 6 + r() * 8, 2.5 + r() * 2, (a0 + a1) / 2 + Math.PI / 2);
                }
            }
        }
        // the curb's shadow on the upper-left of the shaft
        G.softly(g, 18, (q) => {
            q.fillStyle = 'rgba(1,5,3,0.7)';
            q.beginPath();
            q.arc(-70, -80, RI, 0, TAU);
            q.arc(40, 50, RI * 0.98, 0, TAU, true);
            q.fill();
        });
        g.restore();
        // the rope's grooves on the curb's inner lip
        for (const a of [-0.5, 0.1, 2.6]) {
            const x = Math.cos(a) * RI, y = Math.sin(a) * RI;
            g.fillStyle = 'rgba(4,14,10,0.8)';
            G.oval(g, x, y, 14, 6, a + Math.PI / 2);
            g.fillStyle = 'rgba(190,220,206,0.55)';
            G.oval(g, x + Math.cos(a) * 6, y + Math.sin(a) * 6, 12, 2, a + Math.PI / 2);
        }
        // maidenhair fern in the damp joints, hanging into the shaft
        for (let i = 0; i < 15; i++) fern(g, (i / 15) * TAU + r() * 0.3, RI - 4 - r() * 30, r);
        // the frog on the curb, come for the damp
        G.frog(g, { x: -290, y: 300, s: 1.6, rot: -2.3 });
        // the water: black-green, a skin of light on it
        const wg = g.createRadialGradient(-60, -70, 20, 0, 0, RW);
        wg.addColorStop(0, '#04100b');
        wg.addColorStop(0.7, '#0a2018');
        wg.addColorStop(1, '#16342a');
        g.fillStyle = wg;
        G.poly(g, oct(RW));
        // the sky's light in the water near its edge, the curb's reflection, the depth
        G.softly(g, 10, (q) => {
            q.strokeStyle = 'rgba(120,180,158,0.28)';
            q.lineWidth = 26;
            q.beginPath();
            S.trace(q, oct(RW - 18));
            q.stroke();
        });
        // jasmine petals fallen on the water, a dead moth, bubbles
        for (let i = 0; i < 14; i++) {
            const a = r() * TAU, d = 160 + r() * 100, x = Math.cos(a) * d, y = Math.sin(a) * d, a0 = r() * TAU;
            const ps = 0.7 + r() * 0.6, tilt = 0.5 + r() * 0.5;
            for (let p = 0; p < 5; p++) {
                if (r() < 0.15) continue; // a petal lost
                g.fillStyle = `rgba(206,230,220,${0.45 + r() * 0.3})`;
                G.oval(g, x + Math.cos(a0 + p * 1.26) * 5 * ps, y + Math.sin(a0 + p * 1.26) * 5 * ps * tilt, 5 * ps, 2.6 * ps, a0 + p * 1.26);
            }
            g.fillStyle = 'rgba(90,130,110,0.7)';
            G.disc(g, x, y, 1.2 * ps);
        }
        for (let i = 0; i < 30; i++) {
            const a = r() * TAU, d = 150 + r() * 115;
            g.strokeStyle = 'rgba(180,220,204,0.5)';
            g.lineWidth = 0.8;
            g.beginPath();
            g.arc(Math.cos(a) * d, Math.sin(a) * d, 1.5 + r() * 2.5, 0, TAU);
            g.stroke();
        }
        // a water strider: four long legs on four dimples of the skin
        {
            const x = 205, y = -40;
            for (const [dx, dy] of [[-30, -22], [-30, 22], [26, -26], [26, 26]]) {
                G.line(g, [[x, y], [x + dx * 0.4, y + dy * 0.7], [x + dx, y + dy]], 1, '#0a1a12');
                g.strokeStyle = 'rgba(180,226,206,0.5)';
                g.lineWidth = 1;
                g.beginPath();
                g.arc(x + dx, y + dy, 4, 0, TAU);
                g.stroke();
            }
            G.line(g, [[x - 8, y], [x + 10, y]], 3, '#0a1a12');
            G.line(g, [[x + 8, y], [x + 18, y - 4]], 1, '#0a1a12');
        }
        // rings where drops fall
        for (const [x, y, n] of [[180, 120, 4], [-150, 170, 3], [120, -200, 3]]) {
            for (let k = 0; k < n; k++) {
                g.strokeStyle = `rgba(170,214,196,${0.35 - k * 0.07})`;
                g.lineWidth = 1.4;
                g.beginPath();
                g.ellipse(x, y, 8 + k * 11, 6 + k * 8, 0.3, 0, TAU);
                g.stroke();
            }
        }
        // a fig leaf floating, its reflection under it
        const fl = G.figLeaf(2, 0.8, rs, 'shade');
        G.put(g, fl, 150, 150, 0.7, { rot: 0.8, alpha: 0.95 });
        // the icicle of moon: the thick crescent's reflection, drawn down, its lit edge on the
        // right (a waxing moon), broken by the ripples
        icicle(g, -150, -150, 64, r);
    }
    function icicle(g, x, y, R, r) {
        const glow = g.createRadialGradient(x, y + R * 0.3, 0, x, y + R * 0.3, R * 2.6);
        glow.addColorStop(0, 'rgba(190,232,214,0.35)');
        glow.addColorStop(1, 'rgba(190,232,214,0)');
        g.fillStyle = glow;
        g.fillRect(x - R * 2.6, y - R * 2.3, R * 5.2, R * 5.2);
        // the crescent: outer disc minus an offset disc, stretched downward into a drip
        const shape = [];
        for (let i = 0; i <= 40; i++) {
            const a = -Math.PI / 2 + (i / 40) * Math.PI;
            shape.push([x + Math.cos(a) * R, y + Math.sin(a) * R * 1.35]);
        }
        for (let i = 40; i >= 0; i--) {
            const a = -Math.PI / 2 + (i / 40) * Math.PI, k = 0.42;
            shape.push([x - R * 0.12 + Math.cos(a) * R * k, y + Math.sin(a) * R * 1.3]);
        }
        // the drip: the lower horn drawn out
        const drip = [[x + R * 0.1, y + R * 1.2], [x + R * 0.3, y + R * 1.6], [x + R * 0.18, y + R * 2.4], [x + R * 0.1, y + R * 1.7]];
        g.save();
        g.shadowColor = 'rgba(210,244,230,0.9)';
        g.shadowBlur = R * 0.4 * S.pxScale(g);
        g.fillStyle = '#e2f2ea';
        G.poly(g, shape);
        G.poly(g, S.curve(drip, true, 6));
        g.restore();
        // the ripples break it into slices: dark gaps in it, bright scales beside it
        g.save();
        g.beginPath();
        S.trace(g, shape);
        g.clip();
        for (let k = 0; k < 9; k++) {
            const yy = y - R * 1.2 + k * R * 0.42 + r() * 4;
            g.fillStyle = 'rgba(14,40,30,0.55)';
            g.fillRect(x - R * 1.2, yy, R * 2.4, 1.4 + r() * 1.6);
        }
        g.restore();
        for (let k = 0; k < 10; k++) {
            const yy = y - R * 1.1 + k * R * 0.36 + r() * 4;
            g.fillStyle = `rgba(226,246,238,${0.25 + r() * 0.35})`;
            g.fillRect(x + R * (0.5 + r() * 0.6), yy, R * (0.15 + r() * 0.3), 1.3);
        }
    }
    function fern(g, a, rad, r) {
        // a frond of maidenhair: a black wiry stalk, fan-shaped pinnules hanging off it
        const x0 = Math.cos(a) * rad, y0 = Math.sin(a) * rad, inward = a + Math.PI + (r() - 0.5) * 0.6, len = 80 + r() * 60;
        const pts = [];
        for (let k = 0; k <= 10; k++) {
            const t = k / 10;
            pts.push([x0 + Math.cos(inward) * len * t, y0 + Math.sin(inward) * len * t + t * t * 12]);
        }
        G.line(g, pts, 1.4, '#050c08');
        for (let k = 2; k <= 10; k++) {
            for (const sg of [-1, 1]) {
                if (r() < 0.2) continue;
                const [px, py] = pts[k], b = inward + sg * (0.9 + r() * 0.5), l = (14 + r() * 8) * (1 - k * 0.04), cx = px + Math.cos(b) * l * 0.6, cy = py + Math.sin(b) * l * 0.6;
                G.line(g, [[px, py], [cx, cy]], 0.6, '#050c08');
                g.fillStyle = r() < 0.5 ? '#3f8a52' : '#2a6a3c';
                g.beginPath();
                g.moveTo(px, py);
                g.arc(cx, cy, l * 0.5, b - 1.3, b + 1.3);
                g.closePath();
                g.fill();
                g.strokeStyle = 'rgba(170,220,180,0.45)';
                g.lineWidth = 0.8;
                g.beginPath();
                g.arc(cx, cy, l * 0.5, b - 1.1, b + 0.2);
                g.stroke();
            }
        }
    }
    function bucket(g, x, y, r) {
        // a tin bucket lying on its side, its bail, a coil of wet rope beside it
        g.fillStyle = 'rgba(2,8,6,0.55)';
        G.oval(g, x + 16, y + 26, 120, 70, -0.3);
        const gr = g.createLinearGradient(x - 60, y - 60, x + 60, y + 60);
        gr.addColorStop(0, '#c4d6ce');
        gr.addColorStop(0.5, '#6e8880');
        gr.addColorStop(1, '#203630');
        g.fillStyle = gr;
        G.poly(g, [[x - 100, y - 20], [x + 40, y - 70], [x + 80, y + 30], [x - 70, y + 70]]);
        g.fillStyle = '#081510';
        G.oval(g, x + 62, y - 18, 30, 52, -0.4);
        g.strokeStyle = '#b4c8c0';
        g.lineWidth = 4;
        g.beginPath();
        g.ellipse(x + 62, y - 18, 30, 52, -0.4, 0, TAU);
        g.stroke();
        for (const f of [0.3, 0.6]) G.line(g, [[x - 100 + 140 * f, y - 20 - 50 * f], [x - 70 + 150 * f, y + 70 - 40 * f]], 2, 'rgba(10,24,18,0.5)');
        G.line(g, S.curve([[x - 80, y + 10], [x - 140, y - 80], [x - 40, y - 120], [x + 30, y - 60]], false, 8), 3, '#2a3c34');
        // the rope, coiled
        for (let k = 0; k < 5; k++) {
            g.strokeStyle = k % 2 ? '#5a6e64' : '#3a4c44';
            g.lineWidth = 9;
            g.beginPath();
            g.ellipse(x - 230, y + 80, 40 + k * 13, 28 + k * 9, -0.2, 0, TAU);
            g.stroke();
            g.strokeStyle = 'rgba(200,220,210,0.35)';
            g.lineWidth = 2;
            g.beginPath();
            g.ellipse(x - 230, y + 80, 40 + k * 13, 28 + k * 9, -0.2, 3.3, 5);
            g.stroke();
        }
    }
    return L;
};
// The stratum for the second passage: three layers, ids 'green-s-far', 'green-s-mid', 'green-s-near'.
Tableau.green.stratum = (z) => Tableau.green(z, { stratum: true });
// The loose stratum (round 8): one floating layer per piece, ids 'green-l-…', in z ± 280.
Tableau.green.loose = (z) => Tableau.green(z, { loose: true });
Tableau.green.Z = { s1: [0, 140, 280], s2: [520, 660, 800], s3: [1040, 1180, 1320], plate: 1760 };
Tableau.green.depth = 1760; // from z0 (the fig's nearest sheet) to the cistern
Tableau.green.hole = 140; // the cistern's mouth, into black water
