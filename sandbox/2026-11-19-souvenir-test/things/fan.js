// A painted folding fan («abanico pintado»), in the emblem manner: pierced and carved sticks,
// a pleated silk leaf with a miniature landscape painted across its folds, a gold border
// with a lettered cartouche, a blonda lace edge, a rivet with its ring and a silk tassel.
// Open, it is a wing. Global: Fan.
//
//   Fan.draw(g, { x, y, r, a0, a1, n, seed, scene, label, text, tassel })
//       pivot at (x, y), opening from a0 to a1 (rad, canvas angles; a1 < a0 opens the other
//       way). Sticks from the pivot to 0.44 r (their heads reach 0.057 r behind it), the
//       leaf from 0.44 r to 0.95 r, lace to about 1.03 r; the tassel hangs 0.26 r straight
//       down the page from the pivot. n sticks' worth of pleats (n + 1 sticks, 2 n faces).
//       scene   'granada' | 'sevilla' (default by seed: a seed ending in R → 'sevilla')
//       label   where the cartouche sits along the outer border, 0..1 from the smaller angle
//               (default 0.27 for granada, 0.73 for sevilla: in the emblem a swallow flies
//               across the middle of each fan; pass 0.5 to centre it)
//       text    the cartouche's lettering (default «Recuerdo de Granada» / «… de Sevilla»;
//               needs the font 'IM Fell DW Pica SC')
//       tassel  false leaves the cord and tassel out
//   Fan.at(o, u, v)   the page point of the leaf's (u, v): u along the arc from the smaller
//                     angle, v from the inner edge (0) to the outer (1), for the same `o`
//   Fan.COL           the palette
//
// Painted once, static, straight onto the caller's context (which may be scaled). The fan
// casts its own shadows with `source-atop`: paint it on a transparent layer, as the film does.
// The context is only moved and scaled, never turned: the light stays at the top left.
//
// ---------------------------------------------------------------------------------------
// ANATOMY (what the real thing is, and the small true details painted here)
//
// The fan. Sticks («varillas») turn on a rivet («clavillo») through their heads; the two
// outer ones are the guards («padrones»), thicker. The bare lower part of the sticks is the
// «fuente»; above the shoulder each stick thins to a rib glued behind the leaf («país»).
//  1 the sticks overlap like the blades they are: the upper one shades the one below
//  2 two fretwork designs alternate from stick to stick (drop, twin eyes and a trefoil
//    with a lozenge lattice / keyhole, tears, a quatrefoil and a slit between eyelets)
//  3 a hole shows what is behind it, a dark wall on its near side, a lit wall on the far one
//  4 an incised line runs inside the outline of every stick (a groove: dark, then light)
//  5 a flower on the medallion: gilt daisies and painted carnations by turns, gold studs
//  6 bone has a grain along the stick, yellows with age and is darker where fingers hold it
//  7 the front guard lies on top of the leaf's last fold; the far one shows behind the first
//  8 the guards are carved in relief: a vine climbing them, leaf and mother-of-pearl by turns
//  9 one stick has an old crack mended with two wire staples; scratches cross the grain
// 10 the leaf's folds are not evenly spaced; the crests are worn pale where it has been
//    folded a thousand times, and each crest carries a thin line of light
//
// Granada at dusk, as from the Albaicín (San Nicolás), looking south-east: the Generalife
// white on the Cerro del Sol to the LEFT, the Alcazaba with the Torre de la Vela at the
// RIGHT end over the town, the Sierra Nevada behind, the sun gone down to the right.
//  1 the Vela's bell gable (espadaña) on its top, and its flags
//  2 the Torre de Comares, the largest: square, three windows a side, battlements
//  3 the Peinador de la Reina: a little tower with an open gallery under a tiled roof
//  4 Charles V's palace: a square stone block, round windows over square ones, no battlements
//  5 Santa María de la Alhambra's slender bell tower between palace and palaces
//  6 the Torre Quebrada («the cracked tower») has its crack; putlog holes dot every tower
//  7 the Generalife's arcade and its walk of cypresses; cypresses as spindles with a lit side
//  8 the Sierra's snow goes pink where it faces the sunset and blue where it does not
//  9 the Darro in its ravine, in shadow already, with a one-arched bridge
// 10 the Albaicín: white cubes, terracotta roofs, lit windows, a mudéjar church tower,
//    a cat on a ridge, washing on a line, smoke, the first stars and Venus, swifts
//
// Seville in the morning, from Triana's bank: the bridge to the left, the Torre del Oro on
// the quay to the right, the cathedral and the Giralda behind.
//  1 the Giralda: an Almohad brick shaft with sebka (lozenge) panels either side of a
//    column of balconied windows, a Renaissance belfry in shrinking tiers on top
//  2 the four bronze lily vases on the belfry's corners; the bells in its arches
//  3 the Giraldillo: the weathervane, a figure with a shield and a palm
//  4 the cathedral: a long stepped Gothic roofline, pinnacles, flying buttresses, a rose
//  5 the Torre del Oro: twelve-sided, a second twelve-sided body, a lantern, a golden dome
//  6 the Triana bridge: iron arches with a row of rings shrinking towards each crown
//  7 Triana: painted fronts, the Capilla del Carmen's tiled dome at the bridge's end,
//    bottle kilns of the potteries behind
//  8 orange trees with fruit on the quay, palms, a horse carriage, people as dots
//  9 the river in horizontal dabs, reflections broken the same way, a lateen sail, a
//    rowing boat with its oars' rings
// 10 a stork's nest on a belfry, a man fishing off the quay, summer clouds with flat bases
//
// Blonda (silk bobbin lace): a tulle net you can see through, bold flowers worked dense in
// thicker thread with a brighter cord round them, a scalloped edge with picots.
//  1 the net is open: the night shows between the threads   2 a header band with a row of
//  eyelets sews it to the leaf   3 three motifs by turns (rose, palmette, sprig)   4 eyes:
//  round holes ringed with thread   5 a ladder inside the scalloped edge   6 picots outside
//  it   7 it is pleated with the leaf: ivory in the light, lilac in the shade   8 a torn
//  place   9 a thread or two come loose   10 no two scallops the same height
//
// The tassel («borla»): a cord of twisted silk looped through the rivet's ring, a head
// netted in gold thread, a bound neck, a ruff of short threads, a skirt thread by thread.
const Fan = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2, INK = S.INK, SD = S.SHADE_DIR, TOL = [-SD[0], -SD[1]]; // TOL: towards the light, on the page
    const COL = {
        leaf: '#1f7350', leafLight: '#46a676', leafDeep: '#0b3a2f',
        stick: '#ecdcb4', stickLight: '#f8efd6', stickShade: '#9c7745', stickDeep: '#5e4326',
        gold: '#d9a441', goldLight: '#f6dc8a', goldDeep: '#8a5a17', glint: '#fff6cf',
        lace: '#f4efe4', laceShade: '#8f8db0', nacre: '#f3f0ea', silk: '#efe3c4',
        red: '#cf3a3c', redDeep: '#7a1428', redLight: '#f39a8c', sprig: '#a5d48c',
        tassel: '#c8322f', tasselDeep: '#6d1226', tasselLight: '#f39a8c', tasselInk: '#2a0d24',
    };
    // Everything is drawn at r = 600 about the pivot and scaled: the sticks reach R0, the
    // leaf runs from R0 to R1, its middle radius is RM, HB is its height.
    const R0 = 264, R1 = 570, RM = 417, HB = R1 - R0;

    // ------------------------------------------------------------------ small tools
    const fillP = (g, pts, style, rule) => {
        g.beginPath();
        S.trace(g, pts);
        g.fillStyle = style;
        if (rule) g.fill(rule);
        else g.fill();
    };
    const strokeP = (g, pts, w, style, closed = false, cap = 'round') => {
        g.beginPath();
        S.trace(g, pts, closed);
        g.lineWidth = w;
        g.strokeStyle = style;
        g.lineJoin = 'round';
        g.lineCap = cap;
        g.stroke();
    };
    const disc = (g, p, r, style) => {
        g.beginPath();
        g.arc(p[0], p[1], r, 0, TAU);
        g.fillStyle = style;
        g.fill();
    };
    const pol = (rho, a) => [Math.cos(a) * rho, Math.sin(a) * rho];
    const lerp = (a, b, t) => a + (b - a) * t;
    const shift = (pts, d, k = 1) => pts.map(([x, y]) => [x + d[0] * k, y + d[1] * k]);
    // a colour a little darker or lighter: nothing hand-painted is one tone
    const toner = (rnd) => (c, amt = 0.14) => {
        const u = rnd();
        return u < 0.5 ? S.mix(c, '#221a3a', (0.5 - u) * 2 * amt) : S.mix(c, '#fff4d8', (u - 0.5) * 2 * amt * 0.9);
    };
    // the height of a polyline [[X, Y], …] (X ascending) at X
    const yAt = (line, X) => {
        if (X <= line[0][0]) return line[0][1];
        for (let i = 1; i < line.length; i++) if (X <= line[i][0]) return lerp(line[i - 1][1], line[i][1], (X - line[i - 1][0]) / (line[i][0] - line[i - 1][0] || 1));
        return line[line.length - 1][1];
    };
    // a gradient that turns about the pivot: `stops` run from angle aFrom to aTo
    const wedgeGrad = (g, aFrom, aTo, stops) => {
        const lo = Math.min(aFrom, aTo), d = Math.abs(aTo - aFrom) / TAU, gr = g.createConicGradient(lo, 0, 0);
        const st = aFrom < aTo ? stops : stops.map(([t, c]) => [1 - t, c]).reverse();
        for (const [t, c] of st) gr.addColorStop(Math.max(0, Math.min(1, t * d)), c);
        return gr;
    };
    // gold laid on paint: a dark line under it, the gold, a light along its lit side
    const gilt = (g, pts, w, closed = false) => {
        strokeP(g, shift(pts, SD, 0.5), w + 0.5, 'rgba(46,24,6,0.72)', closed);
        strokeP(g, pts, w, COL.gold, closed);
        strokeP(g, shift(pts, TOL, w * 0.2), w * 0.36, COL.goldLight, closed);
    };
    const giltFill = (g, pts) => {
        fillP(g, shift(pts, SD, 0.55), 'rgba(46,24,6,0.72)');
        fillP(g, pts, COL.gold);
        g.save();
        g.beginPath();
        S.trace(g, pts);
        g.clip();
        fillP(g, shift(pts, SD, 0.7), 'rgba(138,90,23,0.55)');
        fillP(g, shift(pts, SD, 1.5), COL.gold);
        strokeP(g, shift(pts, SD, 0.35), 0.5, COL.goldLight, true);
        g.restore();
    };
    // a bead: a pearl, a stud, a set stone
    const bead = (g, p, r, C, lw = 0.5) => {
        disc(g, [p[0] + SD[0] * lw, p[1] + SD[1] * lw], r + lw * 0.8, 'rgba(26,18,40,0.85)');
        const gr = g.createRadialGradient(p[0] + TOL[0] * r * 0.4, p[1] + TOL[1] * r * 0.4, r * 0.08, p[0], p[1], r * 1.06);
        gr.addColorStop(0, C[2]);
        gr.addColorStop(0.5, C[1]);
        gr.addColorStop(1, C[0]);
        disc(g, p, r, gr);
        if (r > 0.9) disc(g, [p[0] + TOL[0] * r * 0.4, p[1] + TOL[1] * r * 0.4], r * 0.24, 'rgba(255,252,240,0.95)');
    };
    const GOLDB = ['#8a5a17', '#d9a441', '#f6dc8a'], PEARL = ['#9a94b4', '#e9e4dc', '#fffdf6'], RUBY = ['#5e1020', '#c23036', '#f39a8c'];

    // ------------------------------------------------------------------ pierced pieces
    // The airbrush in from every edge of a piece, the edges of its holes included.
    function sprayIn(g, pts, holes, { color = INK, alpha = 0.5, w = 10, push = null, dir = SD } = {}) {
        const m = g.getTransform(), k = Math.hypot(m.a, m.b), BIG = 20000, d = push ?? w * 0.6;
        const b = S.bbox(pts, w * 6 + 40);
        g.save();
        g.setTransform(m.a, m.b, m.c, m.d, m.e - BIG, m.f);
        g.shadowColor = S.rgba(color, alpha);
        g.shadowBlur = w * k;
        g.shadowOffsetX = BIG - dir[0] * d * k;
        g.shadowOffsetY = -dir[1] * d * k;
        g.fillStyle = '#000';
        g.beginPath();
        g.rect(b.x, b.y, b.w, b.h);
        S.trace(g, pts);
        for (const h of holes) S.trace(g, h);
        g.fill('evenodd');
        g.restore();
    }
    // One piece in the emblem manner with fretwork: like Souvenir.piece, but `holes` are cut
    // through it, so what is behind shows; each hole has a wall in shade on its near side
    // and a wall that catches the light on its far side.
    function pierced(g, pts, holes, o = {}) {
        const lw = o.line ?? 1.6, ink = o.ink ?? INK, heavy = o.heavy ?? 0.7, hl = o.holeLine ?? lw * 0.62, th = o.thick ?? 0;
        const path = (q) => {
            q.beginPath();
            S.trace(q, pts);
            for (const h of holes) S.trace(q, h);
        };
        if (o.cast) S.cast(g, (q) => { path(q); q.fillStyle = '#000'; q.fill('evenodd'); }, o.cast);
        // the heavy side of the contour, and the piece's thickness seen in its holes
        g.save();
        g.translate(SD[0] * (lw * heavy + th), SD[1] * (lw * heavy + th));
        path(g);
        g.fillStyle = o.edge ?? ink;
        g.fill('evenodd');
        g.lineJoin = 'round';
        g.lineWidth = lw;
        g.strokeStyle = ink;
        g.stroke();
        g.restore();
        if (typeof o.fill === 'object') {
            const gr = g.createLinearGradient(o.fill.from[0], o.fill.from[1], o.fill.to[0], o.fill.to[1]);
            for (const [t, c] of o.fill.stops) gr.addColorStop(t, c);
            g.fillStyle = gr;
        } else g.fillStyle = o.fill ?? '#ccc';
        path(g);
        g.fill('evenodd');
        g.save();
        path(g);
        g.clip('evenodd');
        for (const sh of [].concat(o.shade ?? [])) sprayIn(g, pts, holes, sh);
        for (const li of [].concat(o.light ?? [])) sprayIn(g, pts, holes, { color: '#fffdf4', alpha: 0.4, dir: TOL, ...li });
        if (o.detail) o.detail(g);
        g.restore();
        for (const h of holes) {
            g.save();
            g.beginPath();
            S.trace(g, h);
            g.clip();
            g.beginPath();
            S.trace(g, h);
            S.trace(g, shift(h, TOL, o.wallW ?? 1.5));
            g.fillStyle = o.wall ?? '#fff3d2';
            g.fill('evenodd');
            g.restore();
        }
        g.lineJoin = 'round';
        g.strokeStyle = ink;
        g.lineWidth = lw;
        g.beginPath();
        S.trace(g, pts);
        g.stroke();
        g.lineWidth = hl;
        for (const h of holes) {
            g.beginPath();
            S.trace(g, h);
            g.stroke();
        }
    }
    // A small thing carved in relief on a piece: its shadow on the ground, a lit rim, then
    // the thing itself, lighter towards the light.
    function relief(g, pts, o = {}) {
        const b = S.bbox(pts), cx = b.x + b.w / 2, cy = b.y + b.h / 2, rr = Math.max(b.w, b.h) * 0.6, d = o.depth ?? 1;
        fillP(g, shift(pts, SD, 1.2 * d), o.shadow ?? 'rgba(62,36,16,0.62)');
        fillP(g, shift(pts, TOL, 0.45 * d), o.rim ?? '#fffaf0');
        const gr = g.createLinearGradient(cx + TOL[0] * rr, cy + TOL[1] * rr, cx + SD[0] * rr, cy + SD[1] * rr);
        gr.addColorStop(0, o.light ?? '#fbf3dc');
        gr.addColorStop(0.55, o.fill ?? '#ecdcb4');
        gr.addColorStop(1, o.shade ?? '#c2a26c');
        fillP(g, pts, gr);
        if (o.line) strokeP(g, pts, o.line, o.ink ?? 'rgba(84,54,26,0.8)', true);
    }

    // shapes for fretwork, in a stick's own measures (u along it from the pivot, v across)
    const circ = (u, v, r, n = 14) => Array.from({ length: n }, (_, i) => [u + Math.cos((i / n) * TAU) * r, v + Math.sin((i / n) * TAU) * r]);
    // a drop: its point at u0, its round end at u1
    const tear = (u0, u1, w, v = 0, n = 22) => Array.from({ length: n }, (_, i) => {
        const th = (i / n) * TAU;
        return [u0 + ((u1 - u0) * (1 - Math.cos(th))) / 2, v + w * Math.sin(th) * Math.pow(Math.sin(th / 2), 1.3)];
    });
    // a trefoil, a quatrefoil
    const foil = (u, v, R, lobes, rot = 0, n = 40) => Array.from({ length: n }, (_, i) => {
        const th = (i / n) * TAU, k = 0.4 + 0.6 * Math.pow(Math.abs(Math.cos((lobes / 2) * (th - rot))), 0.75);
        return [u + Math.cos(th) * R * k, v + Math.sin(th) * R * k];
    });
    const lozenge = (u, v, a, b) => [[u - a, v], [u - a * 0.1, v + b], [u + a, v], [u + a * 0.1, v - b]];
    const slot = (u0, u1, w, v = 0) => S.curve([[u0, v], [u0 + w * 0.6, v + w], [u1 - w * 0.6, v + w], [u1, v], [u1 - w * 0.6, v - w], [u0 + w * 0.6, v - w]], true, 4);

    // A stick's frame: (u, v) → the page, u along the stick from the pivot, v across it.
    const frameOf = (a) => {
        const c = Math.cos(a), s = Math.sin(a);
        const F = (u, v) => [c * u - s * v, s * u + c * v];
        F.pts = (arr) => arr.map(([u, v]) => F(u, v));
        F.a = a;
        return F;
    };
    const blade = (F, prof, seg = 4) => F.pts(S.curve([...prof, ...prof.slice().reverse().map(([u, w]) => [u, -w])], true, seg));
    const profW = (prof, u) => yAt(prof, u);
    // [u, half-width]: a round head behind the rivet, a neck, a lobe, the medallion, a waist,
    // the shoulder that goes under the leaf
    const PROF = [[-33, 3.4], [-29, 7], [-15, 8.7], [0, 8.3], [30, 7.4], [52, 8.2], [78, 11], [100, 14.6], [116, 15.3], [130, 12.6], [142, 10.6], [156, 12.2], [172, 15.4], [186, 16.1], [200, 14.6], [211, 11.8], [223, 11.3], [237, 13.6], [251, 15.6], [265, 16.3], [275, 16.3]];
    const PROF_G = [[-35, 4], [-31, 8.4], [-15, 10.2], [0, 9.8], [40, 9.2], [90, 11], [150, 13.6], [230, 15.8], [330, 17.2], [440, 17.8], [520, 16.8], [556, 14.6], [572, 10.6], [580, 5.6], [583, 2.2]];

    // the grain of bone or wood, the grime of fingers, scratches: for sticks and guards
    function boneSkin(q, F, prof, rnd, u0, u1) {
        for (let k = 0; k < 22; k++) {
            const f = (rnd() - 0.5) * 1.84, a = u0 + rnd() * (u1 - u0) * 0.6, b = Math.min(u1, a + (0.2 + rnd() * 0.7) * (u1 - u0)), pts = [], ph = rnd() * 9, wob = 0.3 + rnd() * 0.5;
            for (let u = a; u <= b; u += 7) pts.push(F(u, f * profW(prof, u) + Math.sin(u * 0.11 + ph) * wob));
            if (pts.length < 2) continue;
            strokeP(q, pts, 0.3 + rnd() * 0.45, rnd() < 0.62 ? `rgba(128,92,48,${0.14 + rnd() * 0.3})` : `rgba(255,250,232,${0.25 + rnd() * 0.35})`);
        }
        // pores: short dark ticks along the grain
        for (let k = 0; k < 46; k++) {
            const u = u0 + rnd() * (u1 - u0), f = (rnd() - 0.5) * 1.7, len = 0.8 + rnd() * 2.4;
            strokeP(q, [F(u, f * profW(prof, u)), F(u + len, f * profW(prof, u))], 0.3 + rnd() * 0.25, `rgba(110,76,40,${0.25 + rnd() * 0.35})`);
        }
        // where fingers hold it: darker, yellower towards the head
        const p0 = F(-36, 0), p1 = F(132, 0), gr = q.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
        gr.addColorStop(0, 'rgba(96,58,26,0.55)');
        gr.addColorStop(0.45, 'rgba(120,76,30,0.26)');
        gr.addColorStop(1, 'rgba(120,76,30,0)');
        q.fillStyle = gr;
        q.fillRect(-700, -700, 1400, 1400);
        // scratches across the grain
        for (let k = 0; k < 5; k++) {
            const u = u0 + rnd() * (u1 - u0), v = (rnd() - 0.5) * profW(prof, u), an = (rnd() - 0.5) * 1.6, len = 4 + rnd() * 12;
            strokeP(q, [F(u, v), F(u + Math.cos(an) * len, v + Math.sin(an) * len)], 0.28, `rgba(255,252,238,${0.35 + rnd() * 0.3})`);
        }
    }
    // a line cut into the surface: dark, with the lit lip of the groove beside it
    const incise = (q, pts, w = 0.55, a = 0.8) => {
        strokeP(q, shift(pts, SD, 0.45), w * 0.9, `rgba(255,249,228,${a * 0.75})`);
        strokeP(q, pts, w, `rgba(112,78,40,${a})`);
    };
    // a ruffled disc: a tier of a carnation's petals seen from above
    const ruff = (c, r, n, depth, ph, sd) => {
        const pts = [], m = n * 10;
        for (let i = 0; i < m; i++) {
            const a = (i / m) * TAU, u = (i / m) * n, k = Math.floor(u), f = u - k;
            const lobe = Math.pow(Math.sin(f * Math.PI), 0.55), size = 0.86 + 0.14 * S.hashI(k, n, 2, sd);
            const pink = 0.05 * (Math.sin(f * Math.PI * 5) > 0 ? 1 : -1) * lobe;
            pts.push([c[0] + Math.cos(a + ph) * r * size * (1 - depth + depth * lobe + pink), c[1] + Math.sin(a + ph) * r * size * (1 - depth + depth * lobe + pink)]);
        }
        return pts;
    };
    // a small carnation painted in oils on bone or silk (also the old Fan.carnation)
    function carnation(g, x, y, r, seed) {
        const sd = S.seedOf(seed), ph = (sd % 100) / 16, lw = Math.max(0.45, r * 0.06);
        const tier = (k, rr, col, dk) => {
            const pts = ruff([x - r * 0.04 * k, y - r * 0.05 * k], rr, 9 - k * 2, 0.3, ph + k * 0.55, sd + k);
            fillP(g, shift(pts, SD, lw * 1.3), S.rgba(COL.redDeep, 0.8));
            fillP(g, pts, col);
            g.save();
            g.beginPath();
            S.trace(g, pts);
            g.clip();
            strokeP(g, shift(pts, SD, -rr * 0.12), rr * 0.3, S.rgba(COL.redLight, 0.45), true);
            strokeP(g, shift(pts, SD, rr * 0.1), rr * 0.26, S.rgba(dk, 0.6), true);
            g.restore();
            strokeP(g, pts, lw, COL.redDeep, true);
        };
        tier(0, r, COL.red, COL.redDeep);
        tier(1, r * 0.72, '#d94a47', COL.redDeep);
        tier(2, r * 0.44, '#e8665c', COL.red);
        disc(g, [x - r * 0.12, y - r * 0.15], r * 0.13, COL.redLight);
    }

    // ------------------------------------------------------------------ the sticks
    function stickDetail(q, F, kind, rnd, sc, flaw) {
        boneSkin(q, F, PROF, rnd, -30, 274);
        // the incised line inside the outline, both sides, and a few cuts across the neck
        for (const sgn of [1, -1]) {
            const pts = [];
            for (let u = 44; u <= 274; u += 4) pts.push(F(u, sgn * (profW(PROF, u) - 2.3)));
            incise(q, pts, 0.55, 0.75);
        }
        for (let k = 0; k < 4; k++) incise(q, [F(14 + k * 6.5, -4.6), F(17.5 + k * 6.5, 0), F(14 + k * 6.5, 4.6)], 0.5, 0.7);
        incise(q, F.pts(circ(144, 0, 3.4, 12).concat([[147.4, 0]])), 0.5, 0.7);
        // the medallion: a gilt daisy (design 0) or a painted carnation (design 1), with its
        // leaves towards the pivot and gold studs set round it
        const c = F(186, 0);
        if (kind === 0) {
            giltFill(q, F.pts(S.curve([[160, 0], [166, 3.4], [174, 2.2], [178, 0], [174, -0.6], [166, 0.9]], true, 4)));
            giltFill(q, F.pts(S.curve([[163, -1], [168, -5.6], [175, -4.4], [178, -1], [173, -1.7], [168, -2.6]], true, 4)));
            for (let k = 0; k < 8; k++) {
                const th = (k / 8) * TAU + 0.25 + (rnd() - 0.5) * 0.12, pc = F(186 + Math.cos(th) * 4.5 * sc, Math.sin(th) * 4.5 * sc);
                giltFill(q, S.ellipse(pc[0], pc[1], 3.3 * sc, 1.55 * sc, 12, th + F.a));
            }
            bead(q, c, 2.1 * sc, RUBY, 0.5);
        } else {
            const stem = F.pts(S.curve([[158, 1.5], [166, -1], [174, 0.6], [181, 0]], false, 5));
            strokeP(q, shift(stem, SD, 0.5), 1.5, 'rgba(40,30,20,0.6)');
            strokeP(q, stem, 1.1, '#3f7a52');
            for (const [u, v, uu, vv] of [[164, -0.6, 170, -6.4], [168, 0, 161, 6.2]]) {
                const lf = F.pts(S.curve([[u, v], [lerp(u, uu, 0.5) + (vv > 0 ? 2 : -2), lerp(v, vv, 0.5) + 1.6], [uu, vv], [lerp(u, uu, 0.5) - (vv > 0 ? 2 : -2), lerp(v, vv, 0.5) - 1.6]], true, 4));
                fillP(q, shift(lf, SD, 0.5), 'rgba(30,30,24,0.6)');
                fillP(q, lf, '#4f8f60');
                strokeP(q, [F(u, v), F(uu, vv)], 0.35, '#1d4a34');
            }
            const cal = F.pts([[178.5, -2.1], [183, -3], [183, 3], [178.5, 2.1]]);
            fillP(q, cal, '#3f7a52');
            strokeP(q, cal, 0.4, '#1d4a34', true);
            carnation(q, c[0], c[1], 6.6 * sc, 'st' + Math.floor(rnd() * 1e6));
        }
        const ns = kind === 0 ? 10 : 8;
        for (let k = 0; k < ns; k++) {
            if (flaw && k === 3) {
                // a stud lost: its empty socket
                disc(q, F(186 + Math.cos((k / ns) * TAU) * 13.6, Math.sin((k / ns) * TAU) * 11.2), 0.8, 'rgba(70,44,22,0.85)');
                continue;
            }
            const th = (k / ns) * TAU + (kind ? 0.39 : 0);
            bead(q, F(186 + Math.cos(th) * 13.6, Math.sin(th) * 11.2), 0.95, GOLDB, 0.4);
        }
        // little gilt sprigs under the lattice, a stud on the lobe
        bead(q, F(105, 0), 1.2, GOLDB, 0.4);
        for (const sgn of [1, -1]) incise(q, F.pts(S.curve([[226, sgn * 2], [229, sgn * 6.4], [224, sgn * 8.6]], false, 4)), 0.45, 0.65);
        if (flaw) {
            // an old crack along the grain, mended with two wire staples
            const cr = [];
            for (let u = 128; u <= 172; u += 4) cr.push(F(u, 7.2 + Math.sin(u * 0.4) * 0.7 - (u - 128) * 0.05));
            strokeP(q, cr, 0.5, 'rgba(60,36,20,0.9)');
            for (const u of [140, 158]) {
                const a = F(u, 5.2), b = F(u + 0.6, 9.4);
                strokeP(q, shift([a, b], SD, 0.4), 0.9, 'rgba(30,20,30,0.7)');
                strokeP(q, [a, b], 0.7, '#c8c2b4');
                disc(q, a, 0.6, '#8a8478');
                disc(q, b, 0.6, '#8a8478');
            }
        }
    }
    function stick(g, G, a, i) {
        const F = frameOf(a), rnd = Motion.rng(`stick/${G.seed}/${i}`), tone = toner(rnd);
        const kind = i % 2, sc = 0.92 + rnd() * 0.16, flaw = i === G.flaw;
        const H = [];
        if (kind === 0) {
            H.push(tear(62, 99, 4.5 * sc), circ(115, 6.5, 2.3 * sc), circ(115, -6.5, 2.3 * sc), lozenge(129, 0, 4.2, 2.5));
            H.push(foil(217, 0, 5.6 * sc, 3, 0));
            for (const [u, v] of [[236, 6], [236, -6], [246.5, 0], [257, 6], [257, -6], [267.5, 0]]) H.push(lozenge(u, v, 3.9, 2.7));
        } else {
            H.push(slot(60, 90, 3 * sc), circ(98.5, 0, 3.3 * sc), tear(127, 110, 3.3 * sc, 6.3), tear(127, 110, 3.3 * sc, -6.3));
            H.push(foil(217, 0, 5.8 * sc, 4, Math.PI / 4));
            for (const u of [235, 244.5, 254, 263.5]) H.push(circ(u, 6.9, 2), circ(u, -6.9, 2));
            H.push(slot(237, 262, 1.7));
        }
        const base = tone(COL.stick, 0.12);
        pierced(g, blade(F, PROF), H.map((h) => F.pts(h)), {
            fill: { from: F(-34, 0), to: F(275, 0), stops: [[0, S.mix(base, '#8a6238', 0.5)], [0.22, S.mix(base, '#b89058', 0.28)], [0.5, base], [1, S.mix(base, '#fff6dc', 0.45)]] },
            line: 1.6, holeLine: 0.9, thick: 0.5, edge: '#4a3324',
            cast: { blur: 5, dx: 2.2, dy: 3.6, color: 'rgba(24,14,40,0.62)' },
            shade: { color: COL.stickShade, alpha: 0.7, w: 5 }, light: { color: '#fffbe8', alpha: 0.6, w: 2.2 },
            detail: (q) => stickDetail(q, F, kind, rnd, sc, flaw),
        });
    }

    // ------------------------------------------------------------------ the guards
    const VINE_LEAF = [[0, 0], [0.24, 0.3], [0.16, 0.62], [0.5, 0.44], [0.8, 0.52], [0.72, 0.2], [1, 0], [0.72, -0.2], [0.8, -0.52], [0.5, -0.44], [0.16, -0.62], [0.24, -0.3]];
    function guardDetail(q, F, rnd, tone) {
        boneSkin(q, F, PROF_G, rnd, -30, 582);
        // the carved panel: a sunk ground, stippled, inside a raised border
        const edge = (sgn, inset) => {
            const pts = [];
            for (let u = 84; u <= 566; u += 6) pts.push([u, sgn * Math.max(1.5, profW(PROF_G, u) - inset)]);
            return pts;
        };
        const ground = F.pts([[80, 0], ...edge(1, 3.1), [571, 0], ...edge(-1, 3.1).reverse()]);
        q.save();
        q.beginPath();
        S.trace(q, ground);
        q.clip();
        fillP(q, ground, 'rgba(132,92,48,0.34)');
        strokeP(q, shift(ground, SD, 0.8), 1.8, 'rgba(66,40,18,0.62)', true);
        strokeP(q, shift(ground, TOL, 0.6), 1, 'rgba(255,250,232,0.7)', true);
        for (let k = 0; k < 520; k++) {
            const u = 84 + rnd() * 484, v = (rnd() - 0.5) * 2 * (profW(PROF_G, u) - 3.4);
            disc(q, F(u, v), 0.3 + rnd() * 0.25, `rgba(84,52,24,${0.3 + rnd() * 0.4})`);
        }
        // the vine: a stem that climbs in a wave, a leaf or a mother-of-pearl flower in
        // every hollow, tendrils
        const lam = 58, amp = (u) => (profW(PROF_G, u) - 6.4) * 0.6, sv = (u) => amp(u) * Math.sin(((u - 92) / lam) * TAU);
        const stem = [];
        for (let u = 90; u <= 560; u += 3) stem.push(F(u, sv(u)));
        strokeP(q, shift(stem, SD, 1), 2.7, 'rgba(62,36,16,0.62)');
        strokeP(q, shift(stem, TOL, 0.45), 2.3, '#fffaf0');
        strokeP(q, stem, 2, '#ecdcb4');
        strokeP(q, shift(stem, SD, 0.4), 0.5, 'rgba(150,112,62,0.7)');
        for (let k = 0; ; k++) {
            const u = 92 + lam / 4 + (k * lam) / 2;
            if (u > 552) break;
            const sgn = k % 2 === 0 ? 1 : -1, A = amp(u), hv = -sgn * (A * 0.72 + 1.2);
            if (k % 2 === 0 || k % 6 === 5) {
                // a vine leaf from the stem into the hollow, three-lobed, veined
                const s = 10.5 + rnd() * 2.5, th = sgn * (-0.5 - rnd() * 0.25), b = [u - 7.5, sgn * A * 0.55], c = Math.cos(th - sgn * 0.9), sn = Math.sin(th - sgn * 0.9);
                const pts = F.pts(VINE_LEAF.map(([x, y]) => [b[0] + (x * c - y * sn) * s, b[1] + (x * sn + y * c) * s * 0.92]));
                relief(q, pts, { line: 0.45 });
                const tip = F(b[0] + c * s, b[1] + sn * s), root = F(b[0], b[1]);
                incise(q, [root, [lerp(root[0], tip[0], 0.9), lerp(root[1], tip[1], 0.9)]], 0.4, 0.75);
                for (const lob of [3, 9]) {
                    const lp = pts[lob], m = [lerp(root[0], tip[0], 0.32), lerp(root[1], tip[1], 0.32)];
                    strokeP(q, [m, [lerp(m[0], lp[0], 0.8), lerp(m[1], lp[1], 0.8)]], 0.35, 'rgba(112,78,40,0.7)');
                }
            } else {
                // a five-petalled flower with a mother-of-pearl heart
                const c = F(u, hv), r0 = 3.1 + rnd() * 0.5;
                for (let p = 0; p < 5; p++) {
                    const th = (p / 5) * TAU + k, pc = [c[0] + Math.cos(th) * r0 * 1.25, c[1] + Math.sin(th) * r0 * 1.25];
                    relief(q, S.ellipse(pc[0], pc[1], r0 * 0.95, r0 * 0.72, 10, th), { line: 0.35, depth: 0.8 });
                }
                const hue = ['#f3c9d6', '#bfe6d8', '#c9d3f3'][k % 3];
                bead(q, c, 2.5, [S.mix(hue, '#8f8db0', 0.5), COL.nacre, '#fffdf4'], 0.5);
                strokeP(q, [[c[0] - 1.2, c[1] + 0.9], [c[0] + 0.2, c[1] + 1.5], [c[0] + 1.4, c[1] + 0.6]], 0.45, S.rgba(hue, 0.9));
            }
            // a dot of mother-of-pearl let into the border where the stem crosses over
            if (u + lam / 4 < 548) {
                const hue = ['#f3c9d6', '#bfe6d8', '#c9d3f3'][(k + 1) % 3], uu = u + lam / 4;
                bead(q, F(uu, sgn * (profW(PROF_G, uu) - 5.6)), 1.25 + rnd() * 0.3, [S.mix(hue, '#8f8db0', 0.5), COL.nacre, '#fffdf4'], 0.4);
            }
            // a tendril off the far side of the crest
            const t0 = [u + 9, sgn * A * 0.7], tn = [];
            for (let s = 0; s <= 1; s += 0.1) tn.push(F(t0[0] + s * 7 + Math.sin(s * 5.2) * 1.2 * (1 - s), t0[1] + sgn * (1.2 + (1 - Math.cos(s * 4.6)) * 2.1 * (1 - s * 0.55))));
            strokeP(q, shift(tn, SD, 0.6), 1.1, 'rgba(62,36,16,0.55)');
            strokeP(q, tn, 0.8, '#f8edd0');
        }
        q.restore();
        // the raised border's own incised line, and inlaid mother-of-pearl dots along it
        for (const sgn of [1, -1]) {
            const pts = [];
            for (let u = 20; u <= 574; u += 6) pts.push(F(u, sgn * Math.max(0.8, profW(PROF_G, u) - 1.5)));
            incise(q, pts, 0.45, 0.6);
        }
        for (let k = 0; k < 4; k++) incise(q, [F(16 + k * 7, -5.6), F(20 + k * 7, 0), F(16 + k * 7, 5.6)], 0.5, 0.7);
        for (const [u, v, r] of [[74, 0, 2.2], [575.5, 0, 1.5], [62, 4.6, 1.1], [62, -4.6, 1.1]]) bead(q, F(u, v), r, u === 74 ? [S.mix('#c9d3f3', '#8f8db0', 0.5), COL.nacre, '#fffdf4'] : GOLDB, 0.45);
    }
    function guard(g, G, a, front) {
        const F = frameOf(a), rnd = Motion.rng(`guard/${G.seed}/${front}`), tone = toner(rnd), base = tone('#ead8ae', 0.08);
        pierced(g, blade(F, PROF_G), [F.pts(tear(44, 68, 3.3))], {
            fill: { from: F(-36, 0), to: F(584, 0), stops: [[0, S.mix(base, '#8a6238', 0.5)], [0.12, S.mix(base, '#b89058', 0.25)], [0.3, base], [1, S.mix(base, '#fff6dc', 0.4)]] },
            line: 2, holeLine: 1, thick: 2, edge: '#5a3d26',
            cast: { blur: front ? 9 : 6, dx: 3.4, dy: front ? 6 : 4.4, color: 'rgba(22,12,36,0.66)' },
            shade: { color: COL.stickShade, alpha: 0.8, w: 7 }, light: { color: '#fffbe8', alpha: 0.7, w: 2.8 },
            detail: (q) => guardDetail(q, F, rnd, tone),
        });
    }

    // ------------------------------------------------------------------ band space
    // The leaf's painting is laid out flat, in «band space»: X along the arc (in units at
    // the leaf's middle radius, from the smaller angle), Y from the inner edge outwards.
    // P bends it onto the fan. With an anchor X0, a thing keeps its true size and stands
    // upright on the radius through X0 (a tower does not fan out towards its top).
    function band(g, amin) {
        // nothing a hand rules is quite straight: every point strays by a hair, the same
        // hair for every shape that shares it, so neighbours still meet
        const P = (X0_, Y0_, X0) => {
            const X = X0_ + S.noise2(X0_ * 0.37, Y0_ * 0.37, 11) * 0.26, Y = Y0_ + S.noise2(X0_ * 0.37 + 40.5, Y0_ * 0.37 - 17.3, 12) * 0.26;
            const rho = R0 + Y, a = X0 === undefined ? amin + X / RM : amin + X0 / RM + (X - X0) / rho;
            return [Math.cos(a) * rho, Math.sin(a) * rho];
        };
        const map = (pts, X0, closed = true, step = 5) => {
            const out = [], n = pts.length, m = closed ? n : n - 1;
            for (let i = 0; i < m; i++) {
                const a = pts[i], b = pts[(i + 1) % n], k = Math.max(1, Math.ceil(Math.abs(b[0] - a[0]) / step));
                for (let j = 0; j < k; j++) out.push(P(a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k, X0));
            }
            if (!closed) out.push(P(pts[n - 1][0], pts[n - 1][1], X0));
            return out;
        };
        const stopsOn = (gr, stops) => {
            for (const [t, c] of stops) gr.addColorStop(t, c);
            return gr;
        };
        const B = { P, map, g };
        B.fill = (pts, style, X0) => fillP(g, map(pts, X0), style);
        B.line = (pts, w, style, X0) => strokeP(g, map(pts, X0, false), w, style);
        B.ring = (pts, w, style, X0) => strokeP(g, map(pts, X0), w, style, true);
        B.dot = (X, Y, r, style, X0) => disc(g, P(X, Y, X0), r, style);
        B.box = (x0, y0, x1, y1, style, X0) => B.fill([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], style, X0);
        // a gradient up the picture (it is a ring about the pivot), across it, or round a point
        B.vgrad = (Ya, Yb, stops) => stopsOn(g.createRadialGradient(0, 0, Math.max(0, R0 + Ya), 0, 0, Math.max(0.1, R0 + Yb)), stops);
        B.hgrad = (Xa, Xb, Y, stops, X0) => {
            const p = P(Xa, Y, X0), q = P(Xb, Y, X0);
            return stopsOn(g.createLinearGradient(p[0], p[1], q[0], q[1]), stops);
        };
        B.glow = (X, Y, rad, stops, X0) => {
            const p = P(X, Y, X0);
            return stopsOn(g.createRadialGradient(p[0], p[1], 0, p[0], p[1], rad), stops);
        };
        B.clip = (pts, X0, fn) => {
            g.save();
            g.beginPath();
            S.trace(g, map(pts, X0));
            g.clip();
            fn();
            g.restore();
        };
        return B;
    }

    // ------------------------------------------------------------------ the miniature painter
    // A souvenir painter's small tools, in band space: opaque paint, a lit and a shaded
    // face on every block, a thin dark line where forms meet. `sun` is +1 when the light of
    // the picture comes from its right, −1 from its left (on each of the emblem's fans that
    // is where the page's own light, the top left, falls from).
    function mini(g, B, rnd, sun) {
        const tone = toner(rnd), R = (a, b) => a + (b - a) * rnd(), ln = (a) => S.rgba('#2b1b38', a);
        const M = { tone, R, sun, ln };
        // an upright block of masonry: its front lit across, a side face in shade, a
        // grounded foot, the stains of weather
        M.block = (x0, x1, y0, y1, C, o = {}) => {
            const X0 = o.X0 ?? (x0 + x1) / 2, sd = o.side ?? Math.min(5, (x1 - x0) * 0.28), drop = sd * 0.3;
            const xe = sun > 0 ? x0 : x1, xs = xe - sun * sd, xl = sun > 0 ? x1 : x0;
            if (sd > 0) {
                B.fill([[xs, y0], [xe, y0], [xe, y1], [xs, y1 - drop]], B.vgrad(y0, y1, [[0, C.deep], [1, C.shade]]), X0);
                B.line([[xs, y0], [xs, y1 - drop], [xe, y1]], 0.5, ln(0.7), X0);
            }
            const front = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
            B.fill(front, B.hgrad(xe, xl, (y0 + y1) / 2, [[0, C.base], [0.7, C.lit], [1, C.glint ?? C.lit]], X0), X0);
            B.fill(front, B.vgrad(y0, y0 + (y1 - y0) * 0.6, [[0, S.rgba(C.deep, o.foot ?? 0.5)], [1, S.rgba(C.deep, 0)]]), X0);
            for (let k = 0; k < (o.streaks ?? 3); k++) {
                const x = R(x0 + 0.5, x1 - 0.5), ya = R(y0 + (y1 - y0) * 0.35, y1);
                B.line([[x, ya], [x + R(-0.3, 0.3), Math.max(y0, ya - R(2.5, (y1 - y0) * 0.6))]], R(0.4, 1), rnd() < 0.6 ? S.rgba(C.deep, R(0.12, 0.28)) : S.rgba(C.glint ?? C.lit, R(0.15, 0.4)), X0);
            }
            B.line([[xl, y0], [xl, y1]], 0.45, S.rgba(C.glint ?? C.lit, 0.9), X0);
            B.line([[x0, y0], [x0, y1], [x1, y1], [x1, y0]], 0.5, ln(o.ink ?? 0.62), X0);
            return X0;
        };
        // battlements along the top of a wall, and the shadow under the wall-walk
        M.merlons = (x0, x1, y, C, o = {}) => {
            const X0 = o.X0 ?? (x0 + x1) / 2, n = Math.max(2, Math.round((x1 - x0) / (o.pitch ?? 3))), w = (x1 - x0) / n, h = o.h ?? 2.3;
            for (let k = 0; k < n; k++) {
                if (o.gap === k) continue; // one fallen
                const a = x0 + k * w + w * 0.14, b = a + w * 0.72, hh = h * R(0.9, 1.1);
                B.fill(o.cap ? [[a, y], [b, y], [b, y + hh * 0.7], [(a + b) / 2, y + hh * 1.15], [a, y + hh * 0.7]] : [[a, y], [b, y], [b, y + hh], [a, y + hh]], k % 2 ? C.lit : S.mix(C.lit, C.base, 0.55), X0);
                B.line([[sun > 0 ? a : b, y], [sun > 0 ? a : b, y + hh * 0.8]], 0.42, S.rgba(C.deep, 0.85), X0);
            }
            B.line([[x0, y - 0.75], [x1, y - 0.75]], 0.55, S.rgba(C.deep, 0.8), X0);
            B.line([[x0, y + 0.05], [x1, y + 0.05]], 0.38, S.rgba(C.glint ?? C.lit, 0.85), X0);
        };
        // a window: arched or square, dark or lit, with its sill
        M.win = (x, y, w, h, X0, o = {}) => {
            const shape = o.square ? [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x - w / 2, y + h]] : [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h * 0.6], [x + w * 0.3, y + h * 0.9], [x, y + h], [x - w * 0.3, y + h * 0.9], [x - w / 2, y + h * 0.6]];
            if (o.lit) B.dot(x, y + h / 2, h * 1.5, 'rgba(255,206,110,0.2)', X0);
            B.fill(shape, o.lit ? '#ffd774' : o.col ?? '#2e1a36', X0);
            if (o.lit) B.line([[x, y], [x, y + h]], 0.28, 'rgba(120,60,20,0.85)', X0);
            if (o.sill !== false) B.line([[x - w / 2 - 0.4, y - 0.3], [x + w / 2 + 0.4, y - 0.3]], 0.4, o.sillCol ?? 'rgba(255,242,220,0.8)', X0);
        };
        // rows of putlog holes: where the scaffold beams sat when the wall was rammed
        M.putlogs = (x0, x1, y0, y1, C, X0) => {
            for (let y = y0 + 3.4; y < y1 - 2; y += 4.6) for (let x = x0 + 1.4; x < x1 - 0.8; x += 2.9) B.dot(x + R(-0.2, 0.2), y, 0.3, S.rgba(C.deep, 0.75), X0);
        };
        // a tiled roof seen from the front: a slope, the lines of its tiles, the ridge's light
        M.roof = (x0, x1, y, h, X0, T, o = {}) => {
            const ov = o.ov ?? 0.9, sk = o.skew ?? h * 0.8;
            B.fill([[x0 - ov, y], [x1 + ov, y], [x1 - sk, y + h], [x0 + sk, y + h]], B.hgrad(sun > 0 ? x0 : x1, sun > 0 ? x1 : x0, y, [[0, T.shade], [1, T.lit]], X0), X0);
            for (let x = x0 - ov + 0.8; x < x1 + ov; x += o.tile ?? 1.45) B.line([[x, y + 0.15], [lerp(x0 + sk, x1 - sk, (x - x0 + ov) / (x1 - x0 + 2 * ov)), y + h - 0.15]], 0.3, S.rgba(T.deep, 0.62), X0);
            B.line([[x0 + sk, y + h], [x1 - sk, y + h]], 0.5, S.rgba(T.glint, 0.9), X0);
            B.line([[x0 - ov, y], [x0 + sk, y + h]], 0.4, ln(0.5), X0);
            B.line([[x1 + ov, y], [x1 - sk, y + h]], 0.4, ln(0.5), X0);
            B.line([[x0 - ov, y - 0.45], [x1 + ov, y - 0.45]], 0.6, ln(0.62), X0); // the eaves' shadow
        };
        // a house: a cube with its shaded side, a tiled roof or a terrace, windows, a door
        M.house = (x, y, w, h, C, T, o = {}) => {
            const X0 = x + w / 2, sd = o.side ?? Math.min(4.5, w * R(0.16, 0.3)), flat = o.flat ?? rnd() < 0.3, rh = flat ? 0 : R(2.6, 4) * (o.roofK ?? 1);
            M.block(x, x + w, y, y + h, C, { X0, side: sd, streaks: 2, foot: 0.4 });
            if (flat) {
                B.line([[x - 0.3, y + h + 0.45], [x + w + 0.3, y + h + 0.45]], 1, C.glint ?? C.lit, X0);
                B.line([[x - 0.3, y + h - 0.25], [x + w + 0.3, y + h - 0.25]], 0.4, ln(0.5), X0);
            } else {
                const xe = sun > 0 ? x : x + w;
                B.fill([[xe - sun * sd, y + h - sd * 0.3], [xe, y + h], [xe + sun * rh * 0.5, y + h + rh]], S.mix(T.shade, T.deep, 0.5), X0);
                M.roof(x, x + w, y + h, rh, X0, T, { skew: rh * R(0.5, 1) });
            }
            const cols = Math.max(1, Math.round(w / R(4.2, 6))), rows = Math.max(1, Math.round((h - 3) / R(5.4, 7)));
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (rnd() < 0.15) continue;
                    const wx = x + ((c + 0.5) / cols) * w + R(-0.3, 0.3), wy = y + 3.6 + (r / rows) * (h - 3.6) + R(-0.2, 0.2), lit = rnd() < (o.litP ?? 0), ww = R(1.3, 1.8), wh = Math.min(h - 4.4, R(2.1, 2.9));
                    if (wh < 1.2) continue;
                    M.win(wx, wy, ww, wh, X0, { square: rnd() < 0.7, lit, col: o.winCol });
                    if (o.balcony && rnd() < 0.45) {
                        B.line([[wx - 1.6, wy - 0.4], [wx + 1.6, wy - 0.4]], 0.5, ln(0.85), X0);
                        if (rnd() < 0.5) B.dot(wx + R(-1, 1), wy + 0.2, 0.45, '#d8443c', X0); // a pot of geraniums
                    }
                    if (o.shutters && !lit) B.line([[wx + ww / 2 + 0.3, wy + 0.1], [wx + ww / 2 + 0.3, wy + wh - 0.1]], 0.5, o.shutters, X0);
                }
            }
            if (rnd() < 0.7 && h > 7) M.win(x + R(0.25, 0.75) * w, y, R(1.8, 2.3), R(2.8, 3.5), X0, { col: o.door ?? '#4a2c2a', sill: false });
            let chimney = null;
            if (!flat && rnd() < 0.4) {
                const cx = x + R(0.2, 0.8) * w;
                B.box(cx - 0.7, y + h + rh * 0.5, cx + 0.7, y + h + rh + 1.7, C.base, X0);
                B.line([[cx - 1, y + h + rh + 1.7], [cx + 1, y + h + rh + 1.7]], 0.5, T.shade, X0);
                chimney = [cx, y + h + rh + 2.1];
            }
            return { X0, top: y + h + rh, flat, chimney, x, w };
        };
        // a broadleaf tree: a clump with its lit side and a stipple of leaves
        M.tree = (x, y, r, C, X0 = x, o = {}) => {
            const pts = [];
            for (let k = 0; k < 9; k++) pts.push([x + Math.cos((k / 9) * TAU) * r * R(0.8, 1.15) * (o.wide ?? 1), y + r * 0.9 + Math.sin((k / 9) * TAU) * r * R(0.78, 1.05) * (o.tall ?? 1)]);
            const cl = S.curve(pts, true, 3);
            B.line([[x, y - r * 0.25], [x, y + r * 0.4]], Math.max(0.4, r * 0.15), C.deep, X0);
            B.fill(cl, C.shade, X0);
            B.clip(cl, X0, () => {
                B.fill(cl.map(([px, py]) => [px + sun * r * 0.36, py + r * 0.3]), C.base, X0);
                B.fill(cl.map(([px, py]) => [px + sun * r * 0.8, py + r * 0.66]), C.lit, X0);
            });
            for (let k = 0; k < 5; k++) B.dot(x + sun * R(-0.3, 0.8) * r, y + r * R(0.6, 1.6), R(0.28, 0.55), k % 2 ? C.lit : C.glint ?? C.lit, X0);
            for (let k = 0; k < 3; k++) B.dot(x - sun * R(0.1, 0.8) * r, y + r * R(0.3, 1.1), R(0.28, 0.55), C.deep, X0);
        };
        // a cypress: a dark spindle with its lit side
        M.cypress = (x, y, h, C, X0 = x, w = h * 0.25) => {
            const sp = S.curve([[x, y], [x + w * 0.5, y + h * 0.22], [x + w * 0.4, y + h * 0.66], [x + R(-0.2, 0.2), y + h], [x - w * 0.4, y + h * 0.66], [x - w * 0.5, y + h * 0.22]], true, 3);
            B.fill(sp, C.shade, X0);
            B.clip(sp, X0, () => B.fill(sp.map(([px, py]) => [px + sun * w * 0.44, py + h * 0.04]), C.base, X0));
            B.line([[x + sun * w * 0.24, y + h * 0.16], [x + sun * w * 0.12, y + h * 0.84]], 0.35, S.rgba(C.lit, 0.9), X0);
            B.line([[x - sun * w * 0.3, y + h * 0.2], [x - sun * w * 0.14, y + h * 0.82]], 0.35, S.rgba(C.deep, 0.9), X0);
        };
        // a palm: a ringed trunk, fronds that arch and droop, a bunch of dates
        M.palm = (x, y, h, X0 = x) => {
            const lean = R(-1.4, 1.4), tx = x + lean, ty = y + h;
            B.fill([[x - 0.65, y], [x + 0.65, y], [tx + 0.42, ty], [tx - 0.42, ty]], '#7a5a4a', X0);
            B.line([[x - sun * 0.4, y], [tx - sun * 0.28, ty]], 0.3, 'rgba(56,34,40,0.8)', X0);
            B.line([[x + sun * 0.4, y], [tx + sun * 0.28, ty]], 0.3, 'rgba(226,190,150,0.8)', X0);
            for (let k = 1; k < h / 1.6; k++) B.line([[lerp(x, tx, (k * 1.6) / h) - 0.5, y + k * 1.6], [lerp(x, tx, (k * 1.6) / h) + 0.5, y + k * 1.6 + 0.3]], 0.25, 'rgba(56,34,40,0.6)', X0);
            for (let k = 0; k < 11; k++) {
                const th = -0.55 + (k * (Math.PI + 1.1)) / 10, len = R(5, 7.4) * (o_palm(h));
                const pts = S.curve([[tx, ty], [tx + Math.cos(th) * len * 0.55, ty + Math.sin(th) * len * 0.6 + 1.3], [tx + Math.cos(th) * len, ty + Math.sin(th) * len - len * 0.34 * (1 - Math.abs(Math.sin(th)))]], false, 4);
                B.line(pts, 0.75, '#1f4a3a', X0);
                B.line(pts, 0.4, k % 3 === (sun > 0 ? 0 : 2) || Math.cos(th) * sun > 0.2 ? '#7fae62' : '#3f7a50', X0);
            }
            B.dot(tx + 0.7, ty - 0.9, 0.6, '#d98a3a', X0);
            B.dot(tx - 0.5, ty - 1.1, 0.5, '#b86a2a', X0);
        };
        const o_palm = (h) => 0.75 + Math.min(0.45, h / 40);
        // a person, small: a skirt or a coat, a head, perhaps a hat
        M.fig = (x, y, h, col, X0 = x, o = {}) => {
            B.fill([[x - h * 0.2, y], [x + h * 0.2, y], [x + h * 0.11, y + h * 0.72], [x - h * 0.11, y + h * 0.72]], col, X0);
            B.dot(x, y + h * 0.86, h * 0.15, o.head ?? '#e9c9a8', X0);
            if (o.hat) B.line([[x - h * 0.22, y + h * 0.97], [x + h * 0.22, y + h * 0.97]], h * 0.1, o.hat, X0);
            B.line([[x - h * 0.2, y - 0.1], [x + h * 0.5 * -sun, y - 0.25]], 0.35, 'rgba(40,30,60,0.45)', X0); // its shadow
        };
        // a bird on the wing, far off
        M.bird = (x, y, s, col) => B.line([[x - s, y + s * 0.3], [x - s * 0.42, y + s * 0.52], [x, y], [x + s * 0.42, y + s * 0.52], [x + s, y + s * 0.26]], 0.42, col ?? ln(0.85), x);
        // the reflection of an upright thing in water: its colours, broken into dabs
        M.reflect = (X0, yw, depth, prof) => {
            for (let d = 0.8; d < depth; d += R(1, 1.9)) {
                const [hw, col] = prof(d), k = Math.pow(1 - d / depth, 0.6);
                if (!hw || rnd() < 0.16) continue;
                const j = R(-1.6, 1.6) * (0.4 + d / depth), wv = hw * R(0.55, 1.12);
                B.line([[X0 - wv + j, yw - d * 0.92], [X0 + wv + j, yw - d * 0.92]], R(0.55, 1.15), S.rgba(col, 0.75 * k + 0.1), X0);
            }
        };
        return M;
    }

    // The last pass over a miniature: the marks of a small brush, a little lighter or
    // darker than what they lie on, level across the picture (it was painted flat on a
    // table), closer together in the sky and on the water.
    function brushwork(g, B, W, seed) {
        const r = Motion.rng('brush/' + seed);
        for (let k = 0; k < 2600; k++) {
            const X = r() * W, Y = 26 + Math.pow(r(), 0.8) * 246, len = 1 + r() * r() * 11, lean = (r() - 0.5) * 0.9, lt = r() < 0.5;
            strokeP(g, [B.P(X, Y), B.P(X + len * 0.5, Y + lean * 0.6), B.P(X + len, Y + lean)], 0.5 + r() * 1.3, lt ? `rgba(255,250,236,${(0.02 + r() * 0.055).toFixed(3)})` : `rgba(22,18,56,${(0.02 + r() * 0.05).toFixed(3)})`);
        }
    }

    // the painter signed it, small, in a corner: a flourish nobody can read, and a stroke under it
    function signature(B, X, Y, col, seed) {
        const r = Motion.rng('sign/' + seed), pts = [];
        for (let i = 0; i <= 22; i++) pts.push([X + i * 0.95 + Math.sin(i * 1.7) * 0.5, Y + Math.sin(i * 2.3 + 1) * (i % 5 === 0 ? 2.2 : 1) * (0.6 + r() * 0.6) + (i === 0 ? 2 : 0)]);
        B.line(S.curve(pts, false, 4), 0.34, col, X + 10);
        B.line(S.curve([[X - 1, Y - 2.4], [X + 9, Y - 2.8], [X + 20, Y - 2.2], [X + 23.5, Y - 0.8]], false, 5), 0.3, col, X + 10);
        B.dot(X + 25.5, Y - 2.2, 0.32, col, X + 10);
    }

    // ------------------------------------------------------------------ Granada at dusk
    function granada(g, B, W) {
        const rnd = Motion.rng('fan-granada'), M = mini(g, B, rnd, 1), { R, ln, tone } = M;
        const WALL = { lit: '#f4a965', base: '#d67d50', shade: '#9c4d44', deep: '#5c2c40', glint: '#ffd49c' };
        const STONE = { lit: '#eec79c', base: '#c99c7e', shade: '#8c6a74', deep: '#52384e', glint: '#ffe8c4' };
        const WHITE = { lit: '#f9e8d8', base: '#e4c8c4', shade: '#9a94c0', deep: '#55508a', glint: '#fff7ea' };
        const TILE = { lit: '#dc7a4e', shade: '#a24a3c', deep: '#582236', glint: '#f6ae7e' };
        const GREEN = { lit: '#41624a', base: '#1c4038', shade: '#0e262c', deep: '#081a24', glint: '#a09456' };
        const CYP = { lit: '#4c8058', base: '#1c4638', shade: '#0d2628', deep: '#06141c' };
        const POPLAR = { lit: '#7e8c50', base: '#426840', shade: '#1c4038', deep: '#0e2a2a', glint: '#d4b86c' };
        const SUNX = 612, SUNY = 150;

        // ---- the sky: gold where the sun went down (to the right, the west), rose, then the night's blue
        B.box(-10, 90, W + 10, 320, B.vgrad(150, 277, [[0, '#f9d686'], [0.13, '#f5b26f'], [0.29, '#e6867a'], [0.45, '#b46e9a'], [0.63, '#62589c'], [0.82, '#313c80'], [1, '#1b2456']]));
        B.box(-10, 90, W + 10, 320, B.glow(SUNX, SUNY, 350, [[0, 'rgba(255,230,146,0.92)'], [0.35, 'rgba(255,192,112,0.45)'], [1, 'rgba(255,170,110,0)']]));
        B.box(-10, 90, W + 10, 320, B.glow(10, 290, 340, [[0, 'rgba(14,18,62,0.62)'], [1, 'rgba(14,18,62,0)']]));
        const nearSun = (X, Y) => S.clamp(1 - Math.hypot(X - SUNX, Y - SUNY) / 370, 0, 1);
        // the first stars, more of them towards the east, and Venus over the afterglow
        for (let k = 0; k < 46; k++) {
            const X = R(0, W), Y = R(206, 271), ns = nearSun(X, Y);
            if (ns > 0.5 || rnd() < (Y < 228 ? 0.6 : 0)) continue;
            const r0 = R(0.3, 0.7) * (Y > 242 ? 1.25 : 0.9), p = B.P(X, Y);
            disc(g, p, r0, `rgba(255,246,216,${(R(0.55, 1) * (1 - ns)).toFixed(2)})`);
            if (rnd() < 0.2) {
                strokeP(g, [[p[0] - r0 * 3.4, p[1]], [p[0] + r0 * 3.4, p[1]]], 0.26, 'rgba(255,246,216,0.7)');
                strokeP(g, [[p[0], p[1] - r0 * 3.4], [p[0], p[1] + r0 * 3.4]], 0.26, 'rgba(255,246,216,0.7)');
            }
        }
        {
            const p = B.P(548, 252);
            disc(g, p, 4.2, 'rgba(255,250,224,0.18)');
            for (const [dx, dy] of [[5.5, 0], [0, 5.5], [2.2, 2.2], [2.2, -2.2]]) strokeP(g, [[p[0] - dx, p[1] - dy], [p[0] + dx, p[1] + dy]], 0.32, 'rgba(255,250,224,0.85)');
            disc(g, p, 1.25, '#fffbe6');
        }
        // thin clouds, lit from below by the sun that has set
        const strat = (X, Y, len, th, sd) => {
            const r = Motion.rng('strat' + sd), top = [], bot = [], ns = nearSun(X, Y);
            for (let k = 0; k <= 12; k++) {
                const u = k / 12, e = Math.pow(Math.sin(Math.PI * u), 0.6);
                top.push([X + (u - 0.5) * len, Y + th * e * (0.45 + 0.55 * r())]);
                bot.push([X + (u - 0.5) * len, Y - th * 0.4 * e * r()]);
            }
            const body = S.mix(S.mix('#474a8e', '#84588e', ns), '#c0708a', ns * 0.5);
            B.fill([...top, ...bot.slice().reverse()], body);
            B.line(top, 0.5, S.rgba(S.mix(body, '#1c2050', 0.5), 0.8));
            for (let k = 0; k < 3; k++) {
                const u0 = r() * 0.5, u1 = u0 + 0.2 + r() * 0.3, yy = Y + th * (0.1 + r() * 0.4);
                B.line([[X + (u0 - 0.5) * len, yy], [X + (u1 - 0.5) * len, yy + (r() - 0.5)]], 0.45 + r() * 0.5, S.rgba(S.mix('#e08a90', '#ffc890', ns), 0.6));
            }
            B.line(bot, 0.95, S.mix('#ff9a7c', '#ffe09a', ns));
            B.line(bot.map(([x, y]) => [x, y - 0.5]), 0.35, S.rgba('#fff0c0', 0.5 + ns * 0.4));
        };
        for (const [X, Y, len, th] of [[58, 199, 86, 4.2], [156, 215, 124, 5], [246, 197, 78, 3.4], [336, 210, 138, 5.2], [468, 190, 112, 4.6], [542, 217, 98, 4], [606, 197, 74, 3.2], [28, 229, 62, 3], [410, 233, 92, 3.2], [210, 240, 70, 2.6], [596, 176, 90, 3]]) strat(X, Y, len, th, X);
        // swifts, out for the last insects
        for (const [X, Y, s] of [[96, 250, 1.9], [112, 243, 1.4], [44, 246, 1.5], [150, 206, 1.2], [166, 212, 1.5], [206, 216, 1.3], [222, 208, 1.1], [252, 204, 1.4], [20, 222, 1.2], [590, 228, 1.5], [612, 246, 1.2], [520, 262, 1.3]]) M.bird(X, Y, s, 'rgba(22,18,52,0.9)');

        // ---- the Sierra Nevada: snow in the last sun where it faces west, blue where it does not
        const RIDGE = [[-8, 190], [16, 196], [38, 207], [56, 219], [69, 227], [80, 220], [93, 213], [105, 220], [118, 233], [127, 240], [134, 234], [146, 222], [160, 214], [176, 218], [190, 225], [202, 216], [220, 205], [240, 209], [256, 200], [278, 193], [300, 187], [330, 182], [365, 177], [400, 172], [440, 168], [490, 164], [540, 161], [600, 158], [664, 156]];
        const ridge = S.curve(RIDGE, false, 3);
        B.fill([...ridge, [664, 140], [-8, 140]], B.vgrad(150, 242, [[0, '#e3a686'], [0.2, '#a886aa'], [0.48, '#8a86c4'], [1, '#b9aedc']]));
        for (let i = 0; i < RIDGE.length - 1; i++) {
            const [xa, ya] = RIDGE[i], [xb, yb] = RIDGE[i + 1], west = yb < ya, snow = Math.max(0, (Math.max(ya, yb) - 183) * 0.7);
            if (snow < 2) continue;
            // the flank under this stretch of the crest: a wash that thins out downhill,
            // then its ribs and gullies one by one
            const lean = west ? 5 : -7, col = west ? S.mix('#ffd4be', '#f2a39c', rnd() * 0.6) : S.mix('#7e84c2', '#5a5fa2', rnd() * 0.6);
            const low = Math.min(ya, yb) - snow * 1.15;
            B.fill([[xa, ya], [xb, yb], [xb + lean + R(-2, 2), yb - snow * R(0.8, 1.15)], [(xa + xb) / 2 + lean + R(-2, 2), (ya + yb) / 2 - snow * R(0.55, 0.85)], [xa + lean + R(-2, 2), ya - snow * R(0.85, 1.2)]], B.vgrad(low, Math.max(ya, yb), [[0, S.rgba(col, 0.1)], [0.45, S.rgba(col, 0.8)], [1, col]]));
            const n = Math.max(3, Math.round((xb - xa) / 2.2));
            for (let k = 0; k < n; k++) {
                const u = (k + rnd()) / n, x = lerp(xa, xb, u), y = lerp(ya, yb, u) - 0.2, len = snow * R(0.45, 1.05), w = R(0.5, 1.3);
                const c = west ? (k % 2 ? 'rgba(255,244,232,0.9)' : 'rgba(214,120,132,0.62)') : k % 2 ? 'rgba(170,178,230,0.8)' : 'rgba(54,56,126,0.62)';
                B.fill([[x - w, y], [x + w, y], [x + lean * R(0.5, 1) + w * 0.2, y - len], [x + lean * R(0.3, 0.6), y - len * 0.6]], c);
            }
        }
        // spurs come forward from the peaks: a face to the sunset, a face away from it
        for (let i = 1; i < RIDGE.length - 1; i++) {
            const [x, y] = RIDGE[i];
            if (y < 203 || y < RIDGE[i - 1][1] || y < RIDGE[i + 1][1]) continue;
            const h = (y - 186) * 0.62, foot = [x + R(-1, 3), y - h];
            B.fill([[x, y], [x - h * 0.42, y - h * 0.86], foot], B.vgrad(y - h, y, [[0, 'rgba(90,94,160,0.2)'], [1, '#666cae']]));
            B.fill([[x, y], foot, [x + h * 0.56, y - h * 0.78]], B.vgrad(y - h, y, [[0, 'rgba(244,170,160,0.25)'], [1, '#ffdcc8']]));
            B.line([[x, y], foot], 0.4, 'rgba(60,54,120,0.7)');
            for (let k = 0; k < 4; k++) B.line([[x + R(0.5, 3), y - R(1, 4)], [x + R(2, h * 0.5), y - R(4, h * 0.8)]], R(0.3, 0.6), 'rgba(255,246,236,0.75)');
        }
        B.line(ridge, 0.5, 'rgba(255,238,226,0.75)');
        // bare rock under the snow line, and the haze at the mountain's foot
        for (let k = 0; k < 70; k++) {
            const X = R(0, 420), top = yAt(RIDGE, X), Y = R(170, Math.max(172, top - 8));
            B.line([[X, Y], [X + R(2, 7), Y - R(0.4, 2.4)]], R(0.4, 0.9), rnd() < 0.5 ? 'rgba(76,70,130,0.5)' : 'rgba(226,170,170,0.45)');
        }
        B.box(-10, 140, W + 10, 190, B.vgrad(150, 188, [[0, 'rgba(244,184,124,0.75)'], [1, 'rgba(244,184,124,0)']]));
        // the lower hills before it
        const FOOT = [[-8, 178], [28, 181], [70, 175], [118, 181], [168, 174], [228, 178], [290, 171], [350, 168], [420, 164], [500, 160], [580, 157], [664, 155]];
        B.fill([...S.curve(FOOT, false, 3), [664, 140], [-8, 140]], B.vgrad(148, 182, [[0, '#d99878'], [0.5, '#9a6e8c'], [1, '#77608e']]));
        for (let k = 0; k < 60; k++) {
            const X = R(0, W), Y = R(152, yAt(FOOT, X) - 1.5);
            B.line([[X, Y], [X + R(3, 9), Y + R(-0.8, 0.8)]], R(0.4, 0.9), rnd() < 0.5 ? 'rgba(70,50,96,0.4)' : 'rgba(246,190,150,0.4)');
        }

        // ---- the vega and the lower town to the west, under the afterglow
        B.box(228, 96, W + 10, 158, B.vgrad(104, 158, [[0, '#6e5074'], [0.45, '#b0746e'], [1, '#eeb47c']]));
        {
            // the far rim of the plain: low sierras against the gold
            const far = S.curve([[228, 154], [300, 156.5], [352, 154.5], [410, 158.5], [452, 156], [500, 160], [540, 157], [584, 161.5], [622, 158], [664, 160]], false, 4);
            B.fill([...far, [664, 150], [228, 150]], B.vgrad(150, 161, [[0, '#d79a76'], [1, '#9c7a9a']]));
            B.line(far, 0.4, 'rgba(255,226,170,0.6)');
        }
        for (let Y = 151; Y > 124; Y -= R(2.4, 4.2)) {
            for (let X = 250 + R(0, 20); X < W; X += R(18, 60)) {
                const len = R(10, 44);
                B.line([[X, Y], [X + len, Y + R(-0.4, 0.4)]], R(0.5, 1.2), rnd() < 0.5 ? 'rgba(92,70,98,0.5)' : 'rgba(250,206,140,0.5)');
                if (rnd() < 0.5) for (let x = X; x < X + len; x += R(1.6, 3)) B.dot(x, Y + 0.9, R(0.4, 0.75), 'rgba(52,60,58,0.7)'); // a line of poplars
            }
        }
        for (let k = 0; k < 150; k++) {
            const X = R(258, W), Y = R(104, 143), s = lerp(1.5, 0.7, (Y - 104) / 40);
            B.box(X, Y, X + R(1.6, 3.4) * s, Y + R(1.2, 2.2) * s, S.mix('#f5dcc8', '#b99ab0', rnd() * 0.7));
            if (rnd() < 0.7) B.line([[X - 0.2, Y + 2.2 * s], [X + 3 * s, Y + 2.2 * s]], 0.5 * s, S.rgba(TILE.shade, 0.9));
        }
        {
            // the cathedral down in the town: the great block of its naves, the round
            // chancel under its dome, the one tower that was finished, buttresses
            const X0 = 588, y0 = 118;
            for (let k = 0; k < 16; k++) {
                const x = R(548, 632), y = R(112, 122), w = R(5, 9), h = R(4, 8);
                M.block(x, x + w, y, y + h, { ...WHITE, lit: '#f0d8c4', base: '#d8bcb0' }, { side: 1.2, streaks: 1, foot: 0.3 });
                M.roof(x, x + w, y + h, 1.8, x + w / 2, TILE);
            }
            M.block(570, 602, y0, y0 + 17, STONE, { X0, side: 4, streaks: 5 });
            for (let k = 0; k < 6; k++) {
                const x = 573 + k * 5.2;
                M.win(x, y0 + 5, 1.4, 6.4, X0, { col: '#4a3250', sill: false });
                B.line([[x + 2.6, y0], [x + 2.6, y0 + 17]], 0.5, S.rgba(STONE.glint, 0.8), X0);
                B.fill([[x + 2.1, y0 + 17], [x + 3.1, y0 + 17], [x + 2.6, y0 + 20]], STONE.lit, X0);
            }
            B.box(569.4, y0 + 16.2, 602.6, y0 + 17.6, STONE.glint, X0);
            M.roof(572, 600, y0 + 17.6, 3, X0, TILE, { skew: 3.4 });
            M.block(599, 611, y0, y0 + 22, STONE, { X0, side: 0, streaks: 2 });
            const dm = S.ellipse(605, y0 + 22, 6.2, 7.4, 16).filter((p) => p[1] >= y0 + 21.9);
            B.fill(dm, B.hgrad(599, 611, y0 + 25, [[0, STONE.shade], [0.6, STONE.lit], [1, STONE.glint]], X0), X0);
            B.line(dm, 0.4, ln(0.6), X0);
            for (const dx of [-3.4, 0, 3.4]) M.win(605 + dx, y0 + 12, 1.2, 5, X0, { col: '#4a3250', sill: false });
            B.box(604.2, y0 + 29.2, 605.8, y0 + 31.6, STONE.lit, X0);
            B.line([[605, y0 + 31.6], [605, y0 + 34]], 0.3, ln(0.9), X0);
            const Xt = M.block(561, 570, y0, y0 + 30, STONE, { side: 2.4, streaks: 3 });
            for (const y of [y0 + 9.6, y0 + 19.2]) {
                B.line([[561, y], [570, y]], 0.5, S.rgba(STONE.glint, 0.9), Xt);
                B.line([[561, y - 0.6], [570, y - 0.6]], 0.35, S.rgba(STONE.deep, 0.7), Xt);
            }
            for (const [y, lit] of [[y0 + 3, false], [y0 + 12, false], [y0 + 22, true]]) for (const dx of [-1.9, 1.9]) M.win(565.5 + dx, y, 1.5, 4.4, Xt, { col: '#4a3250', lit });
            B.box(560.4, y0 + 29.4, 570.6, y0 + 30.8, STONE.glint, Xt);
            for (const x of [561.4, 565.5, 569.6]) B.fill([[x - 0.6, y0 + 30.8], [x + 0.6, y0 + 30.8], [x, y0 + 33.4]], STONE.lit, Xt);
        }

        // ---- the Sabika: a wooded hill, the Cerro del Sol rising behind it to the left
        const HILL = [[-8, 186], [0, 184], [16, 180], [34, 175], [50, 171], [62, 165], [74, 161.5], [150, 161], [250, 160], [258, 153], [269, 142], [282, 131], [298, 123], [320, 117], [358, 113], [664, 112]];
        B.fill([...HILL, [664, 100], [-8, 100]], B.vgrad(106, 186, [[0, '#0c1e2e'], [0.4, '#183a36'], [1, '#274e3e']]));
        B.fill([...HILL, [664, 100], [-8, 100]], B.glow(290, 150, 120, [[0, 'rgba(240,140,70,0.42)'], [1, 'rgba(240,140,70,0)']]));

        // the Generalife, white on the slope, among its cypresses
        {
            const d = -12, X0 = 42 + d;
            for (const [x, h] of [[21, 13], [27, 15], [33, 12.5], [39, 14], [46, 16], [57, 12], [63, 14]]) M.cypress(x + d, 177 + R(-1.5, 1), h, CYP, X0);
            M.block(26 + d, 52 + d, 172.5, 178, WHITE, { X0, side: 0, streaks: 2 });
            for (let k = 0; k < 9; k++) M.win(28.2 + d + k * 2.7, 173.1, 1.5, 3, X0, { sill: false, col: '#3a2850' });
            B.line([[26 + d, 176.9], [52 + d, 176.9]], 0.35, ln(0.45), X0);
            M.roof(26 + d, 52 + d, 178, 2.5, X0, TILE);
            M.block(21.5 + d, 27.5 + d, 173, 180.5, WHITE, { X0, side: 1.6 });
            M.win(24.5 + d, 176.6, 1.4, 2.4, X0, { lit: true });
            M.roof(21.5 + d, 27.5 + d, 180.5, 2.6, X0, TILE, { skew: 2.4 });
            M.block(50.5 + d, 58.5 + d, 172.5, 183.5, WHITE, { X0, side: 2 });
            for (const dx of [-2, 0, 2]) M.win(54.5 + d + dx, 179.4, 1.3, 2.8, X0, { col: '#3a2850' });
            M.win(54.5 + d, 174, 1.6, 3, X0, { col: '#3a2850', sill: false });
            B.fill([[49.4 + d, 183.5], [59.6 + d, 183.5], [54.5 + d, 188]], B.hgrad(49 + d, 60 + d, 185, [[0, TILE.shade], [1, TILE.lit]], X0), X0);
            B.line([[49.4 + d, 183.5], [54.5 + d, 188], [59.6 + d, 183.5]], 0.4, ln(0.6), X0);
            B.line([[54.5 + d, 188], [54.5 + d, 189.6]], 0.35, ln(0.8), X0);
            // the terraced gardens under it: white walls, clipped hedges, rows of the orchard
            for (const [ya, xa, xb] of [[170.3, 22, 62], [167.4, 27, 70], [164.2, 34, 76]]) {
                B.line([[xa + d, ya + 1.2], [xb + d, ya + 0.2]], 1.3, '#1d4a38', X0);
                B.line([[xa + d, ya], [xb + d, ya - 1]], 0.9, WHITE.base, X0);
                B.line([[xa + d, ya - 0.5], [xb + d, ya - 1.5]], 0.3, ln(0.5), X0);
                for (let x = xa + 2; x < xb - 1; x += R(2.2, 3.4)) B.dot(x + d, ya - 1.9, 0.6, rnd() < 0.3 ? '#e08a3c' : '#2f6a48', X0);
            }
            // the walk of cypresses down to the palaces
            for (let k = 0; k < 9; k++) M.cypress(60.5 + d + k * 2.9, 171.4 - k * 1.08, R(8, 11), CYP, 75 + d);
        }

        // ---- the Alhambra along the crest, from the Partal (left) to the Vela (right)
        const base = 160;
        {
            const PLASTER = { ...WHITE, lit: '#f6d4b0', base: '#e2b490' };
            // the palaces' roofs, seen over the wall
            for (const [xa, xb, y, h, rh] of [[88, 116, 163, 6, 3.4], [136, 150, 163, 7, 3.4]]) {
                M.block(xa, xb, y, y + h, PLASTER, { side: 0, streaks: 2 });
                M.roof(xa, xb, y + h, rh, (xa + xb) / 2, TILE);
            }
            // the curtain wall, in stretches of different plaster
            for (const [xa, xb] of [[63, 84], [84, 116], [116, 149], [149, 177]]) {
                M.block(xa, xb, base - 1, 165.6, WALL, { side: 0, streaks: 4, ink: 0.35 });
                M.merlons(xa, xb, 165.6, WALL, { pitch: 2.5, h: 1.7, gap: xa === 84 ? 5 : -1 });
            }
            // the Partal's towers and its portico
            let X0 = M.block(66, 75, base - 1, 173.5, WALL, { side: 2.2 });
            M.merlons(66, 75, 173.5, WALL, { X0, cap: true });
            M.putlogs(66, 75, base, 173, WALL, X0);
            M.win(70.5, 168, 1.3, 2.4, X0);
            X0 = M.block(92, 104, base, 167.5, PLASTER, { side: 0 });
            for (let k = 0; k < 5; k++) M.win(93.8 + k * 2.1, base + 1, 1.3, 3.6, X0, { sill: false, col: '#3a2040' });
            M.roof(92, 104, 167.5, 2.6, X0, TILE);
            X0 = M.block(81, 88, base - 1, 170.5, WALL, { side: 1.8 });
            M.merlons(81, 88, 170.5, WALL, { X0, h: 1.9 });
            // the Peinador de la Reina: a gallery open to the view under a tiled roof
            X0 = M.block(106.5, 114, base - 1, 175, WALL, { side: 2 });
            M.putlogs(106.5, 114, base, 175, WALL, X0);
            M.win(110.2, 169.5, 1.4, 2.6, X0);
            B.box(106.5, 175, 114, 175.8, WALL.lit, X0);
            B.box(107.2, 176, 113.4, 178.4, 'rgba(60,36,70,0.55)', X0);
            for (const x of [107, 108.9, 110.8, 112.7, 113.6]) B.line([[x, 175.8], [x, 178.6]], 0.42, STONE.glint, X0);
            B.fill([[105.6, 178.6], [114.9, 178.6], [112.6, 181.6], [108, 181.6]], B.hgrad(106, 115, 180, [[0, TILE.shade], [1, TILE.lit]], X0), X0);
            B.line([[105.6, 178.5], [114.9, 178.5]], 0.45, ln(0.7), X0);
            // the Torre de Comares, the largest
            X0 = M.block(116, 138, base - 2, 198, WALL, { side: 5, streaks: 7 });
            M.merlons(116, 138, 198, WALL, { X0, cap: true, pitch: 3.1, h: 2.7 });
            M.merlons(111, 116, 196.6, { ...WALL, lit: WALL.shade, base: WALL.deep }, { X0, pitch: 2.5, h: 2.2 });
            M.putlogs(116, 138, base + 2, 196, WALL, X0);
            for (const dx of [-6.2, 0, 6.2]) {
                // three windows a side, each a pair of lights under one arch
                B.box(127 + dx - 2.2, 175.3, 127 + dx + 2.2, 181.2, S.rgba(WALL.glint, 0.5), X0);
                M.win(127 + dx - 0.9, 176, 1.25, 3.6, X0, { lit: dx === 0 });
                M.win(127 + dx + 0.9, 176, 1.25, 3.6, X0, { lit: dx === 0 });
            }
            for (const dx of [-7.6, -2.5, 2.5, 7.6]) B.box(127 + dx - 0.3, 187.5, 127 + dx + 0.3, 191, '#3a1c34', X0); // arrow slits
            for (const dx of [-5, 0, 5]) M.win(127 + dx, 166.8, 1.1, 2, X0, { sill: false });
            B.line([[116, 193.6], [138, 193.6]], 0.45, S.rgba(WALL.deep, 0.7), X0);
            B.line([[116, 194.2], [138, 194.2]], 0.4, S.rgba(WALL.glint, 0.85), X0);
            // Santa María de la Alhambra: a slender bell tower over the roofs
            B.box(141, 173.4, 145, 175.6, WHITE.base, 143);
            X0 = M.block(142.2, 147, base, 187, { ...WALL, lit: '#f0b888', base: '#d09468' }, { side: 1.4 });
            M.win(144.6, 181.6, 1.3, 2.8, X0);
            B.dot(144.6, 183.2, 0.42, '#c8a050', X0); // its bell
            B.line([[142.2, 180.4], [147, 180.4]], 0.4, S.rgba(WALL.glint, 0.9), X0);
            B.fill([[141.6, 187], [147.6, 187], [144.6, 192.4]], B.hgrad(141, 148, 189, [[0, TILE.shade], [1, TILE.lit]], X0), X0);
            B.line([[141.6, 187], [144.6, 192.4], [147.6, 187]], 0.4, ln(0.6), X0);
            B.line([[144.6, 192.4], [144.6, 195]], 0.35, ln(0.9), X0);
            B.line([[143.8, 194], [145.4, 194]], 0.35, ln(0.9), X0);
            // Charles V's palace: a square block of stone, rusticated below, round windows over square ones
            X0 = M.block(149, 175, base, 181.5, STONE, { side: 3.4, streaks: 4 });
            for (let y = 162; y < 170.5; y += 1.4) B.line([[149, y], [175, y]], 0.28, S.rgba(STONE.deep, 0.4), X0);
            B.line([[149, 170.9], [175, 170.9]], 0.6, S.rgba(STONE.glint, 0.9), X0);
            B.line([[149, 170.3], [175, 170.3]], 0.4, S.rgba(STONE.deep, 0.7), X0);
            for (let k = 0; k < 7; k++) {
                const x = 151.6 + k * 3.5;
                M.win(x, 172.6, 1.4, 2.6, X0, { square: true, col: '#4a3250' });
                B.dot(x, 177.6, 0.72, '#4a3250', X0);
                M.win(x, 163.2, 1.4, 2.4, X0, { square: true, col: '#4a3250', sill: false });
                B.dot(x, 167.6, 0.62, '#4a3250', X0);
                if (k < 6) B.line([[x + 1.75, 171.2], [x + 1.75, 180]], 0.3, S.rgba(STONE.glint, 0.7), X0); // pilasters
            }
            B.box(148.4, 180.2, 175.6, 181.9, STONE.glint, X0);
            B.line([[148.4, 180.1], [175.6, 180.1]], 0.5, S.rgba(STONE.deep, 0.8), X0);
            M.win(162, base, 2.2, 3.4, X0, { sill: false, col: '#3a2440' });
            // the Alcazaba: its wall and its towers
            M.block(175, 250, base - 1, 167, WALL, { side: 0, streaks: 9, ink: 0.35 });
            M.merlons(175, 250, 167, WALL, { pitch: 2.5, h: 1.8, gap: 13 });
            M.putlogs(175, 250, base, 166.5, WALL, 212);
            X0 = M.block(189, 195, base, 176, WALL, { side: 0 });
            M.merlons(189, 195, 176, WALL, { X0, pitch: 2.6, h: 1.8 });
            X0 = M.block(177, 189, base - 1, 189, WALL, { side: 3.4, streaks: 5 }); // Torre del Homenaje
            M.merlons(177, 189, 189, WALL, { X0, cap: true });
            M.putlogs(177, 189, base + 1, 188, WALL, X0);
            M.win(180.4, 180, 1.2, 2.4, X0);
            M.win(185.4, 180, 1.2, 2.4, X0, { lit: true });
            M.win(183, 171, 1.2, 2.2, X0);
            X0 = M.block(195, 205.5, base - 1, 184, WALL, { side: 3, streaks: 4 }); // Torre Quebrada, and its crack
            M.merlons(195, 205.5, 184, WALL, { X0, cap: true, gap: 1 });
            M.putlogs(195, 205.5, base + 1, 183, WALL, X0);
            B.line([[201.6, 184], [201, 179.5], [202.2, 175.4], [201.4, 171], [202, 166.4]], 0.5, 'rgba(60,24,44,0.85)', X0);
            B.line([[202.2, 175.4], [203.4, 173.6]], 0.35, 'rgba(60,24,44,0.8)', X0);
            // the Torre de la Vela, the bell on its top and the flags
            X0 = M.block(228, 248, base - 3, 194, WALL, { side: 5, streaks: 7 });
            M.merlons(228, 248, 194, WALL, { X0, cap: true, pitch: 3.1, h: 2.6 });
            M.merlons(223, 228, 192.6, { ...WALL, lit: WALL.shade, base: WALL.deep }, { X0, pitch: 2.5, h: 2.1 });
            M.putlogs(228, 248, base, 192, WALL, X0);
            for (const dx of [-5.5, 0, 5.5]) M.win(238 + dx, 182.5, 1.6, 3.2, X0);
            for (const dx of [-3, 3]) B.box(238 + dx - 0.3, 171.5, 238 + dx + 0.3, 174.6, '#3a1c34', X0);
            B.line([[228, 189.6], [248, 189.6]], 0.45, S.rgba(WALL.deep, 0.7), X0);
            B.line([[228, 190.2], [248, 190.2]], 0.4, S.rgba(WALL.glint, 0.85), X0);
            {
                // the espadaña: a little gable with the bell in its arch
                B.box(229.6, 194, 235.4, 201.2, '#f6e0c6', X0);
                B.fill([[229, 201.2], [236, 201.2], [232.5, 204.4]], '#f6e0c6', X0);
                B.line([[229.6, 194], [229.6, 201.2], [229, 201.2], [232.5, 204.4], [236, 201.2], [235.4, 201.2], [235.4, 194]], 0.42, ln(0.75), X0);
                M.win(232.5, 195.3, 3, 4.8, X0, { sill: false, col: '#4a3058' });
                B.dot(232.5, 197.3, 1.05, '#c9a24e', X0);
                B.dot(232.2, 197.6, 0.4, '#fff0b0', X0);
                B.line([[232.5, 198.3], [232.5, 199.8]], 0.3, ln(0.9), X0);
                B.line([[232.5, 204.4], [232.5, 206.6]], 0.32, ln(0.9), X0);
                B.dot(232.5, 206.8, 0.42, '#e8c060', X0);
                // flags: Spain's, Andalusia's, Granada's, streaming on the west wind
                for (const [x, h, cols] of [[239.4, 9.6, ['#c8322f', '#f2c230', '#c8322f']], [242.6, 8.4, ['#2f8a50', '#f4efe4', '#2f8a50']], [245.6, 7.6, ['#c8322f', '#2f8a50']]]) {
                    B.line([[x, 194], [x, 194 + h]], 0.34, 'rgba(40,28,50,0.95)', X0);
                    const fh = 2.5 / cols.length;
                    cols.forEach((c, i) => {
                        const ya = 194 + h - i * fh, yb = ya - fh;
                        B.fill([[x, ya], [x - 1.5, ya + 0.3], [x - 3, ya - 0.2], [x - 4.4, ya + 0.25], [x - 4.4, yb + 0.25], [x - 3, yb - 0.2], [x - 1.5, yb + 0.3], [x, yb]], c, X0);
                    });
                }
            }
            // the Torre de las Armas, lower and forward, with its horseshoe gate, and the
            // bastion under the Vela
            X0 = M.block(208, 220, 150, 172, WALL, { side: 3.4, streaks: 5 });
            M.merlons(208, 220, 172, WALL, { X0, cap: true });
            M.putlogs(208, 220, 153, 171, WALL, X0);
            B.box(212.2, 150, 216.8, 157.4, S.rgba(WALL.glint, 0.6), X0);
            M.win(214.5, 150, 3, 5.6, X0, { sill: false, col: '#35183a' });
            M.win(214.5, 163, 1.2, 2.4, X0);
            X0 = M.block(218, 256, 147, 154.4, WALL, { side: 0, streaks: 5, ink: 0.4 });
            M.merlons(218, 256, 154.4, WALL, { X0, pitch: 2.5, h: 1.7 });
        }

        // ---- the woods of the hill: elms and poplars, and cypresses among them
        {
            const inGen = (X, Y) => X > 6 && X < 54 && Y > 163;
            for (let row = 0; row < 11; row++) {
                for (let X = -6 + R(0, 6); X < 372; X += R(5.6, 9.5)) {
                    const top = yAt(HILL, X), Y = top - 8 - row * 6.4 + R(-2, 2);
                    if (Y < 109 || inGen(X, Y + 5)) continue;
                    if (X > 203 && X < 259 && Y > 140) continue; // the bastion's foot stays clear
                    const u = rnd(), warm = X > 196 ? 0.5 : 0, k = rnd() * 0.5;
                    const C = { lit: S.mix(S.mix(GREEN.lit, '#a8904e', warm), GREEN.base, k), base: S.mix(GREEN.base, GREEN.shade, k), shade: GREEN.shade, deep: GREEN.deep, glint: S.mix(GREEN.glint, '#e0b468', warm) };
                    if (u < 0.24) M.cypress(X, Y, R(9, 15), CYP);
                    else if (u < 0.4) M.tree(X, Y, R(2.6, 3.4), POPLAR, X, { tall: 1.9, wide: 0.8 });
                    else M.tree(X, Y, R(3.4, 5.6), C);
                }
            }
        }

        // ---- the Darro in its ravine, in shadow already
        B.box(-10, 100, W + 10, 117, B.vgrad(102, 117, [[0, '#141c3a'], [0.6, '#182a3c'], [1, 'rgba(18,36,48,0)']]));
        for (let X = -6; X < W; X += R(5, 13)) B.line([[X, 108.6 + R(-0.5, 0.5)], [X + R(2.5, 8), 108.6 + R(-0.5, 0.5)]], R(0.5, 1), rnd() < 0.6 ? 'rgba(150,170,214,0.7)' : 'rgba(226,170,150,0.55)');
        for (let X = -6; X < W; X += R(8, 20)) B.line([[X, 112 + R(-0.4, 0.4)], [X + R(4, 12), 112 + R(-0.4, 0.4)]], 0.7, 'rgba(206,196,214,0.4)'); // the wall of the Carrera
        {
            // a bridge of one arch
            const X0 = 40;
            B.fill([[32, 107.4], [48, 107.4], [48, 113], [32, 113]], '#b89aa8', X0);
            B.fill(S.ellipse(40, 107.4, 4.4, 4.2, 14).filter((p) => p[1] >= 107.3), '#141c3a', X0);
            B.line([[31, 113.2], [49, 113.2]], 0.7, '#e0c8c4', X0);
            B.line([[31, 113.9], [49, 113.9]], 0.3, ln(0.7), X0);
            for (const X of [14, 70, 118, 232, 318, 420, 520, 600]) {
                B.dot(X, 114.6, 2.6, 'rgba(255,206,110,0.22)');
                B.dot(X, 114.6, 0.62, '#ffe08a');
                B.line([[X, 111.6], [X, 114]], 0.3, ln(0.8), X);
            }
        }

        // ---- the Albaicín: a tumble of white cubes, from the back (small) to the front
        const ALB = { lit: '#f4e3d2', base: '#dcc6bc', shade: '#8c84a6', deep: '#4c487c', glint: '#fff4e6' };
        const things = [];
        for (let row = 0; row < 6; row++) {
            const yb = 99 - row * 14.2, hh = 9 + row * 1.9, ww = 9.5 + row * 2.5;
            for (let X = -14 + R(0, 9); X < W + 8;) {
                const w = ww * R(0.7, 1.35), h = hh * R(0.72, 1.45), y = yb + R(-3.4, 3.4);
                if (rnd() < 0.24) {
                    // a carmen: a garden behind its wall, a cypress and an orange tree
                    const gw = R(6, 10) + row;
                    M.cypress(X + gw * 0.3, y + 2, R(10, 15) + row, CYP);
                    if (rnd() < 0.5) M.cypress(X + gw * 0.52, y + 2, R(7, 11) + row, CYP);
                    M.tree(X + gw * 0.74, y + 2, R(2.6, 3.6), GREEN);
                    for (let k = 0; k < 4; k++) B.dot(X + gw * 0.74 + R(-2.2, 2.2), y + R(3.6, 7.6), 0.48, '#f09a3c');
                    M.block(X, X + gw, y, y + R(3, 4.2), ALB, { side: 0, streaks: 2, foot: 0.3 });
                    B.line([[X, y + 4.2], [X + gw, y + 4.2]], 0.5, TILE.lit, X + gw / 2);
                    M.win(X + gw * R(0.3, 0.6), y, 1.7, 2.8, X + gw / 2, { sill: false, col: '#4a3040' }); // its gate
                    if (rnd() < 0.5) for (let k = 0; k < 9; k++) B.dot(X + R(0.5, gw * 0.5), y + R(2.2, 5), R(0.4, 0.8), k % 3 ? '#c8408a' : '#e070a8'); // bougainvillea over the wall
                    X += gw * 0.9;
                    continue;
                }
                const hue = rnd(), wash = hue < 0.14 ? '#eac69c' : hue < 0.22 ? '#e8b6a8' : hue < 0.27 ? '#c9d2dc' : null;
                const C = { ...ALB, lit: tone(wash ? S.mix(ALB.lit, wash, 0.7) : ALB.lit, 0.08), base: tone(wash ? S.mix(ALB.base, wash, 0.6) : ALB.base, 0.1) };
                const hs = M.house(X, y, w, h, C, TILE, { litP: 0.22, flat: rnd() < 0.34, door: '#3c2a4a', winCol: '#342450', side: Math.min(3.4, w * R(0.12, 0.24)), balcony: rnd() < 0.4 });
                // a painted dado along the street, and now and then a gallery under the eaves
                B.box(X, y, X + w, y + 1.1, S.rgba(hue > 0.6 ? '#8a7a8c' : '#b48a6a', 0.55), hs.X0);
                if (!hs.flat && h > 11 && rnd() < 0.3) {
                    B.box(X + 0.8, y + h - 3, X + w - 0.8, y + h - 0.7, 'rgba(52,36,80,0.8)', hs.X0);
                    for (let x = X + 0.8; x <= X + w - 0.7; x += 1.5) B.line([[x, y + h - 3], [x, y + h - 0.7]], 0.35, C.glint, hs.X0);
                }
                if (row >= 1) things.push(hs);
                X += w * R(0.84, 1.16);
            }
            // cypresses stand up between the roofs
            for (let k = 0; k < 9 + row * 2; k++) {
                const X = R(0, W);
                if (rnd() < 0.7) M.cypress(X, yb - R(2, 9), R(9, 14) + row * 0.8, CYP);
                else M.tree(X, yb - R(2, 8), R(2.4, 3.6), GREEN);
            }
            if (row === 1) {
                // the mudéjar tower of a church: brick, bell openings, a tiled spire
                const BR = { lit: '#e9a878', base: '#c98460', shade: '#8a4c50', deep: '#4c2a48', glint: '#ffd0a0' };
                let X0 = M.block(534, 552, 78, 92, ALB, { side: 3 });
                M.roof(534, 552, 92, 4, X0, TILE);
                X0 = M.block(524, 533, 78, 111, BR, { side: 2.6, streaks: 4 });
                for (let y = 82; y < 110; y += 1.5) B.line([[524, y], [533, y]], 0.22, S.rgba(BR.deep, 0.35), X0);
                for (const dx of [-1.9, 1.9]) M.win(528.5 + dx, 102.5, 1.5, 3.6, X0, { col: '#3a2040' });
                B.dot(526.6, 104.6, 0.5, '#c9a24e', X0);
                B.dot(530.4, 104.6, 0.5, '#c9a24e', X0);
                M.win(528.5, 92, 1.3, 2.6, X0);
                B.box(523.4, 110.4, 533.6, 111.6, BR.glint, X0);
                B.fill([[523, 111.6], [534, 111.6], [528.5, 119.4]], B.hgrad(523, 534, 114, [[0, TILE.shade], [1, TILE.lit]], X0), X0);
                B.line([[523, 111.6], [528.5, 119.4], [534, 111.6]], 0.4, ln(0.6), X0);
                for (const y of [113.4, 115.2, 117]) B.line([[524.4 + (y - 111.6) * 0.7, y], [532.6 - (y - 111.6) * 0.7, y]], 0.25, S.rgba('#3f8a6a', 0.9), X0); // glazed tiles
                B.line([[528.5, 119.4], [528.5, 122.6]], 0.35, ln(0.9), X0);
                B.line([[527.5, 121.4], [529.5, 121.4]], 0.35, ln(0.9), X0);
            }
        }
        // what people keep on their roofs, and who is out on them
        let nth = 0;
        for (const hs of things) {
            nth++;
            if (hs.chimney && nth % 2 === 0) {
                // smoke from a supper being made
                const [cx, cy] = hs.chimney, pts = [];
                for (let k = 0; k <= 8; k++) pts.push([cx - k * 0.9 - Math.sin(k * 0.9) * 0.9, cy + k * 1.5]);
                B.line(pts, 1.2, 'rgba(226,214,230,0.28)', hs.X0);
                B.line(pts.slice(0, 5), 0.6, 'rgba(240,230,240,0.4)', hs.X0);
            }
            if (hs.flat && nth % 3 === 0) {
                // washing on a line across the terrace
                const xa = hs.x + 1, xb = hs.x + hs.w - 1, y = hs.top + 3.4;
                B.line([[xa, hs.top + 0.6], [xa, y + 0.3]], 0.3, ln(0.9), hs.X0);
                B.line([[xb, hs.top + 0.6], [xb, y + 0.3]], 0.3, ln(0.9), hs.X0);
                B.line([[xa, y], [(xa + xb) / 2, y - 0.5], [xb, y]], 0.25, ln(0.9), hs.X0);
                for (let x = xa + 1, k = 0; x < xb - 1.2; x += R(1.5, 2.2), k++) B.box(x, y - 0.5 - R(1.6, 2.4), x + R(0.9, 1.4), y - 0.4, ['#f4efe4', '#d8443c', '#8fb4d8', '#f2c85a'][k % 4], hs.X0);
            } else if (hs.flat && nth % 3 === 1) {
                for (let k = 0; k < 3; k++) B.dot(hs.x + 1.5 + k * 1.7, hs.top + 1.5, 0.6, k % 2 ? '#d8443c' : '#3f8a50', hs.X0); // pots along the parapet
            } else if (!hs.flat && nth % 7 === 3) {
                // a cat on the ridge
                const x = hs.x + hs.w * 0.5, y = hs.top + 0.2;
                B.fill([[x - 1.3, y], [x + 1.2, y], [x + 1.3, y + 1.3], [x + 0.8, y + 1.7], [x - 1, y + 1.2]], '#1a1630', hs.X0);
                B.dot(x + 1.2, y + 2, 0.72, '#1a1630', hs.X0);
                B.fill([[x + 0.7, y + 2.5], [x + 0.9, y + 3.2], [x + 1.2, y + 2.6], [x + 1.5, y + 3.2], [x + 1.7, y + 2.5]], '#1a1630', hs.X0);
                B.line([[x - 1.2, y + 0.3], [x - 2.3, y + 1], [x - 2.2, y + 2.2]], 0.35, '#1a1630', hs.X0);
            }
        }
        // the foreground sinks into the evening
        B.box(-10, 20, W + 10, 118, B.vgrad(26, 116, [[0, 'rgba(30,26,84,0.46)'], [0.8, 'rgba(30,26,84,0.14)'], [1, 'rgba(30,26,84,0)']]));
        brushwork(g, B, W, 'granada');
        signature(B, 13, 33, 'rgba(250,226,160,0.9)', 'granada');
    }

    // ------------------------------------------------------------------ Seville in the morning
    function sevilla(g, B, W) {
        const rnd = Motion.rng('fan-sevilla'), M = mini(g, B, rnd, -1), { R, ln, tone } = M;
        const BRICK = { lit: '#f2bb84', base: '#d8905e', shade: '#96584e', deep: '#5e3244', glint: '#ffe2b4' };
        const STONE = { lit: '#f4e6c8', base: '#d9c4a0', shade: '#9a8ea6', deep: '#5c5276', glint: '#fffaf0' };
        const WHITE = { lit: '#fbf6ea', base: '#e6dccc', shade: '#a9a8c8', deep: '#6a6894', glint: '#fffdf4' };
        const ALBERO = { lit: '#f6c860', base: '#e0a43c', shade: '#a8703a', deep: '#6a4234', glint: '#ffe49a' };
        const TILE = { lit: '#e08a58', shade: '#b05a40', deep: '#6a2c34', glint: '#f8b88a' };
        const GREEN = { lit: '#8fb85a', base: '#3f7f4a', shade: '#1f4f3c', deep: '#10302c', glint: '#cfe07c' };
        const IRON = '#456a6e';
        const qw = (X) => (X >= 250 ? 96 - (X - 250) * 0.014 : X >= 60 ? 100 : 100 - (60 - X) * 0.25); // the far bank's waterline

        // ---- sky: pale at the horizon, summer blue above, clouds with flat bases
        B.box(-10, 90, W + 10, 320, B.vgrad(110, 277, [[0, '#f8eed2'], [0.12, '#e2ecdc'], [0.36, '#b0d2e2'], [0.68, '#82b2d8'], [1, '#5688c2']]));
        const cumulus = (cx, cy, w, h, sd) => {
            const r = Motion.rng('cum' + sd), n = Math.max(6, Math.round(w / 7)), lobes = [];
            for (let i = 0; i < n; i++) {
                const u = i / (n - 1), e = Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * u)), 0.75);
                lobes.push([cx + (u - 0.5) * w * 0.88 + (r() - 0.5) * 3, cy + h * 0.08 + e * h * 0.4 * (0.5 + 0.7 * r()), h * (0.2 + 0.36 * e) * (0.75 + 0.5 * r())]);
            }
            // a second tier of smaller turrets on its back
            for (let i = 0; i < n * 0.6; i++) {
                const u = 0.22 + 0.56 * r(), e = Math.sin(Math.PI * u);
                lobes.push([cx + (u - 0.5) * w * 0.74, cy + h * (0.42 + 0.42 * e * r()), h * (0.13 + 0.17 * r())]);
            }
            const lay = (dx, dy, k, col) => {
                for (const [x, y, rr] of lobes) B.fill(S.ellipse(x + dx * (0.5 + rr / h), y + dy * (0.5 + rr / h), rr * k, rr * k * 0.92, 12), col, cx);
            };
            // a flat base: everything is cut off level, as the air cuts a cumulus
            B.clip([[cx - w, cy - 0.4], [cx + w, cy - 0.4], [cx + w, cy + h * 2], [cx - w, cy + h * 2]], cx, () => {
                lay(1.5, -1.6, 1.1, '#95a2d2');
                B.fill(S.ellipse(cx + 1, cy + h * 0.12, w * 0.5, h * 0.3, 16), '#95a2d2', cx);
                lay(0.6, -0.5, 1.02, '#c6cee8');
                lay(-0.8, 0.9, 0.92, '#f1ece2');
                lay(-1.7, 1.9, 0.62, '#fffdf7');
                // the brush left marks in its shadows: short level dabs
                for (let k = 0; k < w * 0.5; k++) {
                    const x = cx + (r() - 0.42) * w * 0.86, y = cy + r() * h * 0.5, len = 2 + r() * 5;
                    B.line([[x, y], [x + len, y + (r() - 0.5) * 0.5]], 0.4 + r() * 0.5, r() < 0.6 ? 'rgba(124,138,196,0.4)' : 'rgba(255,253,246,0.55)', cx);
                }
            });
            B.line([[cx - w * 0.46, cy - 0.5], [cx + w * 0.5, cy - 0.5]], 1.1, 'rgba(110,128,190,0.6)', cx);
            B.line([[cx - w * 0.3, cy - 1.7], [cx + w * 0.34, cy - 1.7]], 0.5, 'rgba(240,238,230,0.5)', cx);
        };
        for (const [cx, cy, w, h] of [[66, 214, 96, 27], [178, 246, 70, 18], [252, 194, 60, 15], [356, 238, 108, 27], [578, 228, 104, 36], [622, 176, 52, 13], [520, 196, 44, 12], [20, 168, 62, 13], [302, 152, 72, 10], [600, 140, 92, 9], [140, 170, 52, 9], [420, 262, 46, 9], [508, 150, 38, 7]]) cumulus(cx, cy, w, h, cx);
        // mares' tails, very high
        for (const [X, Y, len] of [[430, 236, 44], [500, 262, 60], [540, 170, 36], [640, 262, 30], [110, 262, 70], [230, 262, 50], [300, 226, 40], [472, 176, 30]]) {
            for (let k = 0; k < 4; k++) {
                const y = Y + k * 1.5 + R(-0.4, 0.4), x = X + k * R(2, 5);
                B.line(S.curve([[x, y], [x + len * 0.4, y + 1.2], [x + len * 0.8, y + 1.6], [x + len, y + 3.4 + R(0, 1.5)]], false, 5), R(0.4, 0.9), `rgba(255,253,246,${R(0.3, 0.6).toFixed(2)})`);
            }
        }
        for (const [X, Y, s] of [[404, 206, 1.7], [418, 198, 1.3], [498, 232, 1.5], [520, 214, 1.2], [536, 222, 1.6], [226, 222, 1.4], [120, 252, 1.5], [636, 232, 1.3], [470, 256, 1.1], [444, 250, 1.3]]) M.bird(X, Y, s, 'rgba(40,44,84,0.85)');
        for (const [X, Y, s] of [[484, 196, 1.1], [490, 204, 0.9], [478, 208, 1], [496, 190, 0.8], [440, 222, 0.9], [434, 214, 1], [90, 236, 1.2], [104, 244, 0.9], [150, 258, 1.1]]) M.bird(X, Y, s, 'rgba(252,250,244,0.95)'); // doves
        for (let k = 0; k < 6; k++) M.bird(590 + k * 7.5 - (k > 2 ? (k - 2) * 2 : 0), 228 + Math.abs(k - 2) * 3.2, 1.9 - Math.abs(k - 2) * 0.12, 'rgba(34,34,60,0.9)'); // storks, in their wedge

        // ---- the river, laid first: the banks are painted over it
        B.box(-10, 16, W + 10, 104, B.vgrad(24, 102, [[0, '#2c7896'], [0.5, '#4d9ab0'], [1, '#9fd0d8']]));
        for (let k = 0; k < 760; k++) {
            const X = R(-6, W + 6), Y = R(26, 100), far = (Y - 26) / 74, len = R(5, 24) * (1 - far * 0.6), u = rnd();
            B.line([[X - len / 2, Y], [X + len / 2, Y + R(-0.3, 0.3)]], R(0.45, 1.25) * (1 - far * 0.4), u < 0.36 ? `rgba(216,240,238,${R(0.3, 0.7).toFixed(2)})` : u < 0.7 ? `rgba(30,96,128,${R(0.25, 0.55).toFixed(2)})` : `rgba(120,190,200,${R(0.3, 0.6).toFixed(2)})`);
        }

        // ---- the far skyline of the town: white and ochre houses, belfries, domes, palms
        for (let X = 240; X < W + 6;) {
            // the roofs further in, paler with the morning's haze
            const w = R(8, 15), h = R(15, 27), hz = (c) => S.mix(c, '#d4e4ea', 0.4);
            M.house(X, 108, w, h, { lit: hz(WHITE.lit), base: hz(WHITE.base), shade: hz(WHITE.shade), deep: hz(WHITE.deep), glint: hz(WHITE.glint) }, { lit: hz(TILE.lit), shade: hz(TILE.shade), deep: hz(TILE.deep), glint: hz(TILE.glint) }, { roofK: 0.8, winCol: '#8a8aa8', door: '#8a8aa8' });
            X += w * R(0.8, 1.2);
        }
        for (let X = 244; X < W + 6;) {
            const w = R(7, 13), h = R(8, 17);
            if (X < 366 || X > 452) M.house(X, 108, w, h, rnd() < 0.3 ? { ...ALBERO, lit: '#f4d488', base: '#e2b660' } : WHITE, TILE, { roofK: 0.8, winCol: '#4a4468', shutters: rnd() < 0.5 ? '#3f7a58' : null });
            X += w * R(0.8, 1.1);
        }
        const belfry = (x, y, w, h, nest) => {
            const X0 = M.block(x, x + w, y, y + h, rnd() < 0.5 ? BRICK : WHITE, { side: w * 0.3, streaks: 2 });
            M.win(x + w / 2, y + h - 4.6, w * 0.42, 3.2, X0, { col: '#3c3458' });
            B.dot(x + w / 2, y + h - 2.6, 0.5, '#c9a24e', X0);
            B.box(x - 0.5, y + h, x + w + 0.5, y + h + 1, STONE.glint, X0);
            // a spire clad in blue and white tiles
            B.fill([[x - 0.3, y + h + 1], [x + w + 0.3, y + h + 1], [x + w / 2, y + h + 1 + w * 1.25]], '#f0ece0', X0);
            for (let k = 0; k < 4; k++) B.line([[x + 0.4 + k * 0.5, y + h + 1.6 + k * 1.2], [x + w - 0.4 - k * 0.5, y + h + 1.6 + k * 1.2]], 0.45, '#3f6fae', X0);
            B.line([[x - 0.3, y + h + 1], [x + w / 2, y + h + 1 + w * 1.25], [x + w + 0.3, y + h + 1]], 0.38, ln(0.6), X0);
            B.line([[x + w / 2, y + h + 1 + w * 1.25], [x + w / 2, y + h + 3.4 + w * 1.25]], 0.32, ln(0.9), X0);
            if (nest) {
                // storks have built on the cornice
                B.fill([[x + w + 0.2, y + h + 1], [x + w + 3.2, y + h + 1], [x + w + 2.8, y + h + 2.2], [x + w + 0.5, y + h + 2.2]], '#5a4634', X0);
                B.line([[x + w + 1.4, y + h + 2.2], [x + w + 1.4, y + h + 4.2]], 0.3, '#c8442c', X0);
                B.fill([[x + w + 0.7, y + h + 4], [x + w + 2.3, y + h + 4.4], [x + w + 2.1, y + h + 5.6], [x + w + 0.9, y + h + 5.4]], '#f8f4ea', X0);
                B.line([[x + w + 0.7, y + h + 4], [x + w + 1.7, y + h + 4.2]], 0.4, '#1c1a30', X0);
                B.line([[x + w + 2.1, y + h + 5.6], [x + w + 2.5, y + h + 7]], 0.4, '#f8f4ea', X0);
                B.line([[x + w + 2.5, y + h + 7], [x + w + 3.9, y + h + 6.6]], 0.3, '#c8442c', X0);
            }
        };
        const dome = (x, y, r, tiled) => {
            const X0 = x, pts = [];
            M.block(x - r, x + r, y, y + r * 0.7, WHITE, { X0, side: 0, streaks: 1 });
            for (let k = 0; k <= 12; k++) pts.push([x + Math.cos((k / 12) * Math.PI) * r, y + r * 0.7 + Math.sin((k / 12) * Math.PI) * r * 1.05]);
            B.fill(pts, B.hgrad(x - r, x + r, y + r, tiled ? [[0, '#f2ece0'], [0.5, '#9cbcd8'], [1, '#4a6c9c']] : [[0, '#f6c890'], [0.5, '#d88a58'], [1, '#8a4a44']], X0), X0);
            if (tiled) for (let k = 1; k < 6; k++) B.line([[x + Math.cos((k / 6) * Math.PI) * r, y + r * 0.7 + Math.sin((k / 6) * Math.PI) * r * 0.2], [x + Math.cos((k / 6) * Math.PI) * r * 0.12, y + r * 1.72]], 0.3, 'rgba(250,246,236,0.9)', X0);
            B.line(pts, 0.4, ln(0.6), X0);
            B.box(x - 0.7, y + r * 1.72, x + 0.7, y + r * 1.72 + 2, WHITE.lit, X0);
            B.line([[x, y + r * 1.72 + 2], [x, y + r * 1.72 + 4.4]], 0.3, ln(0.9), X0);
        };
        belfry(284, 112, 5.4, 16, true);
        dome(332, 116, 5.4, true);
        belfry(522, 112, 5, 13, false);
        dome(612, 114, 5, false);
        belfry(626, 110, 4.6, 15, false);
        for (const [x, h] of [[262, 16], [304, 21], [318, 15], [352, 18], [498, 20], [540, 24], [548, 17], [584, 21], [600, 16], [644, 19]]) M.palm(x, 112, h);

        // ---- the cathedral: a long Gothic roofline in steps, pinnacles, buttresses
        {
            const X0 = 410, y0 = 108;
            const pinnacle = (x, y, h, C = STONE) => {
                B.fill([[x - 0.55, y], [x + 0.55, y], [x + 0.3, y + h * 0.6], [x, y + h], [x - 0.3, y + h * 0.6]], C.lit, X0);
                B.line([[x + 0.5, y], [x + 0.25, y + h * 0.6], [x, y + h]], 0.3, S.rgba(C.deep, 0.8), X0);
                for (const k of [0.3, 0.52]) B.line([[x - 0.75, y + h * k], [x + 0.75, y + h * k]], 0.28, S.rgba(C.deep, 0.7), X0);
            };
            // the Capilla Real's dome at the east end, by the tower
            M.block(440, 452, y0, 136, STONE, { X0, side: 2 });
            B.fill(S.ellipse(446, 136, 5.2, 6.4, 16).filter((p) => p[1] >= 135.9), B.hgrad(441, 451, 138, [[0, STONE.glint], [0.5, STONE.base], [1, STONE.shade]], X0), X0);
            B.line(S.ellipse(446, 136, 5.2, 6.4, 16).filter((p) => p[1] >= 135.9), 0.4, ln(0.6), X0);
            B.box(445.2, 142.2, 446.8, 144.6, STONE.lit, X0);
            B.line([[446, 144.6], [446, 147]], 0.3, ln(0.9), X0);
            // the nave, higher than the aisles; the crossing higher still
            M.block(378, 440, y0, 146, STONE, { X0, side: 0, streaks: 5 });
            M.block(366, 446, y0, 134, STONE, { X0, side: 3, streaks: 8 });
            M.block(402, 416, 146, 153, STONE, { X0, side: 2, streaks: 1 });
            for (let x = 380.5; x < 440; x += 5.6) {
                M.win(x, 137, 1.1, 5.4, X0, { col: '#4a4266', sill: false });
                B.line([[x, 137.4], [x, 141.6]], 0.2, 'rgba(240,230,210,0.8)', X0); // a mullion
            }
            for (let x = 369.4; x < 446; x += 5.6) {
                M.win(x, 118, 1.5, 9, X0, { col: '#4a4266', sill: false });
                B.line([[x, 118.4], [x, 125]], 0.22, 'rgba(240,230,210,0.8)', X0);
                // a flying buttress from the aisle's parapet up to the nave, a pinnacle on its pier
                B.line([[x + 2.8, 134.4], [x + 2.2, 141.5]], 0.5, STONE.base, X0);
                B.line([[x + 3.1, 134.4], [x + 2.5, 141.5]], 0.28, S.rgba(STONE.deep, 0.7), X0);
                pinnacle(x + 2.8, 134, R(5, 6.6));
            }
            // pierced parapets, the transept's gable with its rose
            for (let x = 366.6; x < 446; x += 1.3) B.line([[x, 134], [x, 135.3]], 0.3, S.rgba(STONE.glint, 0.9), X0);
            for (let x = 378.6; x < 440; x += 1.3) B.line([[x, 146], [x, 147.2]], 0.3, S.rgba(STONE.glint, 0.9), X0);
            B.fill([[399, 134], [419, 134], [419, 146], [409, 151.5], [399, 146]], B.hgrad(399, 419, 140, [[0, STONE.glint], [1, STONE.base]], X0), X0);
            B.line([[399, 134], [399, 146], [409, 151.5], [419, 146], [419, 134]], 0.4, ln(0.55), X0);
            B.dot(409, 142, 2.5, '#4a4266', X0);
            B.ring(S.ellipse(409, 142, 2.5, 2.5, 14), 0.4, STONE.glint, X0);
            for (let k = 0; k < 4; k++) B.line([[409 - Math.cos(k * 0.785) * 2.4, 142 - Math.sin(k * 0.785) * 2.4], [409 + Math.cos(k * 0.785) * 2.4, 142 + Math.sin(k * 0.785) * 2.4]], 0.22, 'rgba(240,230,210,0.85)', X0);
            M.win(409, 118, 3.2, 10, X0, { col: '#3c2c40', sill: false });
            for (const x of [399, 419, 402, 416, 409]) pinnacle(x, x === 409 ? 153 : x === 399 || x === 419 ? 146 : 153, x === 409 ? 6 : 5.4);
            for (const x of [378, 440]) pinnacle(x, 146.4, 5);
        }

        // ---- the Giralda
        {
            const X0 = 462, y0 = 108, hw = 9, H = 70, sh = y0 + H, sx = X0 + hw, sw = hw * 0.55;
            M.block(X0 - hw, X0 + hw, y0, sh, BRICK, { X0, side: sw, streaks: 7 });
            for (let y = y0 + 2; y < sh; y += 1.25) B.line([[X0 - hw, y], [X0 + hw, y]], 0.16, S.rgba(BRICK.deep, 0.2), X0); // courses of brick
            // the flanks: sebka, a net of raised lozenges, in two tiers over blind arches
            const pin = hw * 0.36, pw = hw * 0.55;
            for (const sg of [-1, 1]) {
                for (const [ya, yb] of [[y0 + H * 0.4, y0 + H * 0.63], [y0 + H * 0.68, y0 + H * 0.91]]) {
                    const x0 = X0 + (sg < 0 ? -pin - pw : pin), x1 = x0 + pw;
                    B.box(x0, ya, x1, yb, S.rgba(BRICK.shade, 0.62), X0);
                    B.clip([[x0, ya], [x1, ya], [x1, yb], [x0, yb]], X0, () => {
                        for (let d = -pw * 1.6; d < yb - ya + pw * 1.6; d += 1.75) {
                            B.line([[x0, ya + d], [x1, ya + d + pw * 1.6]], 0.34, S.rgba(BRICK.glint, 0.9), X0);
                            B.line([[x0, ya + d + pw * 1.6], [x1, ya + d]], 0.34, S.rgba(BRICK.glint, 0.9), X0);
                        }
                    });
                    B.ring([[x0, ya], [x1, ya], [x1, yb], [x0, yb]], 0.3, S.rgba(BRICK.deep, 0.8), X0);
                    for (const k of [0.27, 0.73]) M.win(x0 + pw * k, ya - 4.2, 1.2, 3, X0, { sill: false, col: S.rgba(BRICK.deep, 0.9) });
                }
                // on the shaded side, the same panels turn away
                if (sg > 0) for (const [ya, yb] of [[y0 + H * 0.4, y0 + H * 0.63], [y0 + H * 0.68, y0 + H * 0.91]]) {
                    B.box(sx + sw * 0.1, ya - 0.4, sx + sw * 0.34, yb - 0.5, S.rgba(BRICK.deep, 0.55), X0);
                    B.box(sx + sw * 0.66, ya - 0.9, sx + sw * 0.9, yb - 1, S.rgba(BRICK.deep, 0.55), X0);
                }
            }
            // up the middle: windows with balconies, single below, paired under an arch above
            for (let i = 0; i < 5; i++) {
                const yw = y0 + H * (0.2 + i * 0.152);
                B.box(X0 - 2.6, yw - 0.9, X0 + 2.6, yw + 5, S.rgba(BRICK.glint, 0.55), X0);
                B.ring([[X0 - 2.6, yw - 0.9], [X0 + 2.6, yw - 0.9], [X0 + 2.6, yw + 5], [X0 - 2.6, yw + 5]], 0.25, S.rgba(BRICK.deep, 0.7), X0);
                if (i < 2) M.win(X0, yw, 2, 3.8, X0, { sill: false, col: '#3a2038' });
                else for (const dx of [-1, 1]) M.win(X0 + dx, yw, 1.3, 3.6, X0, { sill: false, col: '#3a2038' });
                B.line([[X0 - 3.1, yw - 0.5], [X0 + 3.1, yw - 0.5]], 0.6, STONE.glint, X0);
                for (let x = X0 - 2.7; x <= X0 + 2.7; x += 0.9) B.line([[x, yw - 0.5], [x, yw + 0.9]], 0.2, STONE.glint, X0);
                B.line([[X0 - 3.1, yw + 0.9], [X0 + 3.1, yw + 0.9]], 0.25, STONE.glint, X0);
                B.box(sx + sw * 0.4, yw - 0.6, sx + sw * 0.6, yw + 2.6, '#3a2038', X0);
            }
            // the top of the old minaret: a frieze of blind arches, a cornice
            for (let x = X0 - hw + 1; x < X0 + hw - 0.5; x += 1.9) M.win(x + 0.4, sh - 4.6, 1.1, 3, X0, { sill: false, col: S.rgba(BRICK.deep, 0.85) });
            B.box(X0 - hw - 0.7, sh - 0.9, X0 + hw + sw + 0.4, sh + 0.4, STONE.glint, X0);
            B.line([[X0 - hw - 0.7, sh - 1], [X0 + hw + sw + 0.4, sh - 1]], 0.45, S.rgba(BRICK.deep, 0.85), X0);
            // the belfry, tier on tier
            let y = sh + 0.4;
            const tier = (k, h, C, round) => {
                const w = hw * k;
                if (round) {
                    B.box(X0 - w, y, X0 + w, y + h, B.hgrad(X0 - w, X0 + w, y, [[0, C.glint], [0.4, C.lit], [1, C.shade]], X0), X0);
                    B.ring([[X0 - w, y], [X0 + w, y], [X0 + w, y + h], [X0 - w, y + h]], 0.4, ln(0.6), X0);
                } else M.block(X0 - w, X0 + w, y, y + h, C, { X0, side: w * 0.5, streaks: 1, foot: 0.25 });
                B.box(X0 - w - 0.6, y + h - 0.7, X0 + w + (round ? 0.6 : w * 0.5 + 0.4), y + h + 0.3, STONE.glint, X0);
                B.line([[X0 - w - 0.6, y + h - 0.8], [X0 + w + (round ? 0.6 : w * 0.5 + 0.4), y + h - 0.8]], 0.4, S.rgba(C.deep, 0.85), X0);
                const y0t = y;
                y += h + 0.3;
                return [w, y0t];
            };
            const baluster = (w, yy) => {
                B.line([[X0 - w - 0.4, yy + 1.5], [X0 + w + 0.4, yy + 1.5]], 0.35, STONE.glint, X0);
                for (let x = X0 - w; x <= X0 + w; x += 0.85) B.line([[x, yy], [x, yy + 1.5]], 0.2, STONE.glint, X0);
            };
            const urn = (x, yy, s = 1) => {
                // a bronze vase of lilies
                B.fill([[x - 0.8 * s, yy], [x + 0.8 * s, yy], [x + 1.15 * s, yy + 1.3 * s], [x + 0.45 * s, yy + 2.3 * s], [x - 0.45 * s, yy + 2.3 * s], [x - 1.15 * s, yy + 1.3 * s]], '#4a5a48', X0);
                B.line([[x - 0.9 * s, yy + 1.2 * s], [x - 0.3 * s, yy + 2.2 * s]], 0.25, '#a8c0a0', X0);
                for (const dx of [-0.9, 0, 0.9]) {
                    B.line([[x, yy + 2.3 * s], [x + dx * s, yy + 4.1 * s]], 0.22, '#3c5a44', X0);
                    B.dot(x + dx * s, yy + 4.3 * s, 0.36 * s, '#f4efe0', X0);
                }
            };
            // the body of the bells: five arches a side, a bell in each
            let [w, yt] = tier(0.93, H * 0.215, STONE);
            baluster(w, yt + 0.2);
            for (const [dx, ww, hh] of [[0, 2.5, 9.4], [-3.2, 1.5, 7.4], [3.2, 1.5, 7.4], [-6, 1.4, 6.6], [6, 1.4, 6.6]]) {
                M.win(X0 + dx, yt + 2.6, ww, hh, X0, { sill: false, col: '#3c3454' });
                B.dot(X0 + dx, yt + 2.6 + hh * 0.6, ww * 0.3, '#b89a4e', X0);
                B.dot(X0 + dx - ww * 0.1, yt + 2.8 + hh * 0.6, ww * 0.12, '#fff0b0', X0);
            }
            B.box(X0 + w + w * 0.14, yt + 2.6, X0 + w + w * 0.34, yt + 9, '#3c3454', X0);
            for (const x of [X0 - w, X0 + w, X0 + w + w * 0.5]) urn(x, y, 1);
            // the body of the clock
            [w, yt] = tier(0.64, H * 0.185, { ...BRICK, lit: '#f6d2a4', base: '#e2ac7c' });
            baluster(w, yt + 0.2);
            for (const dx of [-3, 0, 3]) M.win(X0 + dx, yt + 2.4, 1.3, 5.2, X0, { sill: false, col: '#3c3454' });
            B.dot(X0, yt + 10.4, 1.5, STONE.glint, X0);
            B.ring(S.ellipse(X0, yt + 10.4, 1.5, 1.5, 12), 0.25, ln(0.8), X0);
            B.line([[X0, yt + 10.4], [X0 + 0.2, yt + 11.5]], 0.22, ln(0.95), X0);
            B.line([[X0, yt + 10.4], [X0 + 0.8, yt + 10.2]], 0.22, ln(0.95), X0);
            for (const x of [X0 - w, X0 + w]) urn(x, y, 0.7);
            // the body of the stars
            [w, yt] = tier(0.46, H * 0.15, STONE);
            for (const dx of [-1.6, 1.6]) M.win(X0 + dx, yt + 1.4, 1.2, 4.4, X0, { sill: false, col: '#3c3454' });
            for (let k = 0; k < 4; k++) B.line([[X0 - Math.cos(k * 0.785) * 1.3, yt + 8.2 - Math.sin(k * 0.785) * 1.3], [X0 + Math.cos(k * 0.785) * 1.3, yt + 8.2 + Math.sin(k * 0.785) * 1.3]], 0.25, BRICK.shade, X0);
            // the round body with its balls, the cupola
            [w, yt] = tier(0.34, H * 0.125, STONE, true);
            for (const dx of [-1.5, 0, 1.5]) B.box(X0 + dx - 0.3, yt + 1.6, X0 + dx + 0.3, yt + 6, '#3c3454', X0);
            for (const dx of [-3.4, 3.4]) B.dot(X0 + dx, y + 0.5, 0.55, '#c9a24e', X0);
            const cup = [];
            for (let k = 0; k <= 10; k++) cup.push([X0 + Math.cos((k / 10) * Math.PI) * hw * 0.3, y + Math.sin((k / 10) * Math.PI) * H * 0.07]);
            B.fill(cup, B.hgrad(X0 - 3, X0 + 3, y, [[0, STONE.glint], [0.5, STONE.base], [1, STONE.shade]], X0), X0);
            B.line(cup, 0.4, ln(0.6), X0);
            y += H * 0.07;
            B.dot(X0, y + 1.3, 1.3, '#5a6a54', X0);
            B.dot(X0 - 0.4, y + 1.7, 0.4, '#b8d0b0', X0);
            y += 2.6;
            // the Giraldillo: Faith, in bronze, turning with the wind, a shield in one hand and a palm in the other
            const BZ = '#34503f';
            B.line([[X0 - 0.9, y - 0.4], [X0 - 0.9, y + 9.6]], 0.3, BZ, X0);
            B.fill([[X0 - 1.2, y], [X0 + 1.3, y], [X0 + 0.7, y + 3.9], [X0 - 0.6, y + 3.9]], BZ, X0);
            B.fill([[X0 - 0.75, y + 3.9], [X0 + 0.8, y + 3.9], [X0 + 0.55, y + 6], [X0 - 0.5, y + 6]], BZ, X0);
            B.dot(X0 + 0.05, y + 6.7, 0.68, BZ, X0);
            B.fill([[X0 - 0.9, y + 5.4], [X0 - 3.6, y + 6.4], [X0 - 4, y + 4.4], [X0 - 3.6, y + 2.6], [X0 - 0.9, y + 2.4]], BZ, X0);
            B.line([[X0 - 3.6, y + 6.2], [X0 - 3.9, y + 4.4], [X0 - 3.6, y + 2.8]], 0.25, '#a8c8a8', X0);
            B.line([[X0 + 0.6, y + 5], [X0 + 2.9, y + 8]], 0.3, BZ, X0);
            for (const k of [0.4, 0.65, 0.9]) B.line([[X0 + 0.6 + 2.3 * k, y + 5 + 3 * k], [X0 + 0.6 + 2.3 * k + 0.9, y + 5 + 3 * k - 0.3]], 0.25, BZ, X0);
            B.line([[X0 - 0.3, y + 0.3], [X0 - 0.2, y + 6]], 0.22, '#a8c8a8', X0);
            B.line([[X0 - 1.5, y + 9.2], [X0 - 0.3, y + 9.2]], 0.28, BZ, X0);
        }

        // ---- the Archivo de Indias and the Alcázar's wall, beyond the quay
        {
            let X0 = M.block(480, 508, 108, 124, { ...BRICK, lit: '#f0c49c', base: '#dca27c' }, { side: 3.2, streaks: 3 });
            for (let k = 0; k < 7; k++) {
                B.line([[481.4 + k * 4.4, 108], [481.4 + k * 4.4, 124]], 0.5, STONE.glint, X0);
                if (k < 6) {
                    M.win(483.6 + k * 4.4, 117.4, 1.5, 3.4, X0, { square: true, col: '#4a4468' });
                    M.win(483.6 + k * 4.4, 110.4, 1.5, 3.2, X0, { col: '#4a4468' });
                }
            }
            B.line([[480, 115.6], [508, 115.6]], 0.5, STONE.glint, X0);
            B.box(479.4, 123.6, 511.6, 124.8, STONE.glint, X0);
            for (let x = 480; x <= 508; x += 1.1) B.line([[x, 124.8], [x, 126]], 0.2, STONE.glint, X0);
            for (const x of [480.4, 507.6]) B.fill([[x - 0.7, 124.8], [x + 0.7, 124.8], [x, 129.4]], STONE.lit, X0);
            const ALC = { lit: '#eab07c', base: '#cf8a5e', shade: '#8f5650', deep: '#583044', glint: '#ffd6a8' };
            X0 = M.block(514, 604, 108, 118, ALC, { side: 0, streaks: 9, ink: 0.4 });
            M.merlons(514, 604, 118, ALC, { X0, pitch: 2.6, h: 1.9, cap: true, gap: 21 });
            for (const [xa, xb] of [[530, 538], [566, 574], [594, 601]]) {
                const Xt = M.block(xa, xb, 108, 123, ALC, { side: 2, streaks: 2 });
                M.merlons(xa, xb, 123, ALC, { X0: Xt, pitch: 2.6, h: 1.9, cap: true });
                M.win((xa + xb) / 2, 116.6, 1.1, 2.4, Xt);
            }
        }

        // ---- the Triana bridge, far up the river: iron arches with rings in their spandrels
        {
            const xa = 62, xb = 248, yw = 100, yd = 112, pw = 5.2, sw = (xb - xa - 2 * pw) / 3;
            // what lies behind it: the far bend, the potteries' bottle kilns
            for (let X = xa; X < xb; X += R(5, 9)) {
                const h = R(4, 8.5);
                B.box(X, yw, X + R(4, 8), yw + h, S.mix(S.mix('#e9e2d6', '#d8c0a0', rnd()), '#a9cbe0', 0.3));
                B.line([[X - 0.3, yw + h], [X + 7, yw + h]], 0.6, S.mix(TILE.shade, '#a9cbe0', 0.3));
            }
            for (const [x, h] of [[96, 13], [103, 10.5], [182, 12]]) {
                B.fill(S.curve([[x - 2.6, yw], [x - 2.5, yw + h * 0.35], [x - 1, yw + h * 0.8], [x - 0.6, yw + h], [x + 0.6, yw + h], [x + 1, yw + h * 0.8], [x + 2.5, yw + h * 0.35], [x + 2.6, yw]], false, 3), '#c08a78', x);
                B.line([[x - 2.2, yw + 0.5], [x - 0.7, yw + h * 0.9]], 0.4, '#f0c0a0', x);
                B.line([[x - 0.2, yw + h + 0.4], [x - 1.6, yw + h + 3], [x - 1.2, yw + h + 5.6]], 0.8, 'rgba(240,240,240,0.4)', x); // a kiln firing
            }
            const archY = (t) => yw + 2.4 + (yd - 3 - yw - 2.4) * (1 - (2 * t - 1) * (2 * t - 1));
            for (let s = 0; s < 3; s++) {
                const x0 = xa + s * (sw + pw), x1 = x0 + sw, arch = [];
                for (let k = 0; k <= 20; k++) arch.push([lerp(x0, x1, k / 20), archY(k / 20)]);
                // the rings: largest at the piers, smaller towards the crown
                for (const t of [0.045, 0.125, 0.2, 0.265, 0.32, 0.365]) {
                    for (const tt of [t, 1 - t]) {
                        const gap = yd - 1.3 - archY(tt), rr = gap / 2 - 0.15, cx = lerp(x0, x1, tt);
                        if (rr < 0.45) continue;
                        B.ring(S.ellipse(cx, archY(tt) + gap / 2, rr, rr, 12), 0.7, IRON, cx);
                        B.line(S.ellipse(cx, archY(tt) + gap / 2, rr, rr, 12).slice(3, 7), 0.25, '#cfe4dc', cx);
                    }
                }
                B.line(arch.map(([x, y]) => [x, y - 0.5]), 0.5, 'rgba(30,50,60,0.8)');
                B.line(arch, 1.35, IRON);
                B.line(arch.map(([x, y]) => [x, y + 0.35]), 0.3, '#cfe4dc');
                // its reflection: a dark bow broken by the ripples
                for (let k = 1; k < 20; k += 2) if (rnd() < 0.8) B.line([[arch[k][0] - 1.6, 2 * yw - arch[k][1] - 0.5], [arch[k][0] + 1.8, 2 * yw - arch[k][1] - 0.5]], 0.6, 'rgba(34,72,96,0.5)');
            }
            for (const x of [xa + sw, xa + 2 * sw + pw]) {
                // stone piers with pointed cutwaters
                M.block(x, x + pw, yw - 1.4, yd - 1.2, STONE, { X0: x + pw / 2, side: 1.4, streaks: 1 });
                B.fill([[x - 1.6, yw - 1.4], [x + pw / 2, yw - 3], [x + pw + 1.6, yw - 1.4], [x + pw + 1, yw + 2.4], [x - 1, yw + 2.4]], STONE.base, x + pw / 2);
                B.line([[x - 1.6, yw - 1.4], [x + pw / 2, yw - 3], [x + pw + 1.6, yw - 1.4]], 0.35, ln(0.6), x + pw / 2);
                M.reflect(x + pw / 2, yw - 3, 9, () => [pw * 0.6, '#cdb894']);
            }
            // the deck, its railing and lamps, and who is crossing
            B.box(xa - 4, yd - 1.3, xb + 4, yd, IRON);
            B.line([[xa - 4, yd], [xb + 4, yd]], 0.35, '#cfe4dc');
            B.line([[xa - 4, yd - 1.4], [xb + 4, yd - 1.4]], 0.35, 'rgba(30,50,60,0.85)');
            B.line([[xa - 4, yd + 1.7], [xb + 4, yd + 1.7]], 0.28, 'rgba(40,60,70,0.9)');
            for (let x = xa - 3; x < xb + 4; x += 1.5) B.line([[x, yd], [x, yd + 1.7]], 0.18, 'rgba(40,60,70,0.9)');
            for (let x = xa + 8; x < xb; x += 22.5) {
                B.line([[x, yd], [x, yd + 5.4]], 0.32, 'rgba(34,50,60,0.95)', x);
                B.line([[x - 1.3, yd + 4.6], [x + 1.3, yd + 4.6]], 0.28, 'rgba(34,50,60,0.95)', x);
                for (const dx of [-1.3, 1.3]) B.dot(x + dx, yd + 5.1, 0.55, '#fff4c8', x);
            }
            for (const [x, c] of [[86, '#c8322f'], [91, '#2c3050'], [128, '#f4efe4'], [150, '#2c3050'], [154, '#d98a3a'], [204, '#3f7a58'], [226, '#c8322f']]) M.fig(x, yd + 0.1, 2.9, c, x, { hat: c === '#2c3050' ? '#1c1a30' : null });
            {
                // a mule cart with a load of jars
                const x = 172;
                B.box(x, yd + 0.9, x + 5, yd + 2.3, '#8a5a3a', x);
                for (const dx of [1, 2.5, 4]) B.dot(x + dx, yd + 3, 0.7, '#c8804a', x);
                B.ring(S.ellipse(x + 2.5, yd + 0.7, 1.1, 1.1, 10), 0.3, '#2a1c2a', x);
                B.fill([[x + 6, yd + 0.2], [x + 9.4, yd + 0.2], [x + 9.8, yd + 2.4], [x + 6.4, yd + 2.2]], '#4a3a3a', x);
                B.line([[x + 9.6, yd + 2.2], [x + 10.6, yd + 3.2]], 0.5, '#4a3a3a', x);
            }
        }

        // ---- Triana: the bank at the bridge's end, painted fronts, the Capilla del Carmen
        {
            // Santa Ana's tower over the roofs: brick, its top clad in blue and white tiles
            const TA = { lit: '#f0b888', base: '#d8926a', shade: '#9a5c58', deep: '#5e3448', glint: '#ffe0b8' };
            let Xt = M.block(39, 46.5, 104, 138, TA, { side: 2.2, streaks: 3 });
            for (let y = 108; y < 137; y += 1.3) B.line([[39, y], [46.5, y]], 0.16, S.rgba(TA.deep, 0.25), Xt);
            for (const y of [121.5, 130]) {
                B.box(38.4, y, 49.2, y + 1, STONE.glint, Xt);
                B.line([[38.4, y - 0.1], [49.2, y - 0.1]], 0.35, S.rgba(TA.deep, 0.8), Xt);
            }
            for (const dx of [-1.7, 1.7]) M.win(42.75 + dx, 132, 1.4, 4, Xt, { sill: false, col: '#3c3458' });
            B.dot(41.05, 134.4, 0.45, '#c9a24e', Xt);
            B.dot(44.45, 134.4, 0.45, '#c9a24e', Xt);
            M.win(42.75, 124, 1.3, 3, Xt, { col: '#3c3458' });
            B.box(38.4, 138, 49.2, 139.2, STONE.glint, Xt);
            Xt = M.block(40.4, 45.1, 139.2, 145, { ...STONE, lit: '#f6efe0' }, { X0: Xt, side: 1.2, streaks: 1, foot: 0.2 });
            for (let k = 0; k < 4; k++) B.box(40.4 + k * 1.2, 140.4 + (k % 2) * 1.6, 41.4 + k * 1.2, 141.8 + (k % 2) * 1.6, '#3f6fae', Xt);
            B.fill([[40, 145], [45.5, 145], [42.75, 152.5]], B.hgrad(40, 45.5, 147, [[0, '#f4efe0'], [1, '#6f94c4']], Xt), Xt);
            for (const y of [146.4, 148.2, 150]) B.line([[40.6 + (y - 145) * 0.36, y], [44.9 - (y - 145) * 0.36, y]], 0.3, '#3f6fae', Xt);
            B.line([[40, 145], [42.75, 152.5], [45.5, 145]], 0.38, ln(0.6), Xt);
            B.line([[42.75, 152.5], [42.75, 155.6]], 0.3, ln(0.9), Xt);
            B.line([[41.9, 154.4], [43.6, 154.4]], 0.3, ln(0.9), Xt);
        }
        {
            const fronts = [['#f1b84a', '#fff4d8'], ['#f6efe0', '#e0a43c'], ['#e9a39a', '#fff4e8'], ['#a9cfe0', '#fbf6ea'], ['#f6efe0', '#3f7fae'], ['#d9794a', '#fff0d8'], ['#f3d27a', '#c8322f']];
            let k = 0;
            for (let X = -10; X < 58;) {
                const w = R(9, 14), yb = qw(X + w / 2) + 4.5, h = R(15, 26) + (58 - X) * 0.12, [wall, trim] = fronts[k++ % fronts.length];
                const C = { lit: wall, base: S.mix(wall, '#a8885a', 0.22), shade: S.mix(wall, '#6a5a8c', 0.5), deep: S.mix(wall, '#3a305c', 0.65), glint: S.mix(wall, '#fffdf4', 0.4) };
                const hs = M.house(X, yb, w, h, C, TILE, { balcony: true, winCol: '#3a3458', door: '#3a2a3a', flat: rnd() < 0.25, shutters: rnd() < 0.6 ? '#2f6a50' : '#3f5f9a' });
                B.line([[X, yb + h * 0.5], [X + w, yb + h * 0.5]], 0.4, trim, hs.X0);
                B.line([[X, yb + h - 0.5], [X + w, yb + h - 0.5]], 0.6, trim, hs.X0);
                B.box(X, yb, X + w, yb + 1.3, S.rgba(trim, 0.85), hs.X0); // a painted dado
                if (rnd() < 0.5) {
                    // a striped awning over the shop
                    const ax = X + w * R(0.2, 0.5);
                    for (let s = 0; s < 4; s++) B.fill([[ax + s * 0.9, yb + 4.4], [ax + s * 0.9 + 0.9, yb + 4.4], [ax + s * 0.9 + 1.2, yb + 3.2], [ax + s * 0.9 + 0.3, yb + 3.2]], s % 2 ? '#f4efe4' : '#c8322f', hs.X0);
                }
                // the quay under it and the house in the water
                B.box(X - 0.5, qw(X + w / 2) - 0.5, X + w + 0.5, yb, B.vgrad(qw(X) - 1, yb, [[0, '#8a7a6a'], [1, '#d8c4a0']]), hs.X0);
                M.reflect(hs.X0, qw(X + w / 2) - 1, h * 0.9, () => [w * 0.5, wall]);
                X += w * R(0.9, 1.02);
            }
            // the Capilla del Carmen at the bridge's foot: a tiled dome and a little belfry
            const X0 = 61;
            M.block(55.5, 64, 104, 113.5, { ...BRICK, lit: '#f0c090', base: '#d89a6a' }, { X0, side: 1.8 });
            const dm = S.ellipse(59.8, 113.5, 4.8, 5.4, 16).filter((p) => p[1] >= 113.4);
            B.fill(dm, B.hgrad(55, 64.6, 115, [[0, '#f6d890'], [0.5, '#d98a4a'], [1, '#8a4a3c']], X0), X0);
            for (let j = 0; j < 5; j++) B.line(dm.map(([x, y]) => [59.8 + (x - 59.8) * (1 - j * 0.2), 113.5 + (y - 113.5) * (1 - j * 0.02)]).filter((_, i) => i % 2 === j % 2), 0.25, j % 2 ? '#3f6fae' : '#f6f0dc', X0);
            B.line(dm, 0.4, ln(0.6), X0);
            B.box(59, 118.8, 60.6, 120.8, STONE.lit, X0);
            M.block(66, 69.6, 104, 119, { ...BRICK, lit: '#f0c090', base: '#d89a6a' }, { X0, side: 1 });
            M.win(67.8, 113.6, 1.3, 2.8, X0, { col: '#3a3458' });
            B.fill(S.ellipse(67.8, 119, 2, 2.6, 12).filter((p) => p[1] >= 118.9), '#d98a4a', X0);
            B.line([[67.8, 121.6], [67.8, 124]], 0.3, ln(0.9), X0);
        }

        // ---- the quay of the town: its wall, the walk on top, orange trees, lamps, people
        {
            const top = (X) => qw(X) + 9.5;
            B.fill([[250, top(250)], [664, top(664)], [664, 110], [250, 110]], '#e9d4a8');
            for (let X = 252; X < W; X += R(6, 16)) B.line([[X, R(top(X) + 0.6, 109)], [X + R(3, 10), R(top(X) + 0.6, 109)]], 0.5, rnd() < 0.5 ? 'rgba(170,130,90,0.4)' : 'rgba(255,246,220,0.6)');
            // the wall: courses of stone, weed and water marks, rings for mooring, a stair
            B.fill([[250, qw(250) - 0.5], [664, qw(664) - 0.5], [664, top(664)], [250, top(250)]], B.vgrad(88, 106, [[0, '#8f7a66'], [0.3, '#cdb088'], [1, '#e6cfa0']]));
            for (let c = 1; c < 5; c++) B.line([[250, qw(250) + c * 2], [664, qw(664) + c * 2]], 0.25, 'rgba(110,84,64,0.5)');
            for (let X = 252; X < W; X += R(3.4, 6)) {
                const c = Math.floor(R(0, 5));
                B.line([[X, qw(X) + c * 2], [X, qw(X) + c * 2 + 2]], 0.22, 'rgba(110,84,64,0.5)');
                if (rnd() < 0.2) B.line([[X, top(X) - 0.4], [X + R(-0.4, 0.4), top(X) - R(3, 7)]], R(0.4, 0.9), 'rgba(96,84,72,0.4)');
                if (rnd() < 0.13) B.dot(X, qw(X) + 0.9, 0.7, 'rgba(60,96,70,0.7)');
            }
            B.line([[250, top(250)], [664, top(664)]], 0.6, '#fff2d0');
            B.line([[250, top(250) - 0.6], [664, top(664) - 0.6]], 0.35, 'rgba(90,64,60,0.7)');
            for (const X of [300, 356, 424, 492, 620]) {
                B.ring(S.ellipse(X, qw(X) + 4, 0.9, 1.1, 10), 0.3, '#3a3040', X);
                B.dot(X, qw(X) + 5.2, 0.4, '#3a3040', X);
            }
            for (let s = 0; s < 6; s++) B.box(388 + s * 1.8, qw(390) - 0.4, 400.6, qw(390) + 9.5 - s * 1.55, s % 2 ? '#d8c094' : '#b89c78', 394); // a stair down to the water
            // a man fishing off the wall, his line in the river
            M.fig(444, top(444) + 0.1, 2.8, '#3a5a8c', 444, { hat: '#e9d7a0' });
            B.line([[444.6, top(444) + 2], [452, top(444) + 5.4]], 0.24, '#3a2a2a', 444);
            B.line([[452, top(444) + 5.4], [452.6, qw(452) - 5]], 0.16, 'rgba(250,250,250,0.8)', 444);
            for (const rr of [1, 1.9]) B.ring(S.ellipse(452.6, qw(452) - 5.2, rr, rr * 0.36, 10), 0.22, 'rgba(236,250,250,0.8)', 452.6);
            // lamps, orange trees with their fruit, a railing
            for (let X = 262; X < W; X += 30) {
                B.line([[X, top(X)], [X, top(X) + 7.4]], 0.34, '#2c3444', X);
                B.fill([[X - 0.8, top(X) + 7.4], [X + 0.8, top(X) + 7.4], [X + 0.55, top(X) + 9], [X - 0.55, top(X) + 9]], '#fff4c8', X);
                B.line([[X - 0.9, top(X) + 9.1], [X, top(X) + 9.8], [X + 0.9, top(X) + 9.1]], 0.3, '#2c3444', X);
            }
            for (let X = 258; X < W; X += R(10, 16)) {
                if (Math.abs(X - 563) < 22) continue;
                const y = top(X) + R(1.6, 3.4), r = R(3.3, 4.4);
                M.tree(X, y + 1.6, r, GREEN, X);
                for (let k = 0; k < 6; k++) {
                    const ox = X + R(-0.8, 0.8) * r, oy = y + 1.6 + r * R(0.5, 1.5);
                    B.dot(ox, oy, 0.6, '#f0922e', X);
                    B.dot(ox - 0.15, oy + 0.15, 0.22, '#ffd48a', X);
                }
                B.line([[X - r * 0.7, y - 0.2], [X + r * 1.3, y - 0.5]], 0.5, 'rgba(60,50,80,0.35)', X);
            }
            for (const [X, c, o] of [[276, '#c8322f', {}], [281, '#f4efe4', { hat: '#2c3050' }], [322, '#2c3050', { hat: '#1c1a30' }], [340, '#d98a3a', {}], [374, '#f4efe4', {}], [410, '#3f7a58', {}], [470, '#c8322f', {}], [476, '#2c3050', { hat: '#1c1a30' }], [596, '#e9a39a', {}], [634, '#2c3050', {}], [640, '#f1b84a', {}]]) M.fig(X, top(X) + R(0.4, 1.6), R(2.7, 3.3), c, X, o);
            {
                // a lady under a parasol
                const X = 606, y = top(X) + 1;
                M.fig(X, y, 3.2, '#f6efe0', X);
                B.line([[X + 0.6, y + 1.8], [X + 1, y + 4.6]], 0.2, '#3a2a2a', X);
                B.fill([[X - 1, y + 4.4], [X + 3, y + 4.4], [X + 1, y + 5.8]], '#e0584c', X);
            }
            {
                // a horse carriage: yellow wheels, a black hood, the horse stepping out
                const X = 520, y = top(X) + 1.2;
                B.box(X, y + 1.5, X + 5.6, y + 3.4, '#1c1a30', X);
                B.fill([[X + 0.2, y + 3.4], [X + 3.4, y + 3.4], [X + 3, y + 5.6], [X + 0.6, y + 5.4]], '#2c2a44', X);
                M.fig(X + 4.4, y + 3.2, 2.4, '#f4efe4', X, { hat: '#1c1a30' });
                for (const dx of [1.2, 4.6]) {
                    B.ring(S.ellipse(X + dx, y + 1.2, 1.25, 1.25, 12), 0.34, '#e8b830', X);
                    B.line([[X + dx - 1.2, y + 1.2], [X + dx + 1.2, y + 1.2]], 0.18, '#e8b830', X);
                    B.line([[X + dx, y], [X + dx, y + 2.4]], 0.18, '#e8b830', X);
                }
                B.fill([[X + 7, y + 1.8], [X + 11, y + 1.9], [X + 11.6, y + 3.4], [X + 7.2, y + 3.6]], '#6a4634', X);
                B.fill([[X + 11, y + 3], [X + 12.6, y + 4.8], [X + 13.2, y + 4.2], [X + 12, y + 2.6]], '#6a4634', X);
                for (const dx of [7.4, 8.4, 10.4, 11.2]) B.line([[X + dx, y + 1.9], [X + dx + (dx > 10 ? 0.5 : -0.3), y]], 0.3, '#4a2e24', X);
                B.line([[X + 7, y + 3.2], [X + 6.2, y + 1.6]], 0.3, '#3a2420', X);
                B.line([[X + 5.6, y + 2.6], [X + 7.2, y + 2.8]], 0.2, '#1c1a30', X);
            }
        }

        // ---- the Torre del Oro, on the quay at the water's edge
        {
            const X0 = 563, y0 = qw(563) - 0.5, FACE = ['#ffecb6', '#f8d890', '#ecc378', '#d2a05c', '#aa7a50', '#7e5848'], EDGE = [-1, -0.866, -0.5, 0, 0.5, 0.866, 1];
            // its landing: a spur of the quay
            B.fill([[X0 - 26, y0 - 1], [X0 + 26, y0 - 1.4], [X0 + 22, y0 + 3], [X0 - 22, y0 + 3.2]], '#d9c398', X0);
            B.line([[X0 - 26, y0 - 1], [X0 + 26, y0 - 1.4]], 0.4, ln(0.5), X0);
            // twelve sides: six of them seen, turning from the light into the shade
            const body = (hw, ya, yb) => {
                for (let f = 0; f < 6; f++) {
                    const xa = X0 + EDGE[f] * hw, xb = X0 + EDGE[f + 1] * hw;
                    B.box(xa, ya, xb, yb, B.vgrad(ya, yb, [[0, S.mix(FACE[f], '#6a4a48', 0.3)], [0.4, FACE[f]], [1, tone(FACE[f], 0.06)]]), X0);
                    for (let k = 0; k < 3; k++) {
                        const x = R(xa + 0.3, xb - 0.3), y = R(lerp(ya, yb, 0.3), yb);
                        B.line([[x, y], [x, y - R(3, 9)]], R(0.3, 0.7), rnd() < 0.5 ? 'rgba(120,80,60,0.25)' : 'rgba(255,248,220,0.35)', X0);
                    }
                    if (f > 0) B.line([[xa, ya], [xa, yb]], 0.32, f < 4 ? 'rgba(255,248,220,0.85)' : 'rgba(74,44,54,0.6)', X0);
                }
                B.line([[X0 - hw, yb], [X0 - hw, ya], [X0 + hw, ya], [X0 + hw, yb]], 0.55, ln(0.7), X0);
            };
            const crown = (hw, y, h) => {
                for (let f = 0; f < 6; f++) {
                    const xa = X0 + EDGE[f] * hw, xb = X0 + EDGE[f + 1] * hw, n = Math.max(1, Math.round((xb - xa) / 2.7)), w = (xb - xa) / n;
                    for (let k = 0; k < n; k++) {
                        const a = xa + k * w + w * 0.12, b = a + w * 0.76;
                        B.fill([[a, y], [b, y], [b, y + h * 0.66], [(a + b) / 2, y + h], [a, y + h * 0.66]], S.mix(FACE[f], '#fffdf4', 0.18), X0);
                        B.line([[b, y], [b, y + h * 0.66]], 0.3, 'rgba(74,44,54,0.75)', X0);
                    }
                }
                B.line([[X0 - hw, y - 0.7], [X0 + hw, y - 0.7]], 0.5, 'rgba(74,44,54,0.75)', X0);
                B.line([[X0 - hw, y], [X0 + hw, y]], 0.38, 'rgba(255,250,226,0.9)', X0);
            };
            const hw = 16, y1 = y0 + 50;
            body(hw, y0, y1);
            B.box(X0 - hw - 0.6, y0, X0 + hw + 0.6, y0 + 2.6, 'rgba(110,84,70,0.5)', X0); // its plinth
            B.line([[X0 - hw - 0.6, y0 + 2.6], [X0 + hw + 0.6, y0 + 2.6]], 0.35, 'rgba(255,246,220,0.8)', X0);
            for (let f = 1; f < 5; f++) {
                const xm = X0 + ((EDGE[f] + EDGE[f + 1]) / 2) * hw, fw = (EDGE[f + 1] - EDGE[f]) * hw, big = f === 2 || f === 3;
                B.box(xm - 0.3, y0 + 13, xm + 0.3, y0 + 16.6, '#4a2c3a', X0); // arrow slits
                // a window of two lights with its little balcony
                B.box(xm - fw * 0.3, y0 + 25.4, xm + fw * 0.3, y0 + 31.6, 'rgba(255,250,226,0.5)', X0);
                if (big) {
                    for (const dx of [-0.95, 0.95]) M.win(xm + dx, y0 + 26.4, 1.35, 4, X0, { sill: false, col: '#3c2438' });
                    B.line([[xm - 2.5, y0 + 26], [xm + 2.5, y0 + 26]], 0.5, '#fff6dc', X0);
                    for (let x = xm - 2.2; x <= xm + 2.2; x += 0.9) B.line([[x, y0 + 26], [x, y0 + 27.4]], 0.18, '#3c2438', X0);
                } else M.win(xm, y0 + 26.4, 1.3, 3.8, X0, { col: '#3c2438' });
                // a band course, blind arches under the battlements
                for (let k = 0; k < (big ? 3 : 2); k++) {
                    const ax = xm + (k - (big ? 1 : 0.5)) * fw * 0.3;
                    B.ring([[ax - fw * 0.11, y0 + 39.6], [ax - fw * 0.11, y0 + 44], [ax, y0 + 45.6], [ax + fw * 0.11, y0 + 44], [ax + fw * 0.11, y0 + 39.6]], 0.28, 'rgba(110,70,60,0.75)', X0);
                }
            }
            B.line([[X0 - hw, y0 + 37.6], [X0 + hw, y0 + 37.6]], 0.55, 'rgba(255,250,226,0.9)', X0);
            B.line([[X0 - hw, y0 + 37], [X0 + hw, y0 + 37]], 0.35, 'rgba(110,70,60,0.7)', X0);
            B.line([[X0 - hw, y0 + 47.4], [X0 + hw, y0 + 47.4]], 0.45, 'rgba(255,250,226,0.9)', X0);
            // the door, up a few steps
            B.box(X0 - 6.4, y0, X0 - 1.6, y0 + 7.6, 'rgba(255,250,226,0.5)', X0);
            M.win(X0 - 4, y0, 2.6, 6.4, X0, { sill: false, col: '#35202e' });
            for (let s = 0; s < 3; s++) B.box(X0 - 6.4 - s * 0.9, y0 - 0.5 - s * 0.6, X0 - 1.6 + s * 0.9, y0 + 0.1 - s * 0.6, s % 2 ? '#cdb48a' : '#efdcb0', X0);
            crown(hw + 0.8, y1, 3.6);
            // the second body, twelve-sided too, with glazed tiles in its arches
            const hw2 = 8.2, y2 = y1 + 24;
            body(hw2, y1 + 0.6, y2);
            for (let f = 1; f < 5; f++) {
                const xm = X0 + ((EDGE[f] + EDGE[f + 1]) / 2) * hw2;
                B.ring([[xm - 1.1, y1 + 6], [xm - 1.1, y1 + 14], [xm, y1 + 16], [xm + 1.1, y1 + 14], [xm + 1.1, y1 + 6]], 0.3, 'rgba(110,70,60,0.8)', X0);
                M.win(xm, y1 + 7.4, 1, 3.4, X0, { sill: false, col: '#3c2438' });
                for (const [dx, dy] of [[-0.5, 12.6], [0.5, 12.6], [0, 13.8]]) B.dot(xm + dx, y1 + dy, 0.32, dx ? '#3f8a6a' : '#f4f0e0', X0);
            }
            B.line([[X0 - hw2, y1 + 18.6], [X0 + hw2, y1 + 18.6]], 0.45, 'rgba(255,250,226,0.9)', X0);
            B.line([[X0 - hw2, y1 + 18], [X0 + hw2, y1 + 18]], 0.3, 'rgba(110,70,60,0.7)', X0);
            crown(hw2 + 0.6, y2, 2.8);
            // the lantern and its golden dome
            const hw3 = 3.9, y3 = y2 + 11.5;
            B.box(X0 - hw3, y2 + 0.5, X0 + hw3, y3, B.hgrad(X0 - hw3, X0 + hw3, y2 + 5, [[0, '#fff0be'], [0.35, '#eec67c'], [1, '#8a6248']], X0), X0);
            B.ring([[X0 - hw3, y2 + 0.5], [X0 + hw3, y2 + 0.5], [X0 + hw3, y3], [X0 - hw3, y3]], 0.45, ln(0.7), X0);
            for (const dx of [-2.2, 0, 2.2]) M.win(X0 + dx, y2 + 3, 1, 5, X0, { sill: false, col: '#3c2438' });
            B.box(X0 - hw3 - 0.6, y3 - 0.4, X0 + hw3 + 0.6, y3 + 0.7, '#fff2c8', X0);
            B.line([[X0 - hw3 - 0.6, y3 - 0.5], [X0 + hw3 + 0.6, y3 - 0.5]], 0.35, 'rgba(110,70,60,0.8)', X0);
            const dm = [];
            for (let k = 0; k <= 12; k++) dm.push([X0 + Math.cos((k / 12) * Math.PI) * 4.3, y3 + 0.7 + Math.sin((k / 12) * Math.PI) * 5]);
            B.fill(dm, B.hgrad(X0 - 4.3, X0 + 4.3, y3 + 2, [[0, '#fff4b8'], [0.3, '#f0c04a'], [0.7, '#c8902c'], [1, '#7a4c1c']], X0), X0);
            for (const k of [0.3, 0.5, 0.7]) B.line([[X0 + Math.cos(k * Math.PI) * 4.3, y3 + 0.7 + Math.sin(k * Math.PI) * 1], [X0 + Math.cos(k * Math.PI) * 0.6, y3 + 5.5]], 0.22, 'rgba(120,76,20,0.7)', X0);
            B.line([[X0 - 2.6, y3 + 2.2], [X0 - 1.6, y3 + 4.2]], 0.5, 'rgba(255,252,230,0.9)', X0);
            B.line(dm, 0.42, ln(0.7), X0);
            B.line([[X0, y3 + 5.7], [X0, y3 + 12]], 0.32, '#3a2a3a', X0);
            B.dot(X0, y3 + 7, 0.85, '#f0c04a', X0);
            B.fill([[X0, y3 + 12], [X0 + 3.6, y3 + 11.6], [X0 + 3.4, y3 + 9.6], [X0, y3 + 10]], '#c8322f', X0); // the flag
            B.line([[X0, y3 + 11], [X0 + 3.5, y3 + 10.6]], 0.6, '#f2c230', X0);
            // the tower in the river
            M.reflect(X0, y0 - 1.6, 62, (d) => (d < 46 ? [hw * 0.92, d % 3 < 1.4 ? '#f6dc9c' : '#b88a58'] : d < 56 ? [hw2 * 0.9, '#e2c078'] : [hw3, '#f0c04a']));
            for (let d = 2; d < 40; d += R(2, 4)) B.line([[X0 + 4 + R(-2, 2), y0 - 1.6 - d], [X0 + 13 + R(-2, 2), y0 - 1.6 - d]], R(0.5, 1), 'rgba(124,84,70,0.4)', X0);
        }

        // ---- on the water: a lateen sail, a rowing boat, a barge by the stair
        {
            // the sailing boat
            const X0 = 608, y = 50;
            M.reflect(X0 + 1, y - 0.6, 22, (d) => (d < 4 ? [9, '#1c2c3c'] : [6 - d * 0.16, '#f2ead6']));
            B.fill(S.curve([[X0 - 11, y + 2.6], [X0 - 8, y], [X0 + 7, y - 0.2], [X0 + 12, y + 3.2], [X0 + 6, y + 2.4], [X0 - 6, y + 2.2]], true, 4), '#1f2c3c', X0);
            B.line([[X0 - 10.4, y + 2.4], [X0 - 6, y + 2], [X0 + 6, y + 2.2], [X0 + 11.4, y + 3]], 0.5, '#f4efe4', X0);
            B.line([[X0 - 8.4, y + 0.4], [X0 + 8, y + 0.2]], 0.4, '#c8322f', X0);
            B.line([[X0 + 1, y + 2], [X0 + 1.4, y + 25]], 0.4, '#4a3428', X0);
            const sail = [[X0 - 9, y + 4.5], [X0 + 5.4, y + 28.5], [X0 + 7.6, y + 4]];
            B.fill(sail, B.hgrad(X0 - 9, X0 + 8, y + 12, [[0, '#fffaf0'], [0.6, '#f0e2c4'], [1, '#c8b8a8']], X0), X0);
            for (const k of [0.3, 0.55, 0.78]) B.line([[lerp(sail[0][0], sail[1][0], k), lerp(sail[0][1], sail[1][1], k)], [lerp(sail[2][0], sail[1][0], k * 0.2), lerp(sail[2][1], sail[1][1], k * 0.2) + (k - 0.3) * 4]], 0.22, 'rgba(120,96,90,0.6)', X0);
            B.box(X0 - 1.6, y + 9, X0 + 0.6, y + 11.4, 'rgba(200,170,130,0.9)', X0); // a patch
            B.line(sail.concat([sail[0]]), 0.4, ln(0.7), X0);
            B.line([[X0 - 10.2, y + 3.4], [X0 + 6.4, y + 30]], 0.42, '#4a3428', X0); // the yard
            B.fill([[X0 + 6.4, y + 30], [X0 + 9.8, y + 29.2], [X0 + 6.3, y + 28.4]], '#c8322f', X0);
            M.fig(X0 + 8.2, y + 2.4, 2.6, '#3a5a8c', X0, { hat: '#e9d7a0' });
            for (const rr of [14, 19]) B.line([[X0 - rr, y - 1.4], [X0 - rr * 0.4, y - 2.2], [X0 + rr * 0.5, y - 2.2], [X0 + rr, y - 1.2]], 0.3, 'rgba(232,248,246,0.7)', X0);
        }
        {
            // the rowing boat: two aboard, the oars' rings on the water
            const X0 = 78, y = 56;
            M.reflect(X0, y - 0.4, 6, () => [7, '#3a2a2a']);
            B.fill(S.curve([[X0 - 9, y + 2], [X0 - 6, y], [X0 + 6, y], [X0 + 9.4, y + 2.2], [X0 + 5, y + 1.6], [X0 - 5, y + 1.6]], true, 4), '#7a4a2e', X0);
            B.line([[X0 - 8.6, y + 1.9], [X0 - 5, y + 1.5], [X0 + 5, y + 1.5], [X0 + 9, y + 2.1]], 0.42, '#e8c890', X0);
            B.line([[X0 - 8, y + 0.5], [X0 + 8, y + 0.5]], 0.3, '#3f6fae', X0);
            M.fig(X0 - 2.4, y + 1.2, 2.8, '#f4efe4', X0, { hat: '#e9d7a0' });
            M.fig(X0 + 3.4, y + 1.2, 2.6, '#c8322f', X0);
            for (const sg of [-1, 1]) {
                B.line([[X0 - 2, y + 2.2], [X0 - 2 + sg * 8, y - 1.8]], 0.3, '#e8d8b0', X0);
                for (const rr of [1.4, 2.6]) B.ring(S.ellipse(X0 - 2 + sg * 8.4, y - 2.2, rr, rr * 0.34, 10), 0.24, 'rgba(232,248,246,0.8)', X0);
            }
            B.line([[X0 + 10, y - 0.5], [X0 + 20, y - 1.4]], 0.3, 'rgba(232,248,246,0.7)', X0);
            B.line([[X0 + 11, y + 1.6], [X0 + 24, y + 1.2]], 0.3, 'rgba(232,248,246,0.6)', X0);
        }
        {
            // a barge moored by the stair, loaded with barrels and crates of oranges
            const X0 = 356, y = qw(356) - 4;
            M.reflect(X0, y - 0.4, 6, () => [11, '#2a2430']);
            B.fill([[X0 - 13, y + 2.4], [X0 - 11, y], [X0 + 11, y], [X0 + 13.6, y + 2.6]], '#3a3040', X0);
            B.line([[X0 - 12.6, y + 2.3], [X0 + 13.2, y + 2.5]], 0.45, '#d8a84a', X0);
            for (let k = 0; k < 4; k++) {
                B.fill(S.ellipse(X0 - 8 + k * 3.1, y + 3.9, 1.4, 1.7, 10), '#9a6a40', X0);
                B.line([[X0 - 9.3 + k * 3.1, y + 3.4], [X0 - 6.7 + k * 3.1, y + 3.4]], 0.22, '#3a2a2a', X0);
                B.line([[X0 - 9.3 + k * 3.1, y + 4.5], [X0 - 6.7 + k * 3.1, y + 4.5]], 0.22, '#3a2a2a', X0);
            }
            B.box(X0 + 5, y + 2.5, X0 + 10, y + 4.6, '#c8a060', X0);
            for (let k = 0; k < 5; k++) B.dot(X0 + 5.7 + k * 0.95, y + 4.8, 0.5, '#f0922e', X0);
            B.line([[X0 + 13, y + 2.6], [X0 + 20, qw(376) + 4]], 0.22, '#e8dcc0', X0); // its mooring rope
        }
        {
            // the Sanlúcar steamer coming down from the bridge: a paddle box, a tall funnel, its smoke
            const X0 = 126, y = 78;
            M.reflect(X0, y - 0.4, 9, (d) => [d < 3 ? 12 : 4, d < 3 ? '#20283c' : '#f2ead6']);
            B.fill(S.curve([[X0 - 14, y + 2.6], [X0 - 11.5, y], [X0 + 12, y], [X0 + 15.5, y + 3], [X0 + 10, y + 2.3], [X0 - 9, y + 2.2]], true, 4), '#20283c', X0);
            B.line([[X0 - 13.4, y + 2.4], [X0 - 9, y + 2], [X0 + 10, y + 2.1], [X0 + 15, y + 2.8]], 0.45, '#f4efe4', X0);
            B.line([[X0 - 11, y + 0.5], [X0 + 12.4, y + 0.5]], 0.35, '#c8322f', X0);
            B.box(X0 - 8, y + 2.2, X0 + 7, y + 5, '#f6f0e2', X0);
            for (let k = 0; k < 6; k++) B.box(X0 - 7 + k * 2.4, y + 3, X0 - 5.8 + k * 2.4, y + 4.2, '#3c4a6a', X0);
            B.box(X0 - 8.6, y + 5, X0 + 7.6, y + 5.6, '#d9b48a', X0);
            const pb = S.ellipse(X0 - 0.5, y + 1.6, 4.2, 4.2, 16).filter((p) => p[1] >= y + 1.5);
            B.fill(pb, '#e8dcc8', X0);
            B.line(pb, 0.35, ln(0.7), X0);
            for (let k = 1; k < 6; k++) B.line([[X0 - 0.5, y + 1.7], [X0 - 0.5 + Math.cos((k / 6) * Math.PI) * 3.8, y + 1.7 + Math.sin((k / 6) * Math.PI) * 3.8]], 0.25, '#8a6a4a', X0);
            B.box(X0 + 2.4, y + 5.6, X0 + 4.4, y + 12.4, '#1c1c2c', X0);
            B.box(X0 + 2.4, y + 10, X0 + 4.4, y + 11.2, '#c8322f', X0);
            B.line([[X0 + 2.5, y + 5.8], [X0 + 2.5, y + 12.2]], 0.3, '#6a6a84', X0);
            B.line([[X0 - 6, y + 5.6], [X0 - 6, y + 10.5]], 0.3, '#4a3428', X0);
            B.fill([[X0 - 6, y + 10.5], [X0 - 9.4, y + 10], [X0 - 6, y + 9.2]], '#c8322f', X0);
            for (const [dx, dy, rr, a] of [[3.6, 14.4, 1.7, 0.6], [5.4, 17, 2.4, 0.5], [8.6, 19.4, 3.1, 0.4], [13, 21.4, 3.8, 0.3], [18.6, 22.6, 4.4, 0.2]]) {
                B.dot(X0 + dx, y + dy, rr, `rgba(92,92,116,${a})`, X0);
                B.dot(X0 + dx - 0.5, y + dy + 0.6, rr * 0.6, `rgba(238,236,240,${a * 0.8})`, X0);
            }
            M.fig(X0 - 3.4, y + 5.6, 2.3, '#2c3050', X0);
            M.fig(X0 + 10, y + 2.4, 2.3, '#f4efe4', X0, { hat: '#e9d7a0' });
            for (const rr of [17, 22, 28]) B.line([[X0 - rr, y - 1.2], [X0 - rr * 0.5, y - 2.2 - rr * 0.03], [X0 + rr * 0.3, y - 2.4 - rr * 0.03]], 0.3, 'rgba(232,248,246,0.7)', X0);
        }
        // the morning's glitter on the water under the sun's side
        for (let k = 0; k < 90; k++) {
            const X = R(40, 300), Y = R(28, 92);
            B.line([[X, Y], [X + R(1.5, 5), Y]], R(0.4, 0.8), `rgba(255,252,236,${R(0.4, 0.9).toFixed(2)})`);
        }
        brushwork(g, B, W, 'sevilla');
        signature(B, 612, 31.5, 'rgba(16,40,72,0.9)', 'sevilla');
    }

    // ------------------------------------------------------------------ the border
    // Gold filigree on the leaf's green: along the inner edge a rope twist, a string of
    // pearls and a running scroll; along the outer one pearls, a rinceau and a rope; and a
    // lettered cartouche.
    function borders(g, B, G, Xa, Xb) {
        const W = G.W, rnd = Motion.rng('border/' + G.seed), YA = 26, YB = 272;
        const xr = (Y) => RM / (R0 + Y); // band units per unit of true length at height Y
        // the green ground: deeper at the leaf's edges, a breath of light by the picture
        B.box(-9, -6, W + 9, YA, B.vgrad(-2, YA, [[0, 'rgba(4,30,28,0.6)'], [0.55, 'rgba(4,30,28,0)'], [1, 'rgba(130,206,150,0.2)']]));
        B.box(-9, YB, W + 9, HB + 6, B.vgrad(YB, HB + 2, [[0, 'rgba(130,206,150,0.22)'], [0.45, 'rgba(4,30,28,0)'], [1, 'rgba(4,30,28,0.55)']]));
        for (let k = 0; k < 260; k++) {
            const top = rnd() < 0.56, X = rnd() * W, Y = top ? YB + 1 + rnd() * (HB - YB - 2) : 1 + rnd() * (YA - 2);
            B.dot(X, Y, 0.3 + rnd() * 0.3, `rgba(246,220,138,${0.25 + rnd() * 0.4})`);
        }
        const hline = (Y, w, xa = -6, xb = W + 6) => gilt(g, B.map([[xa, Y], [xb, Y]], undefined, false), w);
        // a rope twist: leaning strands, light and dark by turns
        const rope = (Ya, Yb) => {
            B.box(-8, Ya - 0.5, W + 8, Yb + 0.5, 'rgba(52,30,8,0.82)');
            const stp = 2.5 * xr(Ya), lean = 1.3 * xr(Ya);
            for (let X = -8, k = 0; X < W + 8; X += stp, k++) B.fill([[X, Ya], [X + stp * 0.7, Ya], [X + stp * 0.7 + lean, Yb], [X + lean, Yb]], k % 2 ? COL.gold : S.mix(COL.goldLight, COL.gold, 0.3 + 0.5 * rnd()));
        };
        const pearls = (Y, r, gap) => {
            const stp = gap * xr(Y);
            for (let X = -4 + rnd() * 2, k = 0; X < W + 6; X += stp, k++) {
                const p = B.P(X, Y);
                if (k % 7 === 3) bead(g, p, r * 1.2, RUBY, 0.45);
                else bead(g, p, r * (0.9 + rnd() * 0.2), PEARL, 0.45);
            }
        };
        // ---- inner border
        hline(2.4, 0.9);
        rope(5.2, 8.6);
        pearls(13.2, 1.5, 4.6);
        {
            // a running scroll: every wave rises into a curl with a bud at its tip
            const L = 12.5 * xr(20), unit = [[0, -0.75], [0.22, -0.9], [0.5, -0.6], [0.74, 0.1], [0.66, 0.7], [0.42, 0.72], [0.34, 0.3], [0.48, 0.06], [0.58, 0.28]];
            for (let X = -4; X < W + 4; X += L) {
                const sc = 0.9 + rnd() * 0.2, pts = S.curve(unit.map(([u, v]) => [X + u * L, 20.2 + v * 3.3 * sc]), false, 5);
                gilt(g, B.map(pts, undefined, false, 2), 0.95);
                bead(g, B.P(X + 0.94 * L, 17.7), 0.8, GOLDB, 0.35);
            }
        }
        // ---- outer border
        pearls(277, 1.55, 4.9);
        rope(299, 302.4);
        hline(304.6, 0.8);
        // the cartouche's place, in true units either side of its middle
        const uc = G.o.label ?? (G.scene === 'sevilla' ? 0.73 : 0.27), Xc = uc * W, cw = 82;
        {
            // the rinceau: a stem that waves along the border, a volute in every hollow with
            // a pearl at its heart, a leaf on every crest
            const lam = 27 * xr(289), ym = 288.6, am = 4.3;
            const stem = [];
            for (let X = -8; X <= W + 8; X += 1.2) stem.push([X, ym + am * Math.sin((X / lam) * TAU)]);
            const clear = (X) => Math.abs(X - Xc) / xr(289) > cw + 15;
            let run = [];
            const flush = () => {
                if (run.length > 2) gilt(g, B.map(run, undefined, false, 3), 1.25);
                run = [];
            };
            for (const p of stem) {
                if (clear(p[0])) run.push(p);
                else flush();
            }
            flush();
            for (let k = 0; ; k++) {
                const X = -8 + lam / 4 + (k * lam) / 2;
                if (X > W + 8) break;
                if (!clear(X)) continue;
                const sgn = k % 2 === 0 ? 1 : -1, sp = [], turns = 1.35 + rnd() * 0.3;
                // the volute springs from the stem before the crest and winds into the hollow
                for (let s = 0; s <= 1.001; s += 0.05) {
                    const th = s * turns * TAU, rr = 4.4 * (1 - s * 0.82);
                    sp.push([X + (-Math.sin(th) * rr - 1.5 * (1 - s)) * xr(289), ym - sgn * (0.6 + rr * Math.cos(th) * 0.92 - 0.4)]);
                }
                gilt(g, B.map(sp, X, false, 9), 0.9);
                bead(g, B.P(X, ym - sgn * 0.3, X), 0.95, k % 4 === 1 ? RUBY : PEARL, 0.35);
                const lf = [[0, 0], [1.6, 1.3], [4.4, 0.4], [1.8, -1.1]].map(([u, v]) => [X + (u - 1) * xr(289) * 1.2, ym + sgn * (am + 1.2 + v * 1.3 + u * 0.35)]);
                giltFill(g, B.map(S.curve(lf, true, 4), X));
            }
        }
        // ---- the picture's frame and the side borders
        const win = [[Xa + 4, YA], [Xb - 4, YA], [Xb, YA + 4], [Xb, YB - 4], [Xb - 4, YB], [Xa + 4, YB], [Xa, YB - 4], [Xa, YA + 4]];
        const frame = B.map(win);
        strokeP(g, frame, 2.6, 'rgba(26,18,40,0.8)', true);
        gilt(g, frame, 1.35, true);
        for (const [X, s] of [[Xa - 3.6, -1], [Xb + 3.6, 1]]) {
            for (let Y = YA + 6; Y < YB - 3; Y += 5.6) bead(g, B.P(X, Y), 1.15 + rnd() * 0.2, Math.round(Y / 5.6) % 6 === 2 ? RUBY : PEARL, 0.4);
            gilt(g, B.map([[X + s * 3, YA - 2], [X + s * 3, YB + 2]], undefined, false), 0.7);
        }
        for (const [X, Y] of [[Xa, YA], [Xb, YA], [Xa, YB], [Xb, YB]]) bead(g, B.P(X + (X === Xa ? 1 : -1), Y + (Y === YA ? 1 : -1)), 1.9, GOLDB, 0.5);

        // ---- the cartouche: a cream plaque in a gold rim with scrolled ends, a crest and
        // a pendant, lettered on the arc
        const y0 = 270, y1 = 292, ym = (y0 + y1) / 2;
        const half = [[0, y1 + 3.4], [26, y1 + 0.9], [cw - 7, y1], [cw - 1, y1 - 2.5], [cw + 6.5, ym], [cw - 1, y0 + 2.5], [cw - 7, y0], [24, y0 - 0.8], [0, y0 - 3.2]];
        const plaque = B.map(S.curve([...half, ...half.slice(1, -1).reverse().map(([u, v]) => [-u, v])].map(([u, v]) => [Xc + u, v]), true, 5), Xc, true, 3);
        S.piece(g, plaque, {
            fill: '#f3e7c6', line: 0, cast: { blur: 4, dx: 1.6, dy: 2.6, color: 'rgba(8,24,30,0.6)' },
            shade: { color: '#b08a4e', alpha: 0.6, w: 5 }, light: { color: '#fffdf0', alpha: 0.7, w: 2.5 },
            detail: (q) => {
                // parchment: a few fibres and foxing, a ruled line inside the rim
                for (let k = 0; k < 26; k++) {
                    const p = B.P(Xc + (rnd() - 0.5) * 2 * cw, y0 + 2 + rnd() * (y1 - y0 - 4), Xc);
                    disc(q, p, 0.3 + rnd() * 0.5, `rgba(150,104,52,${0.12 + rnd() * 0.22})`);
                }
                strokeP(q, B.map([[Xc - cw + 8, y0 + 2.6], [Xc + cw - 8, y0 + 2.6]], Xc, false, 3), 0.4, 'rgba(138,90,23,0.75)');
                strokeP(q, B.map([[Xc - cw + 8, y1 - 2.6], [Xc + cw - 8, y1 - 2.6]], Xc, false, 3), 0.4, 'rgba(138,90,23,0.75)');
            },
        });
        strokeP(g, plaque, 3, 'rgba(26,18,40,0.85)', true);
        gilt(g, plaque, 1.9, true);
        // scrolled ends, crest, pendant
        for (const sgn of [1, -1]) {
            for (const up of [1, -1]) {
                const sp = [];
                for (let s = 0; s <= 1.001; s += 0.06) {
                    const th = s * 1.3 * TAU, rr = 4.6 * (1 - s * 0.8);
                    sp.push([Xc + sgn * (cw + 7.5 + Math.sin(th) * rr), ym + up * (5 + 4.6 - Math.cos(th) * rr)]);
                }
                gilt(g, B.map(sp, Xc, false, 9), 1.05);
            }
            bead(g, B.P(Xc + sgn * (cw + 14.5), ym, Xc), 1.5, PEARL, 0.45);
            bead(g, B.P(Xc + sgn * (cw + 7.5), ym, Xc), 1.1, RUBY, 0.4);
        }
        for (let k = -2; k <= 2; k++) {
            const th = k * 0.44, len = 6.6 - Math.abs(k) * 1.1, b = [Xc + Math.sin(th) * 1.4, y1 + 3.4], t = [Xc + Math.sin(th) * len, y1 + 3.4 + Math.cos(th) * len];
            const nx = Math.cos(th) * 1.25, ny = -Math.sin(th) * 1.25, m = [lerp(b[0], t[0], 0.55), lerp(b[1], t[1], 0.55)];
            giltFill(g, B.map(S.curve([b, [m[0] + nx, m[1] + ny], t, [m[0] - nx, m[1] - ny]], true, 4), Xc));
        }
        bead(g, B.P(Xc, y1 + 3.2, Xc), 1.5, RUBY, 0.45);
        giltFill(g, B.map(S.curve([[Xc, y0 - 2.6], [Xc + 2.3, y0 - 5.4], [Xc, y0 - 9.4], [Xc - 2.3, y0 - 5.4]], true, 4), Xc));
        bead(g, B.P(Xc, y0 - 11.6, Xc), 1.5, PEARL, 0.45);
        // the lettering, fitted to the plaque
        const text = G.o.text ?? (G.scene === 'sevilla' ? 'Recuerdo de Sevilla' : 'Recuerdo de Granada');
        const room = (cw - 9) * 2, sp = 0.9;
        g.save();
        g.font = '10px "IM Fell DW Pica SC", serif';
        const w10 = [...text].reduce((a, ch) => a + g.measureText(ch).width, 0);
        g.restore();
        const fs = Math.min(15.5, (10 * (room - sp * text.length)) / Math.max(1, w10));
        const base = [];
        for (let k = 0; k <= 40; k++) base.push(B.P(Xc - cw + (k / 40) * cw * 2, ym - fs * 0.33, Xc));
        S.textOn(g, text, base, {
            font: `${fs.toFixed(2)}px "IM Fell DW Pica SC", serif`, spacing: sp,
            glyph: (q, ch) => {
                q.fillStyle = 'rgba(184,50,47,0.9)';
                q.fillText(ch, 0.55, 0.5);
                q.fillStyle = '#1d2247';
                q.fillText(ch, 0, 0);
            },
        });
    }

    // ------------------------------------------------------------------ the folds
    // which way face j looks, against the light: > 0 in the light, < 0 in shade. Crests are
    // on the even fold lines (over the sticks), valleys on the odd ones.
    const faceLit = (G, j) => {
        const am = (G.fold[j] + G.fold[j + 1]) / 2;
        return (j % 2 === 0 ? 1 : -1) * G.dir * (-Math.sin(am) * TOL[0] + Math.cos(am) * TOL[1]);
    };
    // The folds carry the painting: every face has its own light, uneven as paint is; every
    // valley a line of ink; every crest a thin line of light and the wear of a thousand
    // foldings, down to the silk.
    function pleats(g, G) {
        const { fold, n } = G, N = 2 * n, rnd = Motion.rng('pleats/' + G.seed);
        for (let j = 0; j < N; j++) {
            const a = fold[j], b = fold[j + 1], crest = j % 2 === 0 ? a : b, valley = j % 2 === 0 ? b : a, lit = faceLit(G, j);
            const face = [pol(R0 - 3, a), pol(R1 + 3, a), pol(R1 + 3, b), pol(R0 - 3, b)];
            const dk = 0.2 + 0.3 * Math.max(0, -lit) + 0.1 * rnd(), lt = 0.05 + 0.22 * Math.max(0, lit) + 0.04 * rnd(), sh = Math.max(0, -lit) * (0.2 + 0.08 * rnd());
            fillP(g, face, wedgeGrad(g, valley, crest, [[0, `rgba(8,12,42,${(dk + 0.2).toFixed(3)})`], [0.16, `rgba(8,12,42,${(dk * 0.8).toFixed(3)})`], [0.5, `rgba(8,12,42,${(sh + dk * 0.12).toFixed(3)})`], [0.74, `rgba(60,50,80,${(sh * 0.5).toFixed(3)})`], [0.86, `rgba(255,246,222,${(lt * 0.5).toFixed(3)})`], [1, `rgba(255,246,222,${lt.toFixed(3)})`]]));
            // the brush went along the folds: streaks of a little more or less light
            for (let s = 0; s < 8; s++) {
                const as = lerp(a, b, 0.12 + rnd() * 0.76), ra = R0 + rnd() * 150, rb = Math.min(R1, ra + 40 + rnd() * 200);
                strokeP(g, [pol(ra, as), pol(rb, as)], 0.7 + rnd() * 2.4, rnd() < 0.5 ? `rgba(10,14,46,${0.03 + rnd() * 0.06})` : `rgba(255,248,226,${0.03 + rnd() * 0.06})`);
            }
        }
        for (let j = 0; j <= N; j++) {
            const a = fold[j];
            if (j % 2 === 1) {
                S.ink(g, [pol(R0 - 1, a), pol(RM, a + (rnd() - 0.5) * 0.002), pol(R1 + 1, a)], { w: 1.1 + rnd() * 0.9, color: '#12142f', taper: [0.3, 0.2], alpha: 0.82 });
                continue;
            }
            // the crest: a dark hair on its far side, the line of light broken into dashes
            strokeP(g, [pol(R0, a + (0.9 / RM) * (faceLit(G, Math.min(N - 1, j)) > 0 ? -1 : 1) * G.dir), pol(R1, a + (0.9 / RM) * (faceLit(G, Math.min(N - 1, j)) > 0 ? -1 : 1) * G.dir)], 0.5, 'rgba(14,16,48,0.3)');
            let rr = R0 + 2 + rnd() * 8;
            while (rr < R1 - 4) {
                const len = 8 + rnd() * 52;
                strokeP(g, [pol(rr, a), pol(Math.min(R1 - 2, rr + len), a)], 0.4 + rnd() * 0.55, `rgba(255,249,230,${(0.22 + rnd() * 0.5).toFixed(3)})`, false, 'butt');
                rr += len + rnd() * rnd() * 22;
            }
            // wear: the paint rubbed off the crest in specks, thickest where the fan is
            // handled when it shuts (the outer third), and hair cracks across the fold
            const m = 30 + Math.floor(rnd() * 26);
            for (let q = 0; q < m; q++) {
                const rho = R0 + 5 + Math.pow(rnd(), 0.62) * (HB - 9), off = (rnd() - 0.5) * 3 * rnd(), p = pol(rho, a + off / rho);
                g.fillStyle = rnd() < 0.8 ? `rgba(240,229,200,${(0.35 + rnd() * 0.5).toFixed(3)})` : `rgba(30,24,50,${(0.3 + rnd() * 0.3).toFixed(3)})`;
                g.beginPath();
                g.ellipse(p[0], p[1], 0.4 + rnd() * 1.3, 0.22 + rnd() * 0.42, a, 0, TAU);
                g.fill();
            }
            for (let q = 0; q < 7; q++) {
                const rho = R0 + 8 + rnd() * (HB - 16), len = 1.2 + rnd() * 2.6;
                strokeP(g, [pol(rho, a - len / rho), pol(rho + (rnd() - 0.5) * 1.4, a + len / rho)], 0.3, `rgba(24,20,48,${(0.3 + rnd() * 0.3).toFixed(3)})`);
            }
        }
    }

    // ------------------------------------------------------------------ the leaf
    function leaf(g, G) {
        const { fold, n, amin, dir, W } = G, N = 2 * n, rnd = Motion.rng('leaf/' + G.seed);
        // folded silk: its edges run straight from fold to fold, and not quite evenly
        const outer = fold.map((a) => pol(R1 + (rnd() - 0.5) * 0.9, a)), inner = fold.map((a) => pol(R0 + (rnd() - 0.5) * 0.9, a));
        const poly = [...outer, ...inner.slice().reverse()];
        S.cast(g, (q) => fillP(q, poly, '#000'), { blur: 8, dx: 3, dy: 5, color: 'rgba(20,12,34,0.62)' });
        g.save();
        g.translate(SD[0] * 1.3, SD[1] * 1.3);
        fillP(g, poly, INK);
        strokeP(g, poly, 2, INK, true);
        g.restore();
        fillP(g, poly, COL.leaf);
        g.save();
        g.beginPath();
        S.trace(g, poly);
        g.clip();
        const B = band(g, amin), face = RM * Math.abs(G.half);
        // the front guard lies over the fold next to a1: the picture stops short of it
        const Xa = dir > 0 ? 7 : face + 6, Xb = dir > 0 ? W - face - 6 : W - 7, YA = 26, YB = 272;
        B.clip([[Xa + 4, YA], [Xb - 4, YA], [Xb, YA + 4], [Xb, YB - 4], [Xb - 4, YB], [Xa + 4, YB], [Xa, YB - 4], [Xa, YA + 4]], undefined, () => (G.scene === 'sevilla' ? sevilla : granada)(g, B, W, G));
        borders(g, B, G, Xa, Xb);
        pleats(g, G);
        g.restore();
        strokeP(g, poly, 1.8, INK, true);
        // the silk's cut edge at the two ends: a thread of the weave left pale
        for (const j of [0, N]) strokeP(g, [pol(R0 + 3, fold[j] + (j ? -1 : 1) * G.dir * 0.0032), pol(R1 - 3, fold[j] + (j ? -1 : 1) * G.dir * 0.0032)], 0.5, 'rgba(240,229,200,0.5)');
    }

    // ------------------------------------------------------------------ the lace
    // Blonda: a tulle net (the ground shows through: nothing is painted between the
    // threads), flowers worked dense in thicker thread, a scalloped edge with picots.
    // Pleated with the leaf, one scallop to a face.
    function lace(g, G) {
        const { fold, n } = G, N = 2 * n, rnd = Motion.rng('lace/' + G.seed);
        const torn = [3 + Math.floor(rnd() * (N - 8)), 12 + Math.floor(rnd() * (N - 14))];
        const loose = [2 + Math.floor(rnd() * 6), 11 + Math.floor(rnd() * 6), 19 + Math.floor(rnd() * 7)];
        for (let j = 0; j < N; j++) {
            const a = fold[j], b = fold[j + 1], am = (a + b) / 2, da = (b - a) / 2, lit = faceLit(G, j);
            const shade = S.clamp(0.1 + 0.44 * Math.max(0, -lit) - 0.06 * Math.max(0, lit) + rnd() * 0.08, 0, 0.62);
            const thread = S.mix(COL.lace, COL.laceShade, shade), bright = S.mix('#fffdf6', COL.laceShade, shade * 0.7), dim = S.mix(COL.lace, '#5f5d8c', 0.25 + shade * 0.7);
            const half = Math.abs(da) * (R1 + 22); // half the face's width, in units
            const Hs = 39 + rnd() * 6.5, hb = 26.5 + rnd() * 3.5;
            // (xt, h): true units across the face from its middle, and out from the leaf's edge
            const L = (xt, h) => pol(R1 + h, am + (Math.sign(da) * xt) / (R1 + h));
            const edgeH = (xt) => hb + (Hs - hb) * Math.pow(Math.max(0, Math.cos(((xt / half) * Math.PI) / 2)), 0.72);
            const kind = (j + (G.dir > 0 ? 0 : 2)) % 4, mir = rnd() < 0.5 ? 1 : -1;
            // what the net leaves open: eyes, the heart of the flower, a torn place
            const holes = [];
            const cy = 7 + (Hs - 7) * 0.5;
            if (kind === 0) holes.push([0, cy, 1.9]);
            holes.push([mir * half * (0.5 + rnd() * 0.12), hb * (0.7 + rnd() * 0.2), 2 + rnd() * 0.7]);
            if (rnd() < 0.6) holes.push([-mir * half * (0.56 + rnd() * 0.1), hb * (0.42 + rnd() * 0.2), 1.7 + rnd() * 0.5]);
            const isTorn = torn.includes(j);
            if (isTorn) holes.push([-mir * half * 0.3, cy + 6, 4.2 + rnd() * 1.4, true]);
            const open = (xt, h) => {
                for (const [hx, hy, hr] of holes) if ((xt - hx) * (xt - hx) + (h - hy) * (h - hy) < hr * hr) return true;
                return false;
            };
            // the ink under the edge: the fan's outline against the night
            const edge = [];
            for (let k = 0; k <= 18; k++) {
                const xt = (k / 18 - 0.5) * 2 * half;
                edge.push(L(xt, edgeH(xt)));
            }
            strokeP(g, shift(edge, SD, 0.5), 3.1, INK);
            strokeP(g, edge, 2.9, INK);
            // the net: two families of threads crossing in lozenges
            g.beginPath();
            const pitch = 3.1, slope = 1.55;
            for (const sgn of [1, -1]) {
                for (let c = -half * slope - 4 + (rnd() * 0.6); c < Hs + half * slope; c += pitch) {
                    let pen = false;
                    for (let h = 5.6; h <= Hs; h += 0.8) {
                        const xt = (sgn * (h - c)) / slope;
                        const on = Math.abs(xt) <= half && h <= edgeH(xt) - 0.6 && !open(xt, h);
                        if (on) {
                            const p = L(xt + S.noise2(xt * 0.45 + j * 7.3, h * 0.45, 5) * 0.34, h + S.noise2(xt * 0.45 - 3.1, h * 0.45 + j * 5.7, 6) * 0.3);
                            if (pen) g.lineTo(p[0], p[1]);
                            else g.moveTo(p[0], p[1]);
                        }
                        pen = on;
                    }
                }
            }
            g.lineWidth = 0.58;
            g.lineCap = 'butt';
            g.strokeStyle = S.rgba(thread, 0.86);
            g.stroke();
            // the header: two bands of close weaving with a row of eyelets between them
            for (const [h, w] of [[1.1, 1.5], [4.6, 1.3]]) strokeP(g, [L(-half, h), L(0, h), L(half, h)], w, thread, false, 'butt');
            for (let xt = -half + 1.2; xt < half; xt += 2.5) strokeP(g, [L(xt, 1.6), L(xt, 4.2)], 0.7, thread, false, 'butt');
            strokeP(g, [L(-half, 5.4), L(0, 5.4), L(half, 5.4)], 0.35, dim, false, 'butt');
            // dense work: filled with thread, hatched, corded round
            const dense = (pts, o = {}) => {
                fillP(g, shift(pts, SD, 0.45), S.rgba(dim, 0.9));
                fillP(g, pts, thread);
                g.save();
                g.beginPath();
                S.trace(g, pts);
                g.clip();
                const bb = S.bbox(pts);
                g.beginPath();
                for (let t = bb.x - bb.h; t < bb.x + bb.w; t += 1.05) {
                    g.moveTo(t, bb.y);
                    g.lineTo(t + bb.h * (o.lean ?? 0.7), bb.y + bb.h);
                }
                g.lineWidth = 0.32;
                g.strokeStyle = S.rgba(dim, 0.7);
                g.stroke();
                g.restore();
                strokeP(g, pts, 0.62, bright, true);
            };
            const lens = (p0, p1, w) => {
                const m = [lerp(p0[0], p1[0], 0.5), lerp(p0[1], p1[1], 0.5)], dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy) || 1;
                return S.curve([p0, [m[0] - (dy / l) * w, m[1] + (dx / l) * w], p1, [m[0] + (dy / l) * w, m[1] - (dx / l) * w]], true, 4);
            };
            const eye = (xt, h, r) => {
                strokeP(g, S.ellipse(...L(xt, h), r, r, 12), 0.8, bright, true);
                strokeP(g, S.ellipse(...L(xt, h), r + 0.55, r + 0.55, 12), 0.3, S.rgba(dim, 0.8), true);
            };
            const sz = 0.9 + rnd() * 0.2;
            strokeP(g, [L(0, 5.4), L(mir * 0.6, cy - 5)], 0.75, bright);
            if (kind === 0) {
                // a rose: six petals round an open heart, two leaves under it
                for (let p = 0; p < 6; p++) {
                    const th = (p / 6) * TAU + 0.3 * mir, c = L(Math.cos(th) * 4.7 * sz, cy + Math.sin(th) * 4.7 * sz);
                    dense(S.ellipse(c[0], c[1], 3.3 * sz, 2.2 * sz, 12, th + am + Math.PI / 2), { lean: p % 2 ? 0.7 : -0.7 });
                }
                eye(0, cy, 1.9);
                disc(g, L(0, cy), 0.6, bright);
                for (const sgn of [1, -1]) {
                    const lf = lens(L(sgn * 1.2, 8.5), L(sgn * half * 0.62, 15.5 + rnd() * 2), 1.9);
                    dense(lf);
                    strokeP(g, [L(sgn * 1.2, 8.5), L(sgn * half * 0.6, 15.6)], 0.3, dim);
                }
            } else if (kind === 2) {
                // a palmette: five drops fanned from the header
                for (let p = -2; p <= 2; p++) {
                    const th = p * 0.5, len = (17 - Math.abs(p) * 3.4) * sz + (Hs - 40) * 0.5;
                    dense(lens(L(Math.sin(th) * 3, 8 + Math.cos(th) * 2), L(Math.sin(th) * len * 0.82, 8 + Math.cos(th) * len), 1.7 + (2 - Math.abs(p)) * 0.3), { lean: p >= 0 ? 0.7 : -0.7 });
                }
                dense(S.ellipse(...L(0, 8.4), 2.6, 2.1, 12, am));
            } else {
                // a sprig: a bending stem, leaves by turns, a bud of three petals at its tip
                const st = S.curve([[-mir * 4.5, 6], [mir * 1.5, cy - 6], [-mir * 1.2, cy + 1], [mir * 2.6, Hs - 11]], false, 6);
                strokeP(g, st.map(([xt, h]) => L(xt, h)), 0.9, bright);
                for (const [t, sgn] of [[0.2, 1], [0.42, -1], [0.62, 1], [0.8, -1]]) {
                    const p = st[Math.floor(t * (st.length - 1))], len = (6.5 - t * 2.5) * sz;
                    dense(lens(L(p[0], p[1]), L(p[0] + sgn * mir * len, p[1] + len * 0.75), 1.5), { lean: sgn * 0.7 });
                }
                const tip = st[st.length - 1];
                for (const th of [-0.75, 0, 0.75]) dense(lens(L(tip[0], tip[1]), L(tip[0] + Math.sin(th + mir * 0.2) * 5.6 * sz, tip[1] + Math.cos(th) * 5.6 * sz), 1.5));
            }
            for (const [hx, hy, hr, tear_] of holes.slice(kind === 0 ? 1 : 0)) {
                if (!tear_) eye(hx, hy, hr);
                else {
                    // torn: the net's threads hang broken into the hole
                    for (let k = 0; k < 5; k++) {
                        const th = rnd() * TAU, c = [hx + Math.cos(th) * hr, hy + Math.sin(th) * hr], len = 1.4 + rnd() * 2.6;
                        strokeP(g, [L(c[0], c[1]), L(c[0] - Math.cos(th) * len + (rnd() - 0.5) * 2, c[1] - Math.sin(th) * len - 0.8)], 0.45, thread);
                    }
                }
            }
            // the edge: a cord, a ladder inside it, picots outside
            const inner = [];
            for (let k = 0; k <= 18; k++) {
                const xt = (k / 18 - 0.5) * 2 * half * 0.93;
                inner.push(L(xt, edgeH(xt / 0.93) - 2.7));
            }
            strokeP(g, inner, 0.55, thread);
            for (let k = 1; k < 18; k++) {
                const xt = (k / 18 - 0.5) * 2 * half;
                strokeP(g, [L(xt * 0.93, edgeH(xt) - 2.7), L(xt, edgeH(xt))], 0.5, thread, false, 'butt');
            }
            strokeP(g, edge, 1.7, bright);
            strokeP(g, shift(edge, SD, 0.4), 0.45, S.rgba(dim, 0.8));
            for (let k = 1; k < 9; k++) {
                if (isTorn && k === 5) continue; // a picot lost
                const xt = (k / 9 - 0.5) * 2 * half, p = L(xt, edgeH(xt) + 1.6);
                disc(g, [p[0] + SD[0] * 0.4, p[1] + SD[1] * 0.4], 1.55, INK);
                disc(g, p, 1.05, bright);
                disc(g, p, 0.36, S.rgba(INK, 0.75));
            }
            if (loose.includes(j)) {
                // a thread come loose from the edge: it hangs the way things hang
                const xt = (rnd() - 0.5) * half, p = L(xt, edgeH(xt)), len = 9 + rnd() * 12, sway = (rnd() - 0.5) * 9;
                const th = S.curve([p, [p[0] + sway * 0.7, p[1] + len * 0.3], [p[0] + sway, p[1] + len * 0.7], [p[0] + sway * 0.5, p[1] + len]], false, 6);
                strokeP(g, shift(th, SD, 0.4), 0.9, S.rgba(INK, 0.6));
                strokeP(g, th, 0.6, bright);
            }
        }
    }

    // ------------------------------------------------------------------ rivet, cord, tassel
    // a cord of two silk strands twisted together: every turn is its own little piece,
    // lit across the cord as a cylinder and shaded where it dives under the next
    function cord(g, path, w) {
        const line = S.curve(path, false, 10), h = w / 2, st = [];
        // walked in even steps
        let acc = 0, next = 0;
        for (let i = 1; i < line.length; i++) {
            const a = line[i - 1], b = line[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
            if (d < 1e-6) continue;
            while (next <= acc + d) {
                const u = (next - acc) / d;
                st.push({ p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], t: [(b[0] - a[0]) / d, (b[1] - a[1]) / d] });
                next += 0.5;
            }
            acc += d;
        }
        if (st.length < 4) return;
        const total = (st.length - 1) * 0.5, at = (s) => st[Math.max(0, Math.min(st.length - 1, Math.round(s / 0.5)))];
        const edge = (s, side, b) => {
            const q = at(s);
            return [q.p[0] - q.t[1] * side * b, q.p[1] + q.t[0] * side * b];
        };
        strokeP(g, shift(line, SD, 0.8), w + 2.2, INK);
        strokeP(g, line, w + 2, INK);
        strokeP(g, line, w, COL.tasselDeep);
        const n = Math.max(2, Math.round(total / (w * 0.8))), pp = total / n, sl = w * 0.46;
        for (let i = 0; i < n; i++) {
            const s0 = i * pp, poly = [];
            for (let k = 0; k <= 4; k++) poly.push(edge(Math.min(total, s0 + sl + (pp * k) / 4), 1, h + 0.1 * w * Math.sin((Math.PI * k) / 4)));
            for (let k = 4; k >= 0; k--) poly.push(edge(Math.max(0, s0 - sl + (pp * k) / 4), -1, h + 0.1 * w * Math.sin((Math.PI * k) / 4)));
            const m = at(s0 + pp / 2), nx = -m.t[1], ny = m.t[0], lit = nx * TOL[0] + ny * TOL[1], kk = Math.abs(lit);
            const gr = g.createLinearGradient(m.p[0] + nx * h, m.p[1] + ny * h, m.p[0] - nx * h, m.p[1] - ny * h);
            const stops = [[0, S.mix(COL.tassel, COL.tasselLight, 0.1 + 0.25 * kk)], [0.26, S.mix('#e0534a', COL.tasselLight, 0.25 + 0.6 * kk)], [0.58, COL.tassel], [1, S.mix(COL.tassel, COL.tasselDeep, 0.6 + 0.35 * kk)]];
            for (const [u, c] of stops) gr.addColorStop(lit >= 0 ? u : 1 - u, c);
            g.save();
            g.beginPath();
            S.trace(g, poly);
            g.fillStyle = gr;
            g.fill();
            g.clip();
            // the shade where this turn comes out from under the one before, a glint on its crown
            strokeP(g, [edge(Math.min(total, s0 + sl), 1, h * 1.3), edge(Math.max(0, s0 - sl), -1, h * 1.3)], pp * 0.6, S.rgba(COL.tasselInk, 0.5), false, 'butt');
            const m0 = edge(Math.min(total, s0 + pp * 0.56 + sl), 1, h), m1 = edge(Math.max(0, s0 + pp * 0.56 - sl), -1, h), [ga, gb] = lit >= 0 ? [0.16, 0.44] : [0.56, 0.84];
            strokeP(g, [[lerp(m0[0], m1[0], ga), lerp(m0[1], m1[1], ga)], [lerp(m0[0], m1[0], gb), lerp(m0[1], m1[1], gb)]], w * 0.15, S.rgba('#ffd9cc', 0.25 + 0.5 * kk));
            g.restore();
        }
        for (let i = 1; i < n; i++) strokeP(g, [edge(Math.min(total, i * pp + sl), 1, h), edge(Math.max(0, i * pp - sl), -1, h)], Math.max(0.45, w * 0.11), S.rgba(COL.tasselInk, 0.9));
    }
    // The tassel hangs along +y from (x, y): head, bound neck, ruff, skirt.
    function tassel(g, x, y, seed) {
        const r = Motion.rng('tassel/' + seed), C = { base: COL.tassel, deep: COL.tasselDeep, light: COL.tasselLight, ink: COL.tasselInk, mid: '#e0534a' };
        const at = (u, v) => [x + u, y + v];
        const yn = 19, L = 84, W = 25;
        // the skirt: a round bundle of threads, cut not quite even
        const side = (sx) => S.curve([[sx * 4.6, yn], [sx * W * 0.34, yn + 14], [sx * W * 0.45, yn + 38], [sx * W * 0.5, L]], false, 6);
        const bottom = [];
        for (let k = 1; k < 22; k++) bottom.push([W * 0.5 * (1 - (2 * (k + (r() - 0.5) * 0.6)) / 22), L + (r() - 0.3) * 5]);
        const skirt = [...side(1), ...bottom, ...side(-1).reverse()].map(([u, v]) => at(u, v));
        S.piece(g, skirt, {
            fill: C.base, line: 1.7, ink: C.ink,
            detail: (q) => {
                for (let i = 0; i < 44; i++) {
                    const sx = ((i + 0.5) / 44) * 2 - 1 + (r() - 0.5) * 0.05, v = r(), wob = (r() - 0.5) * 2;
                    const th = S.curve([[sx * 4.2, yn - 2], [sx * W * 0.34 + wob * 0.6, yn + 14], [sx * W * 0.45 + wob, yn + 40], [sx * W * 0.52 + wob * 1.4, L + 4]], false, 6);
                    S.ink(q, th.map(([u, w]) => at(u, w)), { w: 0.7 + r() * 0.9, color: v < 0.26 ? C.ink : v < 0.52 ? C.deep : v < 0.8 ? C.mid : C.light, alpha: 0.55 + r() * 0.4, taper: [0.2, 0.5] });
                }
                S.spray(q, skirt, { color: '#3c0a22', alpha: 0.72, w: W * 0.42 });
                S.spray(q, skirt, { color: '#ffb9a6', alpha: 0.34, w: W * 0.24, dir: TOL });
                const gr = q.createLinearGradient(x, y + yn, x, y + yn + 12);
                gr.addColorStop(0, 'rgba(40,8,30,0.75)');
                gr.addColorStop(1, 'rgba(40,8,30,0)');
                q.fillStyle = gr;
                q.fillRect(x - W, y + yn, W * 2, 13);
            },
        });
        // threads that have strayed from the bundle
        for (const [sx, len] of [[-0.56, 9], [0.5, 12], [0.1, 7]]) {
            const p = at(sx * W, L - 2), th = S.curve([p, [p[0] + sx * 2.5, p[1] + len * 0.5], [p[0] + sx * 5 + 1, p[1] + len]], false, 5);
            strokeP(g, th, 1.3, C.ink);
            strokeP(g, th, 0.6, C.mid);
        }
        // the ruff: a short overskirt of threads under the neck
        const ruffP = [];
        for (let k = 0; k <= 14; k++) ruffP.push([-7.4 + (k / 14) * 14.8, yn + 15 + (k % 2 ? 2.2 : 0) + (r() - 0.5) * 1.4]);
        const ruffPoly = [[-4.4, yn + 1], [4.4, yn + 1], [7.6, yn + 9], ...ruffP.reverse(), [-7.6, yn + 9]].map(([u, v]) => at(u, v));
        S.piece(g, ruffPoly, {
            fill: '#d6453c', line: 1.2, ink: C.ink, cast: { blur: 3, dx: 1, dy: 2.4, color: 'rgba(40,6,26,0.7)' },
            shade: { color: C.deep, alpha: 0.8, w: 5 }, light: { color: C.light, alpha: 0.6, w: 2.4 },
            detail: (q) => {
                for (let i = 0; i < 16; i++) {
                    const sx = (i + 0.5) / 16 * 2 - 1;
                    S.ink(q, [at(sx * 4, yn), at(sx * 6.4, yn + 8), at(sx * 7.4, yn + 17)], { w: 0.6 + r() * 0.4, color: i % 3 === 0 ? C.light : C.deep, alpha: 0.6, taper: [0.2, 0.3] });
                }
            },
        });
        // the head: a ball of silk under a net of gold thread
        const head = S.ellipse(x, y + 8.4, 8, 9, 28);
        S.piece(g, head, {
            fill: C.base, line: 1.6, ink: C.ink, shade: { color: C.deep, alpha: 0.9, w: 7 }, light: { color: C.light, alpha: 0.75, w: 4 },
            detail: (q) => {
                for (let i = 0; i < 9; i++) {
                    const sx = ((i + 0.5) / 9) * 2 - 1;
                    S.ink(q, S.curve([at(sx * 1.4, -1), at(sx * 8, 8.4), at(sx * 4, 18)], false, 6), { w: 0.55, color: i % 3 ? C.deep : C.light, alpha: 0.5, taper: [0.5, 0.3] });
                }
                // the net: gold lozenges, closer together as the ball turns away
                for (const sgn of [1, -1]) {
                    for (let k = -4; k <= 4; k++) {
                        const ln = [];
                        for (let t = 0; t <= 1.001; t += 0.1) {
                            const lat = (t - 0.5) * 2.7, lon = k * 0.42 + sgn * (t - 0.5) * 1.7;
                            if (Math.abs(lon) > 1.5) continue;
                            ln.push(at(Math.sin(lon) * Math.cos(lat) * 8, 8.4 + Math.sin(lat) * 9));
                        }
                        if (ln.length > 1) {
                            strokeP(q, shift(ln, SD, 0.35), 0.75, 'rgba(60,20,10,0.6)');
                            strokeP(q, ln, 0.55, COL.gold);
                        }
                    }
                }
                disc(q, at(-2.8, 4.2), 1.5, 'rgba(255,226,214,0.75)');
            },
        });
        // the neck: gold thread wound round and round
        const neck = [[-4.9, yn - 3.4], [4.9, yn - 3.4], [5.3, yn], [4.9, yn + 3.2], [-4.9, yn + 3.2], [-5.3, yn]].map(([u, v]) => at(u, v));
        S.piece(g, neck, {
            fill: COL.gold, line: 1.3, ink: C.ink, cast: { blur: 2, dx: 0.8, dy: 1.6, color: 'rgba(30,6,24,0.6)' },
            shade: { color: COL.goldDeep, alpha: 0.85, w: 4 }, light: { color: COL.glint, alpha: 0.9, w: 2.2 },
            detail: (q) => {
                for (let k = 0; k < 5; k++) strokeP(q, [at(-5.6, yn - 2.6 + k * 1.4), at(0, yn - 2.2 + k * 1.4), at(5.6, yn - 2.6 + k * 1.4)], 0.45, 'rgba(110,66,14,0.9)');
            },
        });
    }
    function rivet(g, G) {
        const hang = G.o.tassel !== false;
        // the ring (bail) hangs from behind the washer
        const ring = [S.ellipse(0, 15, 11.5, 12.5, 30), S.ellipse(0, 15.4, 8.4, 9.4, 26)];
        pierced(g, ring[0], [ring[1]], {
            fill: COL.gold, line: 1.5, holeLine: 1.1, thick: 0.6, edge: '#4a2f10', wall: COL.glint, wallW: 1.1,
            cast: { blur: 4, dx: 1.6, dy: 2.6, color: 'rgba(22,12,36,0.6)' },
            shade: { color: COL.goldDeep, alpha: 0.9, w: 2.6 }, light: { color: COL.glint, alpha: 0.9, w: 1.4 },
        });
        if (hang) {
            // the cord: looped through the ring (a lark's head), then down to the tassel
            cord(g, [[-3.2, 24.4], [-4.8, 30], [-1.6, 35.5], [0.4, 39]], 3.2);
            cord(g, [[3.2, 24.4], [5, 30], [2, 35.5], [0.4, 39]], 3.2);
            cord(g, [[0.4, 37], [1.8, 48], [-1.2, 60], [0, 72]], 4.4);
            const knot = S.ellipse(0.4, 38.4, 4.3, 3.6, 18);
            S.piece(g, knot, { fill: COL.tassel, line: 1.4, ink: COL.tasselInk, shade: { color: COL.tasselDeep, alpha: 0.9, w: 3.2 }, light: { color: COL.tasselLight, alpha: 0.8, w: 1.8 }, detail: (q) => { for (const d of [-1.6, 0, 1.6]) strokeP(q, [[-4, 38.4 + d - 0.8], [0.4, 38.4 + d + 0.4], [4.8, 38.4 + d - 0.8]], 0.5, 'rgba(70,10,34,0.7)'); } });
            // the ring's front, over the cord that passes through it
            g.save();
            g.beginPath();
            g.rect(-13, 22.2, 26, 8);
            g.clip();
            pierced(g, ring[0], [ring[1]], { fill: COL.gold, line: 1.5, holeLine: 1.1, shade: { color: COL.goldDeep, alpha: 0.9, w: 2.6 }, light: { color: COL.glint, alpha: 0.9, w: 1.4 } });
            g.restore();
            tassel(g, 0, 70, G.seed);
        }
        // the washer and the rivet's head
        S.piece(g, S.ellipse(0, 0, 11, 11, 30), {
            fill: COL.nacre, line: 1.6, cast: { blur: 4, dx: 2, dy: 3, color: 'rgba(24,16,40,0.62)' },
            shade: { color: '#8f8db0', alpha: 0.85, w: 6 }, light: { color: '#fffdf4', alpha: 0.9, w: 3 },
            detail: (q) => {
                // mother-of-pearl: bands of rose and sea-green that follow its growth
                for (let k = 0; k < 6; k++) strokeP(q, S.curve([[-12, -9 + k * 3.6], [-3, -11 + k * 3.9], [5, -8 + k * 3.4], [12, -10 + k * 3.8]], false, 5), 0.9, k % 2 ? 'rgba(240,160,196,0.4)' : 'rgba(120,214,190,0.4)');
                strokeP(q, S.ellipse(0, 0, 8.2, 8.2, 24), 0.4, 'rgba(110,104,150,0.6)', true);
            },
        });
        S.piece(g, S.ellipse(0, 0, 5.4, 5.4, 22), {
            fill: COL.gold, line: 1.4, cast: { blur: 2.5, dx: 1.2, dy: 1.8, color: 'rgba(40,24,30,0.6)' },
            shade: { color: COL.goldDeep, alpha: 0.9, w: 3.6 }, light: { color: COL.glint, alpha: 0.95, w: 2 },
            detail: (q) => {
                // the hammer's facets on the peened head
                for (let k = 0; k < 6; k++) strokeP(q, [[0, 0], pol(5.4, k * 1.05 + 0.3)], 0.35, 'rgba(110,66,14,0.6)');
                disc(q, [-1.7, -1.9], 1.1, 'rgba(255,250,224,0.9)');
            },
        });
    }

    // ------------------------------------------------------------------ the fan
    function setup(o) {
        const { r = 600, a0, a1, n = 14, seed = 'fan' } = o;
        const scene = o.scene ?? (/R$/.test(String(seed)) ? 'sevilla' : 'granada');
        const dir = a1 > a0 ? 1 : -1, span = Math.abs(a1 - a0), amin = Math.min(a0, a1), half = (a1 - a0) / (2 * n);
        const rnd = Motion.rng('fan/' + seed), fold = [];
        // folded by hand: the folds are not quite evenly spaced
        for (let j = 0; j <= 2 * n; j++) fold.push(a0 + half * j + (j > 0 && j < 2 * n ? (rnd() - 0.5) * 0.16 * half : 0));
        return { o, k: r / 600, n, a0, a1, dir, span, amin, half, fold, seed, scene, W: span * RM, flaw: 2 + Math.floor(rnd() * Math.max(1, n - 4)) };
    }
    function draw(g, o) {
        const G = setup(o);
        g.save();
        g.translate(o.x, o.y);
        g.scale(G.k, G.k);
        g.lineCap = 'round';
        // far to near: the far guard, the sticks over one another, the leaf on their ribs,
        // its lace, the front guard on top of the last fold, the rivet through them all
        guard(g, G, G.a0 - G.dir * 0.027, 0);
        for (let i = 1; i < G.n; i++) stick(g, G, G.fold[2 * i], i);
        leaf(g, G);
        lace(g, G);
        guard(g, G, G.a1 + G.dir * 0.004, 1);
        rivet(g, G);
        g.restore();
    }
    // the page point of the leaf's (u, v)
    function at(o, u, v) {
        const G = setup(o), a = G.amin + u * G.span, rho = (R0 + v * HB) * G.k;
        return [o.x + Math.cos(a) * rho, o.y + Math.sin(a) * rho];
    }
    return { draw, at, carnation, COL };
})();
