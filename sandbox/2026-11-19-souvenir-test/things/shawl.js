// The night behind the emblem as a mantón de Manila: a silk shawl embroidered all over, seen
// by moonlight. Global: Shawl.
//
//   Shawl.carpet(g, box, { seed = 'shawl', keepOut = 0, view = null, anchors, verses })
//       Paints the whole embroidery over whatever ground is already on `g` (the tableau's
//       indigo plate), in the caller's units, origin at the centre of the picture.
//       box      { x, y, w, h }: what the shawl covers (the layout is seeded from it)
//       keepOut  radius about the origin where nothing is embroidered (0: the tableau cuts
//                the hole of the dive itself)
//       view     { x, y, w, h }: paint only what touches this window (dev close-ups)
//       anchors  [{ k: 'peafowl' | 'songbird' | 'pavilion' | 'bridge' | 'butterfly' | 'dragonfly',
//                x, y, … }]: finds with a place of their own, to show one in a pocket of
//                ground the emblem leaves bare (default: none; the seeded layout already
//                deals one find to every bay of about 500 units)
//       verses   false: no lettering in the weave
//   Shawl.ghost      the same drawer under its old name (the tableau calls it)
//   Shawl.plan(box, opts) → { items }   the seeded layout: every motif with its place
//
//   One motif alone (sizes in units at s = 1; all static, lit from the top left however turned):
//   Shawl.peony(g, { x, y, r, seed, bloom })     a peony from above, centre (x, y), radius r (30–115)
//   Shawl.rose(g, { x, y, r, seed, bloom })      a rose from above, the same
//   Shawl.mum(g, { x, y, r, seed, bloom })       a chrysanthemum, the same (r 14–60)
//   Shawl.cup(g, { x, y, r, rot, seed, bloom })  a peony half open from the side: (x, y) where the
//                                                petals leave the calyx, opening along rot, 1.9 r tall
//   Shawl.floret(g, { x, y, r, seed, bloom, kind })   a small flower (r 5–24): 'round' | 'notched' | 'star'
//   Shawl.bud(g, { x, y, r, rot, seed })         a bud, (x, y) its middle, 2 r long, tip along rot
//   Shawl.leaf(g, { x, y, a, len, wid, bend, hue, seed })   one leaf from its base along a
//   Shawl.fern(g, { x, y, a, len, seed }), Shawl.spray(g, { pts, seed }), Shawl.bough(g, { pts, seed })
//   Shawl.butterfly(g, { x, y, r, rot, seed })   r: half the wingspan (14–26), head along rot
//   Shawl.dragonfly(g, { x, y, r, rot, seed })   r: a forewing's length (16–26), head along rot
//   Shawl.songbird(g, { x, y, s, rot, flip, seed })   (x, y) the middle of the body; at s = 1 it
//                                                heads right and takes x −48…30, y −21…23 (with its twig)
//   Shawl.peafowl(g, { x, y, s, rot, flip, pose, sag, seed })   (x, y) the middle of the body, 46
//                                                long; the head 50 above, the train 190–260 behind
//   Shawl.pavilion(g, { x, y, s, flip, seed })   (x, y) the middle of its foot: 108 wide, 100 tall
//   Shawl.bridge(g, { x, y, s, flip, seed })     (x, y) the crown of its deck: 118 wide, 50 tall
//
// THE REAL THING, and what of it is painted here
// A mantón de Manila is a square of silk crepe embroidered in Canton for the Manila trade and
// worn in Andalusia: flowers so close that the ground only shows between them.
//  Anatomy of the embroidery
//   · satin stitch: every petal, leaf and feather is a field of parallel floss laid side by
//     side from its base to its edge. Floss is a mirror along its length: a field is bright
//     when its threads lie across the light and dark when they run with it, so the same
//     silk gives a light petal next to a dark one. (`thread`: tone from the thread's angle.)
//   · the threads arch over a padding of under-stitches, so each field has a band of sheen
//     where the arch faces the lamp, and its far slope is dull. (`thread`: the sheen band.)
//   · long and short («matizado»): colours change inside a field by interlocking stitches
//     of two lengths, never by a gradient. (`thread`: the zone splits, odd and even threads.)
//   · a fan-shaped field is filled with wedge stitches: only one thread in four reaches its
//     base. (`fanThreads`: staggered starts.)
//   · leaves, feathers and narrow petals are worked in fishbone: two rows of slanting
//     stitches that meet on the midrib, so one half of a leaf shines and the other does not.
//  Ten small true details
//   1  voiding: fields never touch; a hairline of bare ground is left between two petals.
//   2  a couched cord round some of the big flowers: a laid thread tied down by ticks.
//   3  stems in stem stitch: a rope of short slanting stitches.
//   4  stamens in knots: each a bead with a light on it and a shadow under it.
//   5  veins: one stitch in four of a leaf in a paler silk, and a midrib of split stitch.
//   6  petals turned back at the tip, a rose's rolled lip: a small field stitched across
//      the petal's own grain, so it shines when the petal does not.
//   7  the thickness of the work: every field shades the cloth and the field under it.
//   8  an insect has been at some leaves; a leaf tip gone the colour of old gold.
//   9  a thread come loose from its field and lying in a curl on the cloth.
//  10  Canton: long-tailed birds worked feather by feather with a knot for an eye,
//      butterflies, a pavilion with upturned eaves and a little bridge with someone on it,
//      as small as a flower; and the cloth itself, a crepe with a grain, figured like a
//      damask with verses that only show as a change in the weave.
const Shawl = (() => {
    const S = Souvenir;
    const { clamp, smooth, lerp } = S;
    const TAU = Math.PI * 2;
    const SN = Math.hypot(S.SHADE_DIR[0], S.SHADE_DIR[1]);
    const SX = S.SHADE_DIR[0] / SN, SY = S.SHADE_DIR[1] / SN; // away from the lamp, on the cloth
    const pol = (x, y, r, a) => [x + Math.cos(a) * r, y + Math.sin(a) * r];
    const wrap = (a) => a - TAU * Math.round(a / TAU);
    const GAP = 1.35, TW = 1.3; // the floss: one thread every GAP units, TW thick

    // ------------------------------------------------------------------ silks
    // Every silk as nine tones from its shade to its sheen. Colours seen by moonlight:
    // pulled towards indigo, close in value, a few ivory and gold lights.
    const silk = (...a) => {
        const out = [];
        for (let i = 0; i < 9; i++) {
            const f = (i / 8) * (a.length - 1), k = Math.min(a.length - 2, Math.floor(f));
            out.push(S.mix(a[k], a[k + 1], f - k));
        }
        return out;
    };
    const SILK = {
        rose: silk('#24133a', '#3d1d4a', '#582a5a', '#72396a', '#8a4e7e'),
        wine: silk('#1f0f30', '#34143a', '#4c1b42', '#64264c', '#7c3a5c'),
        coral: silk('#281536', '#452140', '#63304a', '#7d4354', '#935a66'),
        gold: silk('#2a2238', '#42363c', '#5c4c3e', '#766243', '#8d784e'),
        teal: silk('#11213c', '#17334c', '#1d475c', '#285d6b', '#3e777b'),
        jade: silk('#142738', '#1b3a44', '#254f50', '#33655c', '#497c70'),
        moss: silk('#1b2636', '#29383e', '#3a4c44', '#4d6249', '#637858'),
        peri: silk('#1e2254', '#2b316a', '#3c4482', '#505898', '#686fac'),
        plum: silk('#1c153c', '#2e2152', '#433168', '#59447e', '#715a94'),
        ivory: silk('#2b2c54', '#3e3e68', '#52527c', '#66658e', '#7a789e'),
    };
    const VOID = '#0d0f24', CAST = 'rgba(7,8,24,0.5)';
    // the plate's own colour at a point (for a hole worn through the work)
    const groundAt = (x, y) => {
        const t = clamp(Math.hypot(x, y) / 1500);
        return t < 0.45 ? S.mix('#2c2f63', '#232750', t / 0.45) : S.mix('#232750', '#1b1e3d', (t - 0.45) / 0.55);
    };

    // ------------------------------------------------------------------ the skein
    // Stitches are gathered by colour and laid in one stroke each.
    const SK = new Map();
    const add = (col, x0, y0, x1, y1) => {
        let a = SK.get(col);
        if (!a) SK.set(col, (a = []));
        a.push(x0, y0, x1, y1);
    };
    function lay(g, w = TW) {
        g.lineWidth = w;
        g.lineCap = 'butt';
        for (const [col, a] of SK) {
            g.strokeStyle = col;
            g.beginPath();
            for (let i = 0; i < a.length; i += 4) {
                g.moveTo(a[i], a[i + 1]);
                g.lineTo(a[i + 2], a[i + 3]);
            }
            g.stroke();
        }
        SK.clear();
    }

    // What a field needs to know to tone its threads.
    //   zones  [[uEnd, silk, lift], …] colours from the field's base (u = 0) to its edge
    //   tone   the field's own value, 0…1 along the silk
    //   an     how much the thread's angle to the light counts; sheen: the band where the arch
    //          faces the lamp; base: the shade towards the field's base (under what overlaps it)
    //   cx, cy, R  the form the field belongs to (a flower's head): its lit and its shadow side
    const field = (o) => ({ tone: 0.44, an: 0.44, flank: 0.2, base: 0.3, baseTo: 0.5, tip: 0.06, sheen: 0.24, ls: 0.1, bundle: 0, cx: 0, cy: 0, R: 50, ...o });

    // One thread of floss from (x0, y0) to (x1, y1), which are at u0 and u1 of its field.
    const BP = new Float64Array(8), ZS = new Float64Array(5);
    function thread(x0, y0, x1, y1, P, i, u0 = 0, u1 = 1) {
        const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
        if (len < 0.5) return;
        const rnd = P.rnd, c = (dx * SX + dy * SY) / len, an = 1 - c * c; // brightest across the light
        const Z = P.zones, nz = Z.length, du = u1 - u0;
        const jit = (rnd() - 0.5) * 0.2 + P.bundle;
        let nb = 0;
        BP[nb++] = 0;
        // where one colour hands over to the next: long and short, thread by thread
        for (let k = 0; k < nz - 1; k++) {
            const s = Z[k][0] + (i & 1 ? 1 : -1) * P.ls * (0.5 + rnd());
            ZS[k] = s;
            if (du > 1e-6) {
                const f = (s - u0) / du;
                if (f > 0.04 && f < 0.96) BP[nb++] = f;
            }
        }
        ZS[nz - 1] = 9;
        // the sheen: where the arching thread faces the lamp
        const us = clamp(0.5 - Math.atan(0.65 * c), 0.16, 0.84);
        let b0 = -1, b1 = -1;
        if (len > 7 && P.sheen > 0) {
            const hw = 0.12 + 0.09 * rnd();
            b0 = us - hw;
            b1 = us + hw;
            if (b0 > 0.04) BP[nb++] = b0;
            if (b1 < 0.96) BP[nb++] = b1;
        }
        BP[nb++] = 1;
        for (let a = 1; a < nb; a++) {
            const v = BP[a];
            let b = a - 1;
            while (b >= 0 && BP[b] > v) {
                BP[b + 1] = BP[b];
                b--;
            }
            BP[b + 1] = v;
        }
        for (let a = 0; a < nb - 1; a++) {
            const fa = BP[a], fb = BP[a + 1];
            if (fb - fa < 1e-4) continue;
            const fm = (fa + fb) / 2, u = u0 + du * fm;
            let k = 0;
            while (ZS[k] < u) k++;
            const z = Z[k], xm = x0 + dx * fm, ym = y0 + dy * fm;
            let tone = P.tone + z[2] + P.an * (an - 0.5) - (P.flank * ((xm - P.cx) * SX + (ym - P.cy) * SY)) / P.R - P.base * (1 - smooth(0, P.baseTo, u)) + P.tip * smooth(0.6, 1, u) + jit;
            if (b0 > -1) tone += fm > b0 && fm < b1 ? P.sheen * (0.35 + 0.65 * an) : -P.sheen * 0.3 * smooth(0.2, 0.6, Math.abs(fm - us));
            add(z[1][clamp(Math.round(tone * 8), 0, 8)], x0 + dx * fa, y0 + dy * fa, x0 + dx * fb, y0 + dy * fb);
        }
    }

    // ------------------------------------------------------------------ fields
    const traceAll = (g, polys, dx = 0, dy = 0) => {
        g.beginPath();
        for (const p of polys) {
            g.moveTo(p[0][0] + dx, p[0][1] + dy);
            for (let i = 1; i < p.length; i++) g.lineTo(p[i][0] + dx, p[i][1] + dy);
            g.closePath();
        }
    };
    // Under a field: its shadow on what lies beneath (the thickness of the work), then the
    // padding, a tone darker than the floss that will cover it.
    function under(g, polys, P) {
        const d = P.cast ?? 2.2;
        if (d > 0) {
            g.fillStyle = CAST;
            traceAll(g, polys, SX * d, SY * d);
            g.fill();
        }
        const z = P.zones[Math.min(1, P.zones.length - 1)];
        g.fillStyle = z[1][clamp(Math.round((P.tone + z[2] - 0.2) * 8), 0, 8)];
        traceAll(g, polys);
        g.fill();
    }
    // Round a field: the void (a hairline of ground) and, where its edge looks at the lamp, a
    // thread of light just inside it.
    function rim(g, polys, P) {
        const lw = P.line ?? 1.2;
        if (lw > 0) {
            g.strokeStyle = VOID;
            g.lineJoin = 'round';
            g.lineWidth = lw;
            traceAll(g, polys);
            g.stroke();
        }
        const gl = P.gleam ?? 0.55;
        if (gl <= 0) return;
        const Z = P.zones[P.zones.length - 1];
        g.strokeStyle = P.gleamCol ?? Z[1][8];
        g.lineWidth = 0.85;
        g.globalAlpha = gl;
        g.beginPath();
        for (const p of polys) {
            const n = p.length;
            let ar = 0;
            for (let i = 0; i < n; i++) {
                const q = p[(i + 1) % n];
                ar += p[i][0] * q[1] - q[0] * p[i][1];
            }
            const sg = ar > 0 ? 1 : -1;
            let pen = false;
            for (let i = 0; i < n; i++) {
                const a = p[i], b = p[(i + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], el = Math.hypot(ex, ey) || 1;
                const nx = (sg * ey) / el, ny = (-sg * ex) / el;
                if (-(nx * SX + ny * SY) > 0.4) {
                    const ox = -nx * 1.3, oy = -ny * 1.3;
                    if (!pen) g.moveTo(a[0] + ox, a[1] + oy);
                    g.lineTo(b[0] + ox, b[1] + oy);
                    pen = true;
                } else pen = false;
            }
        }
        g.stroke();
        g.globalAlpha = 1;
    }

    // A fan of satin stitch: threads run from about O out to the field's edge. Only one in
    // four starts at the base (wedge stitches), so the floss is as close at the base as at
    // the edge.
    const STAG = [0, 0.5, 0.25, 0.5], TS = [];
    function fanThreads(poly, O, P) {
        const n = poly.length, ox = O[0], oy = O[1], axis = P.axis ?? 0, rnd = P.rnd;
        const rel = new Float64Array(n * 2);
        let a0 = 9, a1 = -9, rmax = 0;
        for (let i = 0; i < n; i++) {
            const dx = poly[i][0] - ox, dy = poly[i][1] - oy, rr = Math.hypot(dx, dy);
            rel[i * 2] = dx;
            rel[i * 2 + 1] = dy;
            if (rr > rmax) rmax = rr;
            if (rr > 1e-3) {
                const a = wrap(Math.atan2(dy, dx) - axis);
                if (a < a0) a0 = a;
                if (a > a1) a1 = a;
            }
        }
        if (P.full) {
            a0 = -Math.PI;
            a1 = Math.PI;
        }
        const nr = Math.max(3, Math.ceil(((a1 - a0) * rmax) / (P.gap ?? GAP)));
        for (let i = 0; i < nr; i++) {
            const a = axis + a0 + ((i + 0.5 + (rnd() - 0.5) * 0.3) / nr) * (a1 - a0), dx = Math.cos(a), dy = Math.sin(a);
            TS.length = 0;
            for (let k = 0; k < n; k++) {
                const px = rel[k * 2], py = rel[k * 2 + 1], k2 = (k + 1) % n, ex = rel[k2 * 2] - px, ey = rel[k2 * 2 + 1] - py;
                const D = dx * ey - dy * ex;
                if (Math.abs(D) < 1e-9) continue;
                const s = (px * dy - py * dx) / D;
                if (s < 0 || s >= 1) continue;
                const t = (px * ey - py * ex) / D;
                if (t > 1e-6) TS.push(t);
            }
            if (!TS.length) continue;
            TS.sort((p, q) => p - q);
            if (TS.length & 1) TS.unshift(0);
            const tA = TS[0], tB = TS[TS.length - 1], span = tB - tA;
            if (span < 1) continue;
            if (i % 3 === 0) P.bundle = (rnd() - 0.5) * 0.16;
            const lvl = STAG[i & 3] * rmax * (0.8 + 0.4 * rnd());
            for (let k = 0; k < TS.length; k += 2) {
                const t0 = Math.max(TS[k], lvl), t1 = TS[k + 1];
                if (t1 - t0 < 1.2) continue;
                thread(ox + dx * t0, oy + dy * t0, ox + dx * t1, oy + dy * t1, P, i, (t0 - tA) / span, (t1 - tA) / span);
            }
        }
    }
    function fan(g, poly, O, P) {
        under(g, [poly], P);
        fanThreads(poly, O, P);
        lay(g, P.w);
        rim(g, [poly], P);
    }

    // A field of parallel threads at `ang` (a turned-back tip, a column, a roof). With
    // `P.across`, the colour zones run across the threads instead of along them.
    const XS = [];
    function hatchThreads(poly, ang, P) {
        const n = poly.length, ca = Math.cos(ang), sa = Math.sin(ang), rnd = P.rnd;
        const rx = new Float64Array(n), ry = new Float64Array(n);
        let v0 = 1e9, v1 = -1e9;
        for (let i = 0; i < n; i++) {
            rx[i] = poly[i][0] * ca + poly[i][1] * sa;
            ry[i] = -poly[i][0] * sa + poly[i][1] * ca;
            if (ry[i] < v0) v0 = ry[i];
            if (ry[i] > v1) v1 = ry[i];
        }
        const gap = P.gap ?? GAP;
        let j = 0;
        for (let v = v0 + gap * 0.5; v < v1; v += gap, j++) {
            XS.length = 0;
            for (let i = 0; i < n; i++) {
                const k = (i + 1) % n, ya = ry[i], yb = ry[k];
                if ((ya <= v && yb > v) || (yb <= v && ya > v)) XS.push(rx[i] + ((v - ya) / (yb - ya)) * (rx[k] - rx[i]));
            }
            XS.sort((p, q) => p - q);
            if (j % 3 === 0) P.bundle = (rnd() - 0.5) * 0.16;
            const w = (v - v0) / (v1 - v0);
            for (let i = 0; i + 1 < XS.length; i += 2) {
                const xa = XS[i], xb = XS[i + 1];
                if (xb - xa < 0.8) continue;
                if (P.across) thread(xa * ca - v * sa, xa * sa + v * ca, xb * ca - v * sa, xb * sa + v * ca, P, j, w, w);
                else thread(xa * ca - v * sa, xa * sa + v * ca, xb * ca - v * sa, xb * sa + v * ca, P, j);
            }
        }
    }
    function hatch(g, poly, ang, P) {
        under(g, [poly], P);
        hatchThreads(poly, ang, P);
        lay(g, P.w);
        rim(g, [poly], P);
    }

    // A blade for fishbone stitch: a midrib and two margins, point for point, base first.
    //   shape: 'ovate' (a rose leaf), 'lance' (willow, bamboo), 'spoon' (a chrysanthemum's
    //   petal), 'quill' (a feather); teeth: a serrated margin, every tooth pointing forward
    function bladeGeom(bx, by, ang, len, wid, o = {}) {
        const teeth = o.teeth ?? 0, n = teeth ? teeth * 4 : Math.max(6, Math.round(len / 2.4));
        const bend = o.bend ?? 0, shape = o.shape ?? 'ovate', amp = o.amp ?? 0.14, asym = o.asym ?? 0;
        const M = [[bx, by]], L = [], R = [];
        let x = bx, y = by;
        for (let i = 1; i <= n; i++) {
            const a = ang + bend * Math.pow((i - 0.5) / n, 1.3);
            x += (Math.cos(a) * len) / n;
            y += (Math.sin(a) * len) / n;
            M.push([x, y]);
        }
        for (let i = 0; i <= n; i++) {
            const v = i / n, p = M[Math.max(0, i - 1)], q = M[Math.min(n, i + 1)];
            let tx = q[0] - p[0], ty = q[1] - p[1];
            const tl = Math.hypot(tx, ty) || 1;
            tx /= tl;
            ty /= tl;
            let f;
            if (shape === 'ovate') f = Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(v, 0.72))), 0.85);
            else if (shape === 'lance') f = Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(v, 0.9))), 0.6);
            else if (shape === 'spoon') f = (0.34 + 0.66 * Math.pow(v, 0.6)) * Math.pow(Math.max(0, 1 - Math.pow(v, 5)), 0.5);
            else f = (0.5 + 0.5 * smooth(0, 0.3, v)) * Math.pow(Math.max(0, 1 - Math.pow(v, 4)), 0.6);
            const w = (wid / 2) * f;
            let kl = 1, kr = 1;
            if (teeth) {
                const env = amp * smooth(0.05, 0.2, v) * smooth(1, 0.92, v);
                kl = 1 + env * (((i % 4) / 4) * 2 - 0.75);
                kr = 1 + env * ((((i + 2) % 4) / 4) * 2 - 0.75);
            }
            L.push([M[i][0] + ty * w * (1 + asym) * kl, M[i][1] - tx * w * (1 + asym) * kl]);
            R.push([M[i][0] - ty * w * (1 - asym) * kr, M[i][1] + tx * w * (1 - asym) * kr]);
        }
        return { M, L, R, len, wid, n, poly: [...L, ...R.slice(0, n).reverse()] };
    }
    const along = (A, f, n) => {
        const ff = clamp(f, 0, n), i = Math.min(n - 1, Math.floor(ff)), k = ff - i;
        return [A[i][0] + (A[i + 1][0] - A[i][0]) * k, A[i][1] + (A[i + 1][1] - A[i][1]) * k];
    };
    // The blade's stitches into the skein. P adds: slant (rad), vein (one stitch in `vein`
    // in a paler silk), tipZones + tipFrom (another colour towards the tip).
    function bladeThreads(B, P, veins) {
        const { M, L, R, n } = B, rnd = P.rnd, slant = P.slant ?? 0.72;
        const seg = B.len / n, cot = 1 / Math.tan(slant), step = (P.gap ?? GAP) / Math.sin(slant), z0 = P.zones;
        let j = 0;
        for (let s = step * 0.5; s < B.len - 0.4; s += step, j++) {
            const m = along(M, s / seg, n);
            if (j % 3 === 0) P.bundle = (rnd() - 0.5) * 0.16;
            if (P.tipZones) P.zones = s / B.len > P.tipFrom + (rnd() - 0.5) * 0.14 ? P.tipZones : z0;
            for (let sd = 0; sd < 2; sd++) {
                const A = sd ? R : L;
                let se = s, e = along(A, se / seg, n);
                for (let it = 0; it < 3; it++) {
                    const mm = along(M, se / seg, n);
                    se = Math.min(B.len, s + Math.hypot(e[0] - mm[0], e[1] - mm[1]) * cot);
                    e = along(A, se / seg, n);
                }
                thread(m[0], m[1], e[0], e[1], P, j);
                if (veins && P.vein && j % P.vein === P.vein - 1) veins.push(m[0], m[1], m[0] + (e[0] - m[0]) * 0.84, m[1] + (e[1] - m[1]) * 0.84);
            }
        }
        P.zones = z0;
    }
    function blade(g, B, P) {
        const { M, n } = B, veins = [];
        under(g, [B.poly], P);
        bladeThreads(B, P, veins);
        lay(g, P.w);
        const Z = P.zones[P.zones.length - 1][1];
        if (veins.length) {
            g.strokeStyle = P.veinCol ?? Z[8];
            g.lineWidth = 0.75;
            g.globalAlpha = 0.6;
            g.beginPath();
            for (let i = 0; i < veins.length; i += 4) {
                g.moveTo(veins[i], veins[i + 1]);
                g.lineTo(veins[i + 2], veins[i + 3]);
            }
            g.stroke();
            g.globalAlpha = 1;
        }
        if (P.rib !== 0) {
            // the midrib: a void, and a split stitch of paler silk on its lit side
            const m = Math.max(2, Math.round(n * 0.94));
            g.lineWidth = P.rib ?? 1.1;
            g.strokeStyle = VOID;
            g.beginPath();
            g.moveTo(M[0][0], M[0][1]);
            for (let i = 1; i <= m; i++) g.lineTo(M[i][0], M[i][1]);
            g.stroke();
            g.lineWidth = 0.7;
            g.strokeStyle = P.ribCol ?? Z[7];
            g.globalAlpha = 0.75;
            g.beginPath();
            g.moveTo(M[0][0] - SX * 0.8, M[0][1] - SY * 0.8);
            for (let i = 1; i <= m; i++) g.lineTo(M[i][0] - SX * 0.8, M[i][1] - SY * 0.8);
            g.stroke();
            g.globalAlpha = 1;
        }
        rim(g, [B.poly], P);
    }

    // The points of a polyline at equal steps along it.
    function walk(pts, step) {
        const out = [pts[0]];
        let need = step;
        for (let i = 1; i < pts.length; i++) {
            let a = pts[i - 1];
            const b = pts[i];
            let d = Math.hypot(b[0] - a[0], b[1] - a[1]);
            while (d >= need && d > 0) {
                const k = need / d;
                a = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
                out.push(a);
                d -= need;
                need = step;
            }
            need -= d;
        }
        return out;
    }
    const strokeLine = (g, pts, dx = 0, dy = 0) => {
        g.beginPath();
        g.moveTo(pts[0][0] + dx, pts[0][1] + dy);
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] + dx, pts[i][1] + dy);
        g.stroke();
    };
    const segs = (g, a, col, w) => {
        g.strokeStyle = col;
        g.lineWidth = w;
        g.beginPath();
        for (let i = 0; i < a.length; i += 4) {
            g.moveTo(a[i], a[i + 1]);
            g.lineTo(a[i + 2], a[i + 3]);
        }
        g.stroke();
    };
    // Stem stitch: a rope of short slanting stitches along a line, `w` thick.
    function rope(g, pts, w, sk, o = {}) {
        const rnd = o.rnd, tone = o.tone ?? 0.5;
        if (pts.length < 2) return;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        if (o.cast !== 0) {
            g.strokeStyle = CAST;
            g.lineWidth = w + 0.6;
            strokeLine(g, pts, SX * 1.7, SY * 1.7);
        }
        g.strokeStyle = VOID;
        g.lineWidth = w + 1.5;
        strokeLine(g, pts);
        g.strokeStyle = sk[clamp(Math.round((tone - 0.2) * 8), 0, 8)];
        g.lineWidth = w;
        strokeLine(g, pts);
        const st = walk(pts, o.step ?? 2.3), h = w * 0.5;
        for (let i = 1; i < st.length - 1; i++) {
            const a = st[i - 1], b = st[i + 1];
            let tx = b[0] - a[0], ty = b[1] - a[1];
            const tl = Math.hypot(tx, ty) || 1;
            tx /= tl;
            ty /= tl;
            const x0 = st[i][0] + ty * h - tx * h * 1.5, y0 = st[i][1] - tx * h - ty * h * 1.5, x1 = st[i][0] - ty * h + tx * h * 1.5, y1 = st[i][1] + tx * h + ty * h * 1.5;
            const dx = x1 - x0, dy = y1 - y0, c = (dx * SX + dy * SY) / (Math.hypot(dx, dy) || 1);
            add(sk[clamp(Math.round((tone + 0.4 * (0.5 - c * c) + (rnd() - 0.5) * 0.24) * 8), 0, 8)], x0, y0, x1, y1);
        }
        lay(g, Math.min(1.25, w * 0.5));
    }
    // Knots: each a bead of floss with a light on it and a shadow under it. list: x, y, r, …
    function knots(g, list, sk, tone = 0.55) {
        if (!list.length) return;
        g.fillStyle = VOID;
        g.beginPath();
        for (let i = 0; i < list.length; i += 3) {
            g.moveTo(list[i] + SX * 0.9 + list[i + 2] + 0.5, list[i + 1] + SY * 0.9);
            g.arc(list[i] + SX * 0.9, list[i + 1] + SY * 0.9, list[i + 2] + 0.5, 0, TAU);
        }
        g.fill();
        g.fillStyle = sk[clamp(Math.round(tone * 8), 0, 8)];
        g.beginPath();
        for (let i = 0; i < list.length; i += 3) {
            g.moveTo(list[i] + list[i + 2], list[i + 1]);
            g.arc(list[i], list[i + 1], list[i + 2], 0, TAU);
        }
        g.fill();
        g.fillStyle = sk[8];
        g.beginPath();
        for (let i = 0; i < list.length; i += 3) {
            const r = list[i + 2] * 0.48, x = list[i] - SX * list[i + 2] * 0.34, y = list[i + 1] - SY * list[i + 2] * 0.34;
            g.moveTo(x + r, y);
            g.arc(x, y, r, 0, TAU);
        }
        g.fill();
    }
    // A couched cord along a line: a laid thread, its shadow, and the ticks that tie it down.
    function cord(g, pts, sk, o = {}) {
        const w = o.w ?? 1.1;
        if (pts.length < 2) return;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.strokeStyle = CAST;
        g.lineWidth = w + 0.5;
        strokeLine(g, pts, SX * 1.1, SY * 1.1);
        g.strokeStyle = sk[o.tone ?? 6];
        g.lineWidth = w;
        strokeLine(g, pts);
        const st = walk(pts, o.every ?? 4.5);
        g.strokeStyle = sk[2];
        g.lineWidth = 0.7;
        g.beginPath();
        for (let i = 1; i < st.length - 1; i++) {
            const a = st[i - 1], b = st[i + 1];
            let tx = b[0] - a[0], ty = b[1] - a[1];
            const tl = Math.hypot(tx, ty) || 1;
            tx /= tl;
            ty /= tl;
            g.moveTo(st[i][0] + ty * w * 0.9, st[i][1] - tx * w * 0.9);
            g.lineTo(st[i][0] - ty * w * 0.9, st[i][1] + tx * w * 0.9);
        }
        g.stroke();
    }
    // A thin line with its void under it (a leg, a rail, a filament).
    function wire(g, pts, col, w = 1, o = {}) {
        g.lineCap = 'round';
        g.lineJoin = 'round';
        if (o.void !== 0) {
            g.strokeStyle = VOID;
            g.lineWidth = w + 1.1;
            strokeLine(g, pts, SX * 0.5, SY * 0.5);
        }
        g.strokeStyle = col;
        g.lineWidth = w;
        strokeLine(g, pts);
    }
    // A thing's own frame: local (u, v) → the cloth, turned by rot, scaled by s, mirrored
    // left to right by flip. The geometry is turned, never the canvas: the lamp stays put.
    const frame = (x, y, rot = 0, s = 1, flip = false) => {
        const c = Math.cos(rot) * s, n = Math.sin(rot) * s, f = flip ? -1 : 1;
        const T = (u, v) => [x + u * f * c - v * n, y + u * f * n + v * c];
        T.all = (a) => a.map((p) => T(p[0], p[1]));
        T.ang = (a) => (flip ? Math.PI - a : a) + rot;
        T.s = s;
        T.f = f;
        return T;
    };

    // ------------------------------------------------------------------ flowers
    // How a bloom is shaded from the base of a petal to its edge, its turned-back lip, its heart.
    const BLOOM = {
        rose: { zones: [[0.3, SILK.wine, -0.1], [0.7, SILK.rose, 0], [1, SILK.rose, 0.14]], lip: SILK.coral, heart: SILK.gold, eye: SILK.jade },
        wine: { zones: [[0.34, SILK.plum, -0.12], [0.78, SILK.wine, 0.04], [1, SILK.coral, 0.1]], lip: SILK.rose, heart: SILK.gold, eye: SILK.teal },
        ivory: { zones: [[0.28, SILK.rose, -0.06], [0.6, SILK.ivory, -0.1], [1, SILK.ivory, 0.08]], lip: SILK.ivory, heart: SILK.gold, eye: SILK.jade },
        gold: { zones: [[0.38, SILK.wine, -0.04], [0.74, SILK.gold, -0.16], [1, SILK.gold, 0]], lip: SILK.ivory, heart: SILK.wine, eye: SILK.teal },
        peri: { zones: [[0.3, SILK.wine, -0.08], [0.68, SILK.peri, -0.04], [1, SILK.ivory, 0]], lip: SILK.ivory, heart: SILK.gold, eye: SILK.rose },
        coral: { zones: [[0.3, SILK.wine, -0.08], [0.7, SILK.coral, 0], [1, SILK.ivory, -0.04]], lip: SILK.ivory, heart: SILK.gold, eye: SILK.jade },
        teal: { zones: [[0.32, SILK.plum, -0.1], [0.74, SILK.teal, 0], [1, SILK.jade, 0.14]], lip: SILK.ivory, heart: SILK.gold, eye: SILK.rose },
        plum: { zones: [[0.3, SILK.wine, -0.12], [0.72, SILK.plum, 0.02], [1, SILK.peri, 0.1]], lip: SILK.rose, heart: SILK.gold, eye: SILK.jade },
    };
    const BLOOMS = ['rose', 'rose', 'wine', 'ivory', 'gold', 'peri', 'coral', 'rose', 'wine', 'plum', 'coral', 'peri', 'plum', 'ivory', 'wine', 'rose'];
    const SMALL = [...BLOOMS, 'teal', 'ivory', 'gold', 'teal']; // small flowers come in blue-green too
    const bloomOf = (o, rnd, list = BLOOMS) => BLOOM[o.bloom ?? list[(rnd() * list.length) | 0]];
    const zonesOf = (B, rnd, lift = 0) => B.zones.map(([u, sk, l], i) => [i === B.zones.length - 1 ? 1 : u + (rnd() - 0.5) * 0.1, sk, l + lift]);
    const shade = (g, x, y, r, d = 4.5, a = 0.32) => {
        g.fillStyle = `rgba(7,8,24,${a})`;
        g.beginPath();
        g.arc(x + SX * d, y + SY * d, r, 0, TAU);
        g.fill();
    };

    // A petal's outline about O: a claw, two flanks and a ruffled, notched edge.
    function petalPoly(ox, oy, axis, L, phi, rnd, o = {}) {
        const N = o.N ?? 20, pts = [], side = o.side ?? 0.68;
        const nt = o.notch ?? (rnd() < 0.5 ? 1 : rnd() < 0.45 ? 2 : 0);
        const n1 = (rnd() - 0.5) * 0.5, n2 = n1 + (rnd() < 0.5 ? -1 : 1) * (0.42 + rnd() * 0.25), nd = 0.07 + rnd() * 0.09;
        const rf = 2 + rnd() * 2.5, rph = rnd() * TAU, ra = (o.ruffle ?? 0.045) * (0.6 + rnd() * 0.8), cusp = o.cusp ?? 0;
        pts.push(pol(ox, oy, L * 0.12, axis - phi * 0.5));
        pts.push(pol(ox, oy, L * 0.4, axis - phi * 0.88));
        for (let i = 0; i <= N; i++) {
            const s = (i / N) * 2 - 1;
            let e = side + (1 - side) * Math.pow(Math.max(0, Math.cos((s * Math.PI) / 2)), 0.55);
            e *= 1 + ra * Math.sin(s * rf * Math.PI + rph) * (1 - s * s) + cusp * Math.exp(-Math.pow(s / 0.16, 2));
            if (nt > 0) e *= 1 - nd * Math.exp(-Math.pow((s - n1) / 0.1, 2));
            if (nt > 1) e *= 1 - nd * 0.7 * Math.exp(-Math.pow((s - n2) / 0.09, 2));
            pts.push(pol(ox, oy, L * e, axis + s * phi));
        }
        pts.push(pol(ox, oy, L * 0.4, axis + phi * 0.88));
        pts.push(pol(ox, oy, L * 0.12, axis + phi * 0.5));
        return pts;
    }
    // A tip turned back: a crescent on the petal's edge, stitched across the petal's grain.
    function fold(g, poly, O, axis, L, P, B, rnd) {
        const N = poly.length - 4, i0 = 2 + Math.floor(N * (0.08 + rnd() * 0.3)), i1 = Math.min(poly.length - 3, i0 + Math.floor(N * (0.35 + rnd() * 0.25)));
        if (i1 - i0 < 4) return;
        const out = poly.slice(i0, i1 + 1), inn = [];
        for (let i = i1; i >= i0; i--) {
            const k = Math.sin((Math.PI * (i - i0)) / (i1 - i0)), d = (L * (0.1 + 0.07 * rnd()) * k) / (Math.hypot(poly[i][0] - O[0], poly[i][1] - O[1]) || 1);
            inn.push([poly[i][0] + (O[0] - poly[i][0]) * d, poly[i][1] + (O[1] - poly[i][1]) * d]);
        }
        hatch(g, [...out, ...inn], axis + Math.PI / 2 + (rnd() - 0.5) * 0.5, field({ ...P, zones: [[1, B.lip, 0.04]], tone: P.tone + 0.08, base: 0, tip: 0, cast: 1.4, gleam: 0.7 }));
    }
    // A rolled lip: the petal's edge curled over, a crescent stitched across the roll.
    function lip(g, edge, c, w, B, P, rnd, lift = 0) {
        const m = edge.length - 1, inn = [];
        if (m < 3) return;
        for (let i = m; i >= 0; i--) {
            const k = Math.pow(Math.sin((Math.PI * i) / m), 0.7), d = Math.hypot(edge[i][0] - c[0], edge[i][1] - c[1]) || 1, q = (w * k + 0.35) / d;
            inn.push([edge[i][0] + (c[0] - edge[i][0]) * q, edge[i][1] + (c[1] - edge[i][1]) * q]);
        }
        const mid = edge[m >> 1], own = B.zones[B.zones.length - 1];
        // the underside of the petal: its own silk a tone up, or (one bloom in three) another
        fan(g, [...edge, ...inn], c, field({ ...P, axis: Math.atan2(mid[1] - c[1], mid[0] - c[0]), zones: [[1, B.own ? own[1] : B.lip, lift + (B.own ? own[2] + 0.12 : 0)]], tone: P.tone + 0.06, base: 0, tip: 0, sheen: 0.12, cast: 1.7, line: 0.9, gleam: 0.65 }));
    }
    // The heart of an open flower: filaments in straight stitches, anthers and carpels in knots.
    function heart(g, x, y, r, B, rnd, n = 18) {
        g.fillStyle = SILK.plum[0];
        g.beginPath();
        g.ellipse(x, y, r * 1.05, r, 0, 0, TAU);
        g.fill();
        const P = field({ zones: [[1, B.heart, 0]], tone: 0.42, cx: x, cy: y, R: r, rnd, sheen: 0, base: 0, tip: 0.2, flank: 0.2 });
        const list = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * TAU + rnd() * 0.3, r0 = r * (0.2 + rnd() * 0.2), r1 = r * (0.78 + rnd() * 0.42);
            thread(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, P, i);
            list.push(x + Math.cos(a) * r1, y + Math.sin(a) * r1, Math.max(0.9, r * (0.085 + rnd() * 0.05)));
        }
        lay(g, 0.9);
        knots(g, list, B.heart, 0.62);
        const eye = [];
        for (let i = 0; i < 3 + ((rnd() * 3) | 0); i++) eye.push(x + (rnd() - 0.5) * r * 0.42, y + (rnd() - 0.5) * r * 0.42, Math.max(1, r * 0.12));
        knots(g, eye, B.eye, 0.5);
    }
    // A thread come loose: it leaves its petal and lies in a curl on the cloth, its end frayed.
    function loose(g, x, y, r, sk, rnd) {
        const a = rnd() * TAU, p0 = pol(x, y, r * (0.55 + rnd() * 0.3), a), pts = [p0];
        let h = a + (rnd() - 0.5), px = p0[0], py = p0[1];
        const turn = rnd() < 0.5 ? 1 : -1;
        for (let i = 0; i < 9; i++) {
            h += turn * (rnd() - 0.2) * 0.8;
            px += Math.cos(h) * (4 + rnd() * 4);
            py += Math.sin(h) * (4 + rnd() * 4);
            pts.push([px, py]);
        }
        const c = S.curve(pts, false, 5), e = c[c.length - 1];
        g.lineCap = 'round';
        g.strokeStyle = CAST;
        g.lineWidth = 1;
        strokeLine(g, c, SX * 1.3, SY * 1.3);
        g.strokeStyle = sk[8];
        g.lineWidth = 0.8;
        strokeLine(g, c);
        g.lineWidth = 0.5;
        g.beginPath();
        for (const k of [-0.6, 0.5]) {
            g.moveTo(e[0], e[1]);
            g.lineTo(e[0] + Math.cos(h + k) * 3.2, e[1] + Math.sin(h + k) * 3.2);
        }
        g.stroke();
    }

    // A peony from above: four tiers of broad petals, each tier smaller and nearer the lamp
    // (the head is a bowl seen a little from one side), round a heart of stamens.
    function peony(g, o) {
        const { x, y, r } = o, rnd = Motion.rng('peony/' + o.seed), B = bloomOf(o, rnd);
        const tilt = rnd() * TAU, tl = r * (0.03 + rnd() * 0.035), rot = rnd() * TAU;
        // seen a little from one side: the head is squeezed along the way it leans
        const q = 0.8 + rnd() * 0.18, nx = Math.cos(tilt), ny = Math.sin(tilt);
        const sq = (p) => {
            const d = ((p[0] - x) * nx + (p[1] - y) * ny) * (1 - q);
            return [p[0] - nx * d, p[1] - ny * d];
        };
        shade(g, x, y, r * 0.93);
        const tiers = [[1, 7 + ((rnd() * 3) | 0)], [0.77, 6 + ((rnd() * 3) | 0)], [0.55, 5 + ((rnd() * 2) | 0)], [0.34, 4 + ((rnd() * 2) | 0)]];
        if (r < 34) tiers.splice(2, 1);
        const rims = [];
        tiers.forEach(([k, n], t) => {
            const cx = x + nx * tl * t, cy = y + ny * tl * t, R = r * k;
            const a0 = rot + t * 0.9 + rnd(), j0 = (rnd() * n) | 0;
            for (let j = 0; j < n; j++) {
                const axis = a0 + (((j + j0) % n) / n) * TAU + ((rnd() - 0.5) * 1.6) / n;
                const L = R * (0.9 + rnd() * 0.22) * 1.1, phi = (Math.PI / n) * (1.28 + rnd() * 0.36);
                const O = sq([cx - Math.cos(axis) * R * 0.1, cy - Math.sin(axis) * R * 0.1]);
                const poly = petalPoly(cx - Math.cos(axis) * R * 0.1, cy - Math.sin(axis) * R * 0.1, axis, L, phi, rnd, { ruffle: 0.05 + 0.02 * t, side: 0.64 + 0.05 * t }).map(sq);
                const P = field({ axis: Math.atan2(poly[12][1] - O[1], poly[12][0] - O[0]), zones: zonesOf(B, rnd, t * 0.03 + (rnd() - 0.5) * 0.06), cx: x, cy: y, R: r, rnd, line: 1.25 });
                fan(g, poly, O, P);
                if (t < 2 && r > 40 && rnd() < 0.3) fold(g, poly, O, axis, L, P, B, rnd);
                else if (t === 0 && r > 46 && rnd() < 0.6) rims.push(poly.slice(3 + ((rnd() * 4) | 0), poly.length - 3 - ((rnd() * 4) | 0)).map((p) => [p[0] + (O[0] - p[0]) * 0.035, p[1] + (O[1] - p[1]) * 0.035]));
            }
        });
        // a couched cord on some of the guard petals' edges
        for (const e of rims) if (e.length > 3) cord(g, e, B.heart === SILK.gold ? SILK.gold : SILK.ivory, { w: 1, tone: 6 });
        const last = tiers.length - 1;
        heart(g, x + nx * tl * last, y + ny * tl * last, r * 0.13, B, rnd, Math.round(clamp(r * 0.24, 8, 26)));
        if (r > 50 && rnd() < 0.16) loose(g, x, y, r, B.zones[B.zones.length - 1][1], rnd);
    }

    // A rose from above: guard petals round a spiral of cupped ones, each showing a crescent
    // over the next, every edge rolled into a lip that tapers to both its ends.
    function rose(g, o) {
        const { x, y, r } = o, rnd = Motion.rng('rose/' + o.seed), B = { ...bloomOf(o, rnd) };
        B.own = rnd() < 0.66;
        shade(g, x, y, r * 0.95, 4);
        const n = 5 + ((rnd() * 2) | 0), a0 = rnd() * TAU;
        for (let j = 0; j < n; j++) {
            const axis = a0 + (j / n) * TAU + ((rnd() - 0.5) * 1.2) / n, L = r * (0.94 + rnd() * 0.14) * 1.08, phi = (Math.PI / n) * (1.3 + rnd() * 0.3);
            const O = [x - Math.cos(axis) * r * 0.08, y - Math.sin(axis) * r * 0.08];
            const poly = petalPoly(O[0], O[1], axis, L, phi, rnd, { ruffle: 0.025, side: 0.78, notch: 0, cusp: 0.05 * rnd() });
            const P = field({ axis, zones: zonesOf(B, rnd, (rnd() - 0.5) * 0.06), cx: x, cy: y, R: r, rnd, base: 0.34, baseTo: 0.62 });
            fan(g, poly, O, P);
            if (r > 22) {
                const a = 2 + ((rnd() * 6) | 0), b = poly.length - 2 - ((rnd() * 6) | 0);
                lip(g, poly.slice(a, b), O, clamp(r * 0.075, 2.2, 6.5) * (0.7 + rnd() * 0.6), B, P, rnd, 0.02);
            }
        }
        // the cupped petals: each a broad shell set off the middle, turned two fifths of a
        // round from the last and a little smaller; only its lit lip and a crescent show
        const m = r < 30 ? 4 : 5 + ((rnd() * 2) | 0), turn = 2.25 + rnd() * 0.4;
        for (let i = 0; i < m; i++) {
            const k = i / (m - 1), rho = r * lerp(0.74, 0.27, Math.pow(k, 0.9)), axis = a0 + 1 + i * turn + (rnd() - 0.5) * 0.4, h = lerp(0.98, 1.3, k) + rnd() * 0.25;
            const off = rho * (0.3 - 0.12 * k), cx = x - Math.cos(axis) * off, cy = y - Math.sin(axis) * off;
            const arc = [], wob = rnd() * 6, cusp = 0.03 + rnd() * 0.07;
            for (let q = 0; q <= 18; q++) {
                const s = (q / 18) * 2 - 1;
                arc.push(pol(cx, cy, (rho + off) * (1 + 0.035 * Math.sin(s * 3.3 + wob) + cusp * Math.exp(-Math.pow(s / 0.2, 2))) * (0.72 + 0.28 * Math.pow(Math.max(0, Math.cos((s * Math.PI) / 2)), 0.7)), axis + s * h));
            }
            const P = field({ axis, zones: zonesOf(B, rnd, 0.02 + k * 0.05), cx: x, cy: y, R: r, rnd, base: 0.42, baseTo: 0.86, cast: 2.8 });
            fan(g, [pol(cx, cy, rho * 0.12, axis + Math.PI), ...arc], [cx, cy], P);
            if (rho > 7 && rnd() < 0.8) {
                const a = 1 + ((rnd() * 5) | 0), b = 18 - ((rnd() * 5) | 0);
                lip(g, arc.slice(a, b + 1), [cx, cy], clamp(rho * 0.16, 1.8, 5.5) * (0.7 + rnd() * 0.5), B, P, rnd, 0.02 + k * 0.05);
            }
        }
        // the furled middle: three small petals wrapped on themselves
        for (let i = 0; i < 3; i++) {
            const axis = a0 + 2 + i * 2.2, rho = r * (0.2 - i * 0.04), c = pol(x, y, rho * 0.3, axis + Math.PI), arc = [];
            for (let q = 0; q <= 10; q++) arc.push(pol(c[0], c[1], rho * 1.25 * (0.8 + 0.2 * Math.cos(((q / 10) * 2 - 1) * 1.5)), axis + ((q / 10) * 2 - 1) * 1.5));
            fan(g, [c, ...arc], c, field({ axis, zones: zonesOf(B, rnd, 0.1 + i * 0.03), cx: x, cy: y, R: r, rnd, base: 0.4, baseTo: 0.9, cast: 1.6, line: 1 }));
        }
        g.strokeStyle = VOID;
        g.lineWidth = 0.9;
        g.lineCap = 'round';
        const sp = [];
        for (let q = 0; q <= 8; q++) sp.push(pol(x, y, r * 0.012 + r * 0.05 * (q / 8), a0 + q * 0.7));
        strokeLine(g, sp);
        if (r > 50 && rnd() < 0.14) loose(g, x, y, r, B.lip, rnd);
    }

    // A peony half open, seen from the side: petals in three rows from the calyx, the back
    // row standing, the front ones wrapped round the bowl; sepals, a stalk.
    function cup(g, o) {
        const { x, y, r, rot } = o, rnd = Motion.rng('cup/' + o.seed), B = bloomOf(o, rnd), Lf = LEAF[o.hue ?? 'jade'];
        const H = r * 1.9, hx = x + Math.cos(rot) * r, hy = y + Math.sin(rot) * r;
        if (o.stalk !== 0) rope(g, S.curve([pol(x, y, r * (o.stalk ?? 1.3), rot + Math.PI + (rnd() - 0.5) * 0.9), pol(x, y, r * 0.55, rot + Math.PI + (rnd() - 0.5) * 0.3), [x, y]], false, 6), clamp(r * 0.11, 2, 3.6), Lf.stem, { rnd });
        shade(g, hx, hy, r * 0.9, 3.5, 0.26);
        const rows = [
            [[-0.5, 1, 0.3], [0.5, 0.98, 0.3], [-0.17, 1.08, 0.3], [0.17, 1.06, 0.3]],
            [[-0.86, 0.84, 0.36], [0.86, 0.82, 0.36]],
            [[-0.38, 0.72, 0.44], [0.4, 0.74, 0.44], [0.02, 0.58, 0.5]],
        ];
        rows.forEach((row, t) => row.forEach(([da, kl, phi]) => {
            const axis = rot + da + (rnd() - 0.5) * 0.12, L = H * kl * (0.94 + rnd() * 0.12), O = pol(x, y, -r * 0.06, axis);
            const poly = petalPoly(O[0], O[1], axis, L, phi * (0.95 + rnd() * 0.15), rnd, { ruffle: 0.05, side: 0.7 });
            const P = field({ axis, zones: zonesOf(B, rnd, t * 0.05 - 0.06), cx: hx, cy: hy, R: r * 1.2, rnd, baseTo: 0.55 });
            fan(g, poly, O, P);
            if (t > 0 && rnd() < 0.5) fold(g, poly, O, axis, L, P, B, rnd);
        }));
        for (const da of [-1.1, 1.1, -0.42, 0.44]) {
            const G = bladeGeom(x, y, rot + da * (0.9 + rnd() * 0.2), r * (0.62 + rnd() * 0.25), r * 0.34, { shape: 'ovate', bend: -da * 0.5 });
            blade(g, G, field({ zones: Lf.zones, cx: x, cy: y, R: r, rnd, slant: 0.7, rib: 0, cast: 1.4, line: 1, base: 0.1 }));
        }
    }

    // A chrysanthemum: three tiers of narrow keeled petals in fishbone, all curling one way.
    function mum(g, o) {
        const { x, y, r } = o, rnd = Motion.rng('mum/' + o.seed), B = bloomOf(o, rnd);
        const curl = (rnd() - 0.5) * 1.1, rot = rnd() * TAU;
        shade(g, x, y, r * 0.9, 3.5, 0.3);
        const tiers = r < 26 ? [[1, 11 + ((rnd() * 4) | 0)], [0.6, 8]] : [[1, 15 + ((rnd() * 6) | 0)], [0.74, 12 + ((rnd() * 4) | 0)], [0.48, 8 + ((rnd() * 3) | 0)]];
        tiers.forEach(([k, n], t) => {
            const R = r * k;
            for (let j = 0; j < n; j++) {
                const a = rot + t * 0.4 + (j / n) * TAU + ((rnd() - 0.5) * 1.2) / n, len = R * (0.78 + rnd() * 0.24), wid = Math.max(4.4, ((TAU * R * 0.62) / n) * (0.9 + rnd() * 0.3));
                const b = pol(x, y, R * 0.14, a);
                const G = bladeGeom(b[0], b[1], a - curl * 0.25, len, wid, { shape: 'spoon', bend: curl * (0.7 + rnd() * 0.6) });
                blade(g, G, field({ zones: zonesOf(B, rnd, t * 0.05 + (rnd() - 0.5) * 0.1), cx: x, cy: y, R: r, rnd, slant: 0.95, rib: 0.8, base: 0.26, baseTo: 0.6, cast: 1.6, line: 1.05, tipZones: null }));
            }
        });
        const list = [], hr = r * 0.17;
        g.fillStyle = SILK.plum[0];
        g.beginPath();
        g.arc(x, y, hr * 1.1, 0, TAU);
        g.fill();
        for (let i = 0; i < clamp(Math.round(r * 0.35), 6, 16); i++) {
            const a = i * 2.4, d = hr * Math.sqrt((i + 0.5) / 16);
            list.push(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.max(0.9, hr * 0.2));
        }
        knots(g, list, B.heart, 0.55);
    }

    // A small flower of four to six petals (plum blossom, primrose, jasmine): one skein.
    function floret(g, o) {
        const { x, y, r } = o, rnd = Motion.rng('floret/' + o.seed), B = bloomOf(o, rnd, SMALL);
        const kind = o.kind ?? (rnd() < 0.45 ? 'round' : rnd() < 0.5 ? 'notched' : 'star');
        const n = kind === 'star' ? 5 + ((rnd() * 2) | 0) : rnd() < 0.82 ? 5 : 4 + ((rnd() * 2) | 0) * 2, rot = o.rot ?? rnd() * TAU;
        const h = (Math.PI / n) * (kind === 'star' ? 0.62 : 0.9), polys = [], P = field({ zones: zonesOf(B, rnd, 0.05), cx: x, cy: y, R: r, rnd, base: 0.24, cast: 1.5, line: 1, sheen: 0.18 });
        for (let j = 0; j < n; j++) {
            const a = rot + (j / n) * TAU + (rnd() - 0.5) * 0.14, L = r * (0.9 + rnd() * 0.2), pts = [pol(x, y, r * 0.16, a - h * 0.6)];
            for (let i = 0; i <= 10; i++) {
                const s = (i / 10) * 2 - 1;
                let e = kind === 'star' ? 0.42 + 0.58 * Math.pow(1 - Math.abs(s), 0.8) : 0.76 + 0.24 * Math.pow(Math.max(0, Math.cos((s * Math.PI) / 2)), 0.5);
                if (kind === 'notched') e *= 1 - 0.16 * Math.exp(-Math.pow(s / 0.16, 2));
                pts.push(pol(x, y, L * e, a + s * h));
            }
            pts.push(pol(x, y, r * 0.16, a + h * 0.6));
            polys.push(pts);
        }
        under(g, polys, P);
        polys.forEach((p, j) => {
            P.axis = rot + (j / n) * TAU;
            fanThreads(p, [x, y], P);
        });
        lay(g, P.w);
        rim(g, polys, P);
        // the eye, and a plum blossom's long stamens
        g.fillStyle = SILK.plum[0];
        g.beginPath();
        g.arc(x, y, r * 0.2, 0, TAU);
        g.fill();
        const list = [];
        if (r > 10 && kind === 'round') {
            const m = 6 + ((rnd() * 4) | 0);
            g.strokeStyle = B.heart[6];
            g.lineWidth = 0.6;
            g.beginPath();
            for (let i = 0; i < m; i++) {
                const a = rnd() * TAU, d = r * (0.36 + rnd() * 0.22);
                g.moveTo(x, y);
                g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
                list.push(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.85);
            }
            g.stroke();
        }
        const m = r < 8 ? 1 : 3 + ((rnd() * 2) | 0);
        for (let i = 0; i < m; i++) list.push(x + (m > 1 ? Math.cos(i * 2.2) * r * 0.1 : 0), y + (m > 1 ? Math.sin(i * 2.2) * r * 0.1 : 0), Math.max(0.9, r * 0.085));
        knots(g, list, B.heart, 0.62);
    }

    // A bud about to open: two petals wrapped one over the other, sepals, a stalk. (x, y) is
    // its middle, `rot` where its tip points.
    function bud(g, o) {
        const { x, y, r, rot } = o, rnd = Motion.rng('bud/' + o.seed), B = bloomOf(o, rnd), L = LEAF[o.hue ?? 'jade'];
        const ca = Math.cos(rot), sa = Math.sin(rot), at = (u, v) => [x + ca * u * r - sa * v * r, y + sa * u * r + ca * v * r];
        const b = at(-1, 0);
        if (o.stalk !== 0) rope(g, S.curve([at(-1 - (o.stalk ?? 1.3), (rnd() - 0.5) * 0.8), at(-1.5, (rnd() - 0.5) * 0.3), b], false, 5), 2, L.stem, { rnd });
        const tear = S.curve([at(-1, 0), at(-0.55, -0.62), at(0.25, -0.6), at(1, 0), at(0.25, 0.6), at(-0.55, 0.62)], true, 6);
        const P = field({ axis: rot, zones: zonesOf(B, rnd), cx: x, cy: y, R: r, rnd, base: 0.2, cast: 1.8 });
        fan(g, tear, b, P);
        const sd = rnd() < 0.5 ? 1 : -1;
        const wrapP = S.curve([at(-0.95, 0.1 * sd), at(-0.3, 0.62 * sd), at(0.45, 0.5 * sd), at(0.86, 0.02 * sd), at(0.1, -0.12 * sd), at(-0.6, -0.2 * sd)], true, 6);
        fan(g, wrapP, b, field({ ...P, zones: zonesOf(B, rnd, 0.08), cast: 1.4 }));
        for (const s of [-1, 1]) {
            const G = bladeGeom(b[0], b[1], rot + s * (0.5 + rnd() * 0.2), r * (1 + rnd() * 0.4), r * 0.5, { shape: 'ovate', bend: -s * 0.5 });
            blade(g, G, field({ zones: L.zones, cx: x, cy: y, R: r, rnd, slant: 0.7, rib: 0, cast: 1.4, line: 1, base: 0.1 }));
        }
    }

    // ------------------------------------------------------------------ leaves
    const LEAF = {
        jade: { zones: [[0.5, SILK.jade, -0.03], [1, SILK.jade, 0.05]], tip: [[1, SILK.moss, 0.08]], stem: SILK.moss },
        teal: { zones: [[0.5, SILK.teal, -0.04], [1, SILK.jade, 0.04]], tip: [[1, SILK.teal, 0.1]], stem: SILK.jade },
        moss: { zones: [[0.55, SILK.jade, -0.05], [1, SILK.moss, 0.05]], tip: [[1, SILK.gold, 0]], stem: SILK.moss },
        blue: { zones: [[0.5, SILK.peri, -0.1], [1, SILK.teal, 0.04]], tip: [[1, SILK.jade, 0.08]], stem: SILK.teal },
        autumn: { zones: [[0.5, SILK.moss, -0.04], [1, SILK.gold, -0.04]], tip: [[1, SILK.wine, 0.1]], stem: SILK.gold },
    };
    const LEAVES = ['jade', 'jade', 'teal', 'moss', 'jade', 'blue', 'teal', 'autumn', 'moss', 'teal'];
    // One leaf from its base (x, y) along `a`.
    function leaf(g, o) {
        const rnd = Motion.rng('leaf/' + o.seed), L = LEAF[o.hue ?? LEAVES[(rnd() * LEAVES.length) | 0]];
        const smoothEdge = o.kind === 'smooth' || o.len < 20;
        const G = bladeGeom(o.x, o.y, o.a, o.len, o.wid, { bend: o.bend ?? 0, shape: o.shape ?? 'ovate', teeth: smoothEdge ? 0 : Math.max(4, Math.round(o.len / 8.5)), amp: 0.16 + rnd() * 0.1, asym: (rnd() - 0.5) * 0.24 });
        const mid = G.M[G.n >> 1];
        blade(g, G, field({ zones: L.zones, tone: 0.46 + (rnd() - 0.5) * 0.12, cx: mid[0], cy: mid[1], R: o.len * 0.5, rnd, slant: 0.66 + rnd() * 0.2, vein: o.len > 30 ? 4 : 0, tipZones: rnd() < 0.4 ? L.tip : null, tipFrom: 0.6 + rnd() * 0.25, flank: 0.1, base: 0.14, sheen: 0.24, rib: o.len > 16 ? 1.1 : 0.8 }));
        // an insect has been at one leaf in ten: a hole worn through, its lip in shadow
        if (o.len > 44 && rnd() < 0.1) {
            const f = G.n * (0.3 + rnd() * 0.4), m = along(G.M, f, G.n), e = along(rnd() < 0.5 ? G.L : G.R, f, G.n), k = 0.35 + rnd() * 0.4;
            const hx = m[0] + (e[0] - m[0]) * k, hy = m[1] + (e[1] - m[1]) * k, hr = 2.2 + rnd() * 2.2;
            const hole = S.curve(S.ellipse(hx, hy, hr * (1 + rnd() * 0.5), hr, 7, rnd() * 3).map(([px, py]) => [px + (rnd() - 0.5) * hr * 0.5, py + (rnd() - 0.5) * hr * 0.5]), true, 4);
            g.fillStyle = VOID;
            traceAll(g, [hole]);
            g.fill();
            g.save();
            g.clip();
            g.fillStyle = groundAt(hx, hy);
            traceAll(g, [hole], SX * 1, SY * 1);
            g.fill();
            g.restore();
        } else if (o.len > 40 && rnd() < 0.07) {
            // or a fly has lit on it: two knots, two gauze wings
            const m = along(G.M, G.n * (0.35 + rnd() * 0.3), G.n), a = rnd() * TAU, hd = pol(m[0], m[1], 2.6, a);
            g.strokeStyle = SILK.ivory[8];
            g.lineWidth = 0.6;
            for (const sd of [-1, 1]) {
                const c = pol(m[0], m[1], 3.4, a + Math.PI + sd * 0.6);
                g.fillStyle = S.rgba(SILK.ivory[7], 0.45);
                g.beginPath();
                g.ellipse(c[0], c[1], 3.6, 1.5, a + Math.PI + sd * 0.6, 0, TAU);
                g.fill();
                g.stroke();
            }
            knots(g, [m[0], m[1], 1.7, hd[0], hd[1], 1.2], SILK.plum, 0.2);
        }
    }
    // A fern frond: a stalk that curls at its tip, pinnae in pairs, smaller and smaller.
    function fern(g, o) {
        const rnd = Motion.rng('fern/' + o.seed), L = LEAF[o.hue ?? (rnd() < 0.5 ? 'jade' : 'teal')];
        const n = Math.max(8, Math.round(o.len / 5.5)), M = [[o.x, o.y]], bend = o.bend ?? (rnd() - 0.5) * 1.6;
        let x = o.x, y = o.y;
        for (let i = 1; i <= n; i++) {
            const v = i / n, a = o.a + bend * v * v + (v > 0.82 ? (v - 0.82) * 9 * Math.sign(bend || 1) : 0);
            x += (Math.cos(a) * o.len) / n;
            y += (Math.sin(a) * o.len) / n;
            M.push([x, y]);
        }
        const polys = [], lights = [], darks = [];
        for (let i = 1; i < n; i++) {
            const v = i / n, p = M[i], q = M[i + 1], ta = Math.atan2(q[1] - p[1], q[0] - p[0]);
            const pl = o.len * 0.24 * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.6)), 0.8) * (0.85 + rnd() * 0.3);
            if (pl < 3) continue;
            for (const s of [-1, 1]) {
                const a = ta + s * (1.05 + rnd() * 0.2), t = pol(p[0], p[1], pl, a), w = Math.max(1.3, pl * 0.17);
                const nx = -Math.sin(a) * w, ny = Math.cos(a) * w, c = pol(p[0], p[1], pl * 0.45, a);
                polys.push([[p[0], p[1]], [c[0] + nx, c[1] + ny], t, [c[0] - nx, c[1] - ny]]);
                const lit = -(nx * SX + ny * SY) > 0 ? 1 : -1;
                lights.push(p[0] + nx * 0.4 * lit, p[1] + ny * 0.4 * lit, t[0], t[1]);
                darks.push(p[0] - nx * 0.4 * lit, p[1] - ny * 0.4 * lit, t[0], t[1]);
            }
        }
        if (!polys.length) return;
        g.fillStyle = CAST;
        traceAll(g, polys, SX * 1.5, SY * 1.5);
        g.fill();
        g.fillStyle = L.zones[0][1][3];
        traceAll(g, polys);
        g.fill();
        segs(g, lights, L.zones[1][1][6], 0.9);
        segs(g, darks, L.zones[0][1][1], 0.9);
        g.strokeStyle = VOID;
        g.lineWidth = 0.7;
        traceAll(g, polys);
        g.stroke();
        rope(g, M, 1.7, L.stem, { rnd, tone: 0.55, cast: 0 });
    }
    // A tendril: a couched thread that winds into a curl.
    function tendril(g, o) {
        const rnd = Motion.rng('tendril/' + o.seed), pts = [], turns = 1.2 + rnd() * 1.3, sg = rnd() < 0.5 ? 1 : -1, n = 30;
        let x = o.x, y = o.y;
        for (let i = 0; i <= n; i++) {
            const v = i / n, a = o.a + sg * turns * TAU * v * v;
            pts.push([x, y]);
            x += Math.cos(a) * (o.len / n) * (1.25 - v);
            y += Math.sin(a) * (o.len / n) * (1.25 - v);
        }
        cord(g, pts, o.gold ? SILK.gold : SILK.jade, { w: 1, tone: 6, every: 4 });
    }
    // Berries: a few seed knots on hair stalks, in a hole too small for anything else.
    function dots(g, o) {
        const rnd = Motion.rng('dots/' + o.seed), list = [], n = 3 + ((rnd() * 3) | 0), sk = [SILK.gold, SILK.ivory, SILK.coral, SILK.peri][(rnd() * 4) | 0], a0 = rnd() * TAU;
        const b = pol(o.x, o.y, o.r * 0.8, a0 + Math.PI);
        g.strokeStyle = SILK.moss[5];
        g.lineWidth = 0.7;
        g.beginPath();
        for (let i = 0; i < n; i++) {
            const p = pol(o.x, o.y, o.r * (0.2 + rnd() * 0.6), a0 + (i - (n - 1) / 2) * 0.7);
            g.moveTo(b[0], b[1]);
            g.lineTo(p[0], p[1]);
            list.push(p[0], p[1], 1.3 + rnd() * 0.9);
        }
        g.stroke();
        knots(g, list, sk, 0.56);
    }
    // A spray: a twig with small flowers, buds and leaflets, alternately on either side.
    function spray(g, o) {
        const rnd = Motion.rng('spray/' + o.seed), L = LEAF[o.hue ?? 'jade'], pts = walk(S.curve(o.pts, false, 8), 3);
        const bloom = o.bloom ?? ['ivory', 'ivory', 'coral', 'peri', 'gold', 'rose'][(rnd() * 6) | 0], kind = rnd() < 0.5 ? 'star' : rnd() < 0.5 ? 'round' : 'notched';
        rope(g, pts, 1.9, L.stem, { rnd, tone: 0.5 });
        const later = [];
        let sd = rnd() < 0.5 ? 1 : -1;
        for (let i = 3 + ((rnd() * 3) | 0); i < pts.length; i += 5 + ((rnd() * 3) | 0)) {
            const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], pp = pts[i - 1], ta = Math.atan2(q[1] - pp[1], q[0] - pp[0]);
            const a = ta + sd * (0.75 + rnd() * 0.5), last = i + 5 >= pts.length, pick = rnd();
            sd = -sd;
            if (pick < 0.38 && !last) leaf(g, { x: p[0], y: p[1], a, len: 14 + rnd() * 12, wid: 6.5 + rnd() * 3.5, bend: (rnd() - 0.5) * 0.8, hue: o.hue, seed: o.seed + 'l' + i, kind: 'smooth' });
            else {
                const d = 8 + rnd() * 7, c = pol(p[0], p[1], d, a);
                g.strokeStyle = L.stem[5];
                g.lineWidth = 0.9;
                g.beginPath();
                g.moveTo(p[0], p[1]);
                g.lineTo(c[0], c[1]);
                g.stroke();
                if (pick < 0.56) later.push(() => bud(g, { x: c[0] + Math.cos(a) * 3, y: c[1] + Math.sin(a) * 3, r: 3.8 + rnd() * 2.2, rot: a, bloom, hue: o.hue, seed: o.seed + 'b' + i, stalk: 0 }));
                else later.push(() => floret(g, { x: c[0], y: c[1], r: 8 + rnd() * 6, bloom, kind, seed: o.seed + 'f' + i }));
            }
        }
        for (const f of later) f();
    }
    // A bough of plum blossom: old wood that changes its mind at every node, spurs with
    // blossoms open and in bud, hardly a leaf.
    function bough(g, o) {
        const rnd = Motion.rng('bough/' + o.seed), pts = walk(S.curve(o.pts, false, 4), 3);
        const bloom = o.bloom ?? ['ivory', 'coral', 'rose', 'ivory', 'peri'][(rnd() * 5) | 0], n = pts.length;
        const half = Math.floor(n * 0.5);
        rope(g, pts.slice(0, half + 2), 4.2, SILK.gold, { rnd, tone: 0.34 });
        rope(g, pts.slice(half), 2.8, SILK.gold, { rnd, tone: 0.36 });
        const later = [];
        let sd = rnd() < 0.5 ? 1 : -1;
        for (let i = 4; i < n - 1; i += 4 + ((rnd() * 4) | 0)) {
            const p = pts[i], ta = Math.atan2(pts[i + 1][1] - pts[i - 1][1], pts[i + 1][0] - pts[i - 1][0]), a = ta + sd * (0.7 + rnd() * 0.7), d = 9 + rnd() * 14, c = pol(p[0], p[1], d, a);
            sd = rnd() < 0.75 ? -sd : sd;
            wire(g, [p, pol(p[0], p[1], d * 0.5, a + (rnd() - 0.5) * 0.5), c], SILK.gold[3], 1.5);
            const pick = rnd();
            if (pick < 0.62) later.push(() => floret(g, { x: c[0], y: c[1], r: 8.5 + rnd() * 6, bloom, kind: 'round', seed: o.seed + 'f' + i }));
            else if (pick < 0.86) later.push(() => knots(g, [c[0], c[1], 2.2 + rnd(), c[0] + Math.cos(a + 1) * 4.5, c[1] + Math.sin(a + 1) * 4.5, 1.6], BLOOM[bloom].zones[1][1], 0.55));
            else leaf(g, { x: c[0], y: c[1], a, len: 14 + rnd() * 8, wid: 6 + rnd() * 2, hue: 'moss', seed: o.seed + 'l' + i, kind: 'smooth' });
        }
        for (const f of later) f();
    }

    // A butterfly, its head along `rot`: four wings stitched from the body out in bands (a
    // dark root, the colour, a row of pale spots, a dark margin), a body, two feelers.
    function butterfly(g, o) {
        const { x, y, r, rot } = o, rnd = Motion.rng('fly/' + o.seed);
        const hue = [SILK.gold, SILK.peri, SILK.coral, SILK.ivory, SILK.teal, SILK.rose][(rnd() * 6) | 0], open = 0.95 + rnd() * 0.3;
        const wings = [];
        for (const sd of [-1, 1]) {
            wings.push({ axis: rot + sd * (Math.PI - 0.95 * open), L: r * 0.72, phi: 0.62, sd, hind: true });
            wings.push({ axis: rot + sd * (1.0 * open), L: r, phi: 0.5, sd, hind: false });
        }
        wings.sort((a, b) => (a.hind ? 0 : 1) - (b.hind ? 0 : 1));
        const spots = [], tails = rnd() < 0.6;
        for (const w of wings) {
            const pts = [[x, y]];
            for (let i = 0; i <= 14; i++) {
                const s = (i / 14) * 2 - 1, lead = s * w.sd;
                let e = 0.62 + 0.38 * Math.pow(Math.max(0, Math.cos((s * Math.PI) / 2)), 0.6) + (w.hind ? 0.05 * Math.sin(s * 9) : -0.1 * lead);
                if (w.hind && tails && Math.abs(s + 0.5 * w.sd) < 0.12) e *= 1.3;
                pts.push(pol(x, y, w.L * e, w.axis + s * w.phi));
            }
            fan(g, pts, [x, y], field({ axis: w.axis, zones: [[0.22, SILK.plum, -0.15], [0.66, hue, 0.04], [0.84, w.hind ? SILK.ivory : hue, 0.14], [1, SILK.plum, -0.12]], cx: x, cy: y, R: r, rnd, base: 0.1, cast: 1.8, line: 1.05, ls: 0.05 }));
            for (let i = 0; i < 4; i++) spots.push(...pol(x, y, w.L * 0.86, w.axis + (i - 1.5) * w.phi * 0.42), Math.max(0.8, r * 0.035));
        }
        knots(g, spots, SILK.ivory, 0.6);
        const body = [], ca = Math.cos(rot), sa = Math.sin(rot);
        for (let i = 0; i <= 10; i++) {
            const v = i / 10, w = r * 0.07 * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.6)), 0.7) + 0.5, u = r * (0.42 - v * 0.95);
            body.push([x + ca * u - sa * w, y + sa * u + ca * w]);
            body.unshift([x + ca * u + sa * w, y + sa * u - ca * w]);
        }
        hatch(g, body, rot + Math.PI / 2, field({ zones: [[0.5, SILK.plum, 0], [1, SILK.gold, 0]], across: true, ls: 0.2, cx: x, cy: y, R: r * 0.4, rnd, cast: 1.2, sheen: 0, base: 0, gap: 1.2 }));
        const head = pol(x, y, r * 0.45, rot), list = [head[0], head[1], Math.max(1, r * 0.06)];
        g.strokeStyle = SILK.gold[6];
        g.lineWidth = 0.7;
        g.lineCap = 'round';
        for (const sd of [-1, 1]) {
            const a = S.curve([head, pol(head[0], head[1], r * 0.3, rot + sd * 0.35), pol(head[0], head[1], r * 0.55, rot + sd * 0.75)], false, 5);
            strokeLine(g, a);
            list.push(a[a.length - 1][0], a[a.length - 1][1], 0.9);
        }
        knots(g, list, SILK.gold, 0.6);
    }

    // A dragonfly, its head along `rot`: four gauze wings (their floss laid thin, the cloth
    // showing through), a long jointed tail, two bead eyes. r: the length of a forewing.
    function dragonfly(g, o) {
        const { x, y, r, rot } = o, rnd = Motion.rng('dfly/' + o.seed), sk = [SILK.teal, SILK.peri, SILK.coral, SILK.gold][(rnd() * 4) | 0];
        for (const [da, kl] of [[2.05, 0.86], [-2.05, 0.86], [1.42, 1], [-1.42, 1]]) {
            const G = bladeGeom(x, y, rot + da + (rnd() - 0.5) * 0.14, r * kl, r * 0.27, { shape: 'spoon', bend: Math.sign(da) * 0.12 });
            g.fillStyle = 'rgba(7,8,24,0.28)';
            traceAll(g, [G.poly], SX * 1.6, SY * 1.6);
            g.fill();
            g.fillStyle = S.rgba(SILK.ivory[4], 0.6);
            traceAll(g, [G.poly]);
            g.fill();
            bladeThreads(G, field({ zones: [[0.6, SILK.ivory, 0.2], [1, SILK.peri, 0.2]], cx: x, cy: y, R: r, rnd, slant: 1.1, gap: 2.2, base: 0, sheen: 0, tipZones: [[1, sk, 0.16]], tipFrom: 0.8 }), null);
            lay(g, 0.85);
            wire(g, G.M, SILK.ivory[8], 0.7, { void: 0 });
            g.strokeStyle = VOID;
            g.lineWidth = 1;
            traceAll(g, [G.poly]);
            g.stroke();
        }
        // the tail: a rope of rings; the thorax and the eyes in knots
        const tail = [];
        for (let i = 0; i <= 12; i++) tail.push(pol(x, y, r * 0.12 + (r * 1.35 * i) / 12, rot + Math.PI + 0.25 * Math.sin(i / 5)));
        rope(g, tail, Math.max(2, r * 0.1), sk, { rnd, tone: 0.56, step: 1.9 });
        knots(g, [x, y, Math.max(2.2, r * 0.13), ...pol(x, y, r * 0.2, rot), Math.max(1.8, r * 0.1)], sk, 0.56);
        knots(g, [...pol(x, y, r * 0.3, rot + 0.5), Math.max(1.1, r * 0.07), ...pol(x, y, r * 0.3, rot - 0.5), Math.max(1.1, r * 0.07)], SILK.gold, 0.66);
    }

    // ------------------------------------------------------------------ birds
    // One small feather lying over the one behind it: a fan from its root, pointing along a.
    function scale(g, x, y, a, sz, P) {
        const pts = [pol(x, y, sz * 0.25, a + Math.PI)];
        for (let i = 0; i <= 6; i++) {
            const s = (i / 6) * 2 - 1;
            pts.push(pol(x, y, sz * (0.78 + 0.22 * Math.cos((s * Math.PI) / 2)), a + s * 0.82));
        }
        P.axis = a;
        fan(g, pts, [x - Math.cos(a) * sz * 0.2, y - Math.sin(a) * sz * 0.2], P);
    }
    // An eye: a ring of pale silk, a dark knot, a glint.
    function eye(g, p, r) {
        g.fillStyle = SILK.ivory[8];
        g.beginPath();
        g.arc(p[0], p[1], r * 1.55, 0, TAU);
        g.fill();
        g.fillStyle = VOID;
        g.beginPath();
        g.arc(p[0], p[1], r, 0, TAU);
        g.fill();
        g.fillStyle = '#9d9bb8';
        g.beginPath();
        g.arc(p[0] - SX * r * 0.4, p[1] - SY * r * 0.4, r * 0.34, 0, TAU);
        g.fill();
    }
    const PLUMAGE = [
        { back: SILK.teal, wing: SILK.plum, breast: SILK.coral, face: SILK.ivory, crown: SILK.peri },
        { back: SILK.peri, wing: SILK.teal, breast: SILK.gold, face: SILK.ivory, crown: SILK.wine },
        { back: SILK.moss, wing: SILK.plum, breast: SILK.ivory, face: SILK.gold, crown: SILK.teal },
        { back: SILK.wine, wing: SILK.plum, breast: SILK.rose, face: SILK.ivory, crown: SILK.gold },
        { back: SILK.plum, wing: SILK.teal, breast: SILK.ivory, face: SILK.coral, crown: SILK.peri },
    ];
    // A songbird on its twig, feather by feather: tail quills, breast and back in rows of
    // small feathers, the folded wing's coverts and flights, a head with its eye, bill, legs.
    function songbird(g, o) {
        const s = o.s ?? 1, rnd = Motion.rng('bird/' + o.seed), T = frame(o.x, o.y, o.rot ?? 0, s, o.flip), C = PLUMAGE[o.plumage ?? (rnd() * PLUMAGE.length) | 0];
        const F = (zones, extra) => field({ zones, cx: o.x, cy: o.y, R: 24 * s, rnd, ...extra });
        shade(g, o.x, o.y, 15 * s, 4, 0.3);
        if (o.perch !== false) {
            rope(g, walk(S.curve(T.all([[-40, 23], [-14, 18.6], [8, 18], [34, 14.5]]), false, 8), 3), 2.6, SILK.moss, { rnd });
            const e = T(33, 14.5), b = T(-38, 22.6);
            leaf(g, { x: e[0], y: e[1], a: T.ang(-0.5), len: 19 * s, wid: 8.5 * s, hue: 'jade', seed: o.seed + 'la', kind: 'smooth' });
            leaf(g, { x: b[0], y: b[1], a: T.ang(Math.PI - 0.5), len: 17 * s, wid: 8 * s, hue: 'teal', seed: o.seed + 'lb', kind: 'smooth' });
        }
        // the tail: four quills from the rump, the outer pair under
        const rump = T(-15, 3);
        for (const k of [0, 3, 1, 2]) {
            const G = bladeGeom(rump[0], rump[1], T.ang(Math.PI - 0.26 + k * 0.11), (27 + [2, 6, 5, 0][k] + rnd() * 3) * s, 6.2 * s, { shape: 'quill', bend: T.f * 0.1 });
            blade(g, G, F([[0.5, C.wing, -0.04], [1, C.back, 0.04]], { slant: 0.6, cast: 1.5, line: 1, tipZones: [[1, SILK.ivory, -0.12]], tipFrom: 0.88, base: 0.1 }));
        }
        // legs and toes, on the twig
        for (const [u, v] of [[1.5, 11], [-4.5, 11.4]]) {
            const foot = T(u + 1, 17.4);
            wire(g, [T(u, v), T(u + 1.6, 14.4), foot], SILK.gold[5], 1.1);
            for (const d of [-2.6, 0.3, 2.8]) wire(g, [foot, T(u + 1 + d, 18.4 + Math.abs(d) * 0.2)], SILK.gold[6], 0.8, { void: 0 });
        }
        // the body: rows of small feathers from the tail forward, the breast in another silk
        const body = S.curve(T.all([[15, -7], [18.5, 0], [14.5, 8], [4, 12.5], [-8, 11.5], [-17, 6.5], [-19.5, 1.5], [-12, -5], [0, -9.5]]), true, 6);
        const PB = F([[1, C.breast, 0]], { cast: 2.4 });
        under(g, [body], PB);
        g.save();
        traceAll(g, [body]);
        g.clip();
        let row = 0;
        for (let u = -22; u <= 19; u += 4.2, row++) for (let v = -11 + (row & 1) * 2.3; v <= 14; v += 4.6) {
            const c = T(u + (rnd() - 0.5), v + (rnd() - 0.5)), back = v < 2.5 - u * 0.12 + (rnd() - 0.5) * 3;
            scale(g, c[0], c[1], T.ang(Math.PI - 0.12 + v * 0.02), 5.2 * s, F([[0.55, back ? C.wing : C.breast, -0.06], [1, back ? C.back : C.breast, 0.08]], { cast: 1, line: 0.8, base: 0.2, gleam: 0.4, tone: back ? 0.44 : 0.5 }));
        }
        g.restore();
        rim(g, [body], { ...PB, gleam: 0 });
        // the folded wing: flights, the lowest first, then two rows of coverts over their roots
        for (let k = 4; k >= 0; k--) {
            const b = T(4 - k * 2.1, -1.2 + k * 1.1);
            const G = bladeGeom(b[0], b[1], T.ang(Math.PI - 0.02 - k * 0.07), (15 + k * 3.3) * s, 5.2 * s, { shape: 'quill', bend: T.f * -0.08 });
            blade(g, G, F([[0.5, C.wing, -0.06], [1, C.wing, 0.06]], { slant: 0.58, cast: 1.5, line: 1, tipZones: [[1, SILK.ivory, -0.06]], tipFrom: 0.84, base: 0.1 }));
        }
        for (const [u, v, gold] of [[-2, 0.5, 0], [1.5, 1.6, 0], [3.5, -1.4, 0], [0.4, -2.6, 1], [5.6, -3.6, 1], [7.4, -0.6, 1]]) {
            const c = T(u, v);
            scale(g, c[0], c[1], T.ang(Math.PI - 0.1), 5.6 * s, F([[1, gold ? SILK.gold : C.back, 0.04]], { cast: 1.2, line: 0.85, base: 0.2 }));
        }
        // the head, stitched back from the bill; a cheek patch; the bill; the eye
        const hc = T(16.5, -12.5), head = S.ellipse(hc[0], hc[1], 7.9 * s, 7.3 * s, 20, T.ang(0));
        fan(g, head, T(22.6, -12.3), F([[0.42, C.face, 0], [1, C.crown, 0]], { axis: T.ang(Math.PI), full: true, cast: 2, base: 0.05, ls: 0.07 }));
        // the stripe through the eye, from the bill to the nape
        wire(g, S.curve([T(22.4, -13), T(19.3, -14.3), T(15, -14.6), T(11, -12.6)], false, 5), SILK.plum[1], 1.3 * s, { void: 0 });
        const sing = o.sing ?? rnd() < 0.4;
        hatch(g, T.all(sing ? [[22.7, -11.6], [28.6, -7.8], [22.2, -9.4]] : [[22.7, -11.5], [29.6, -10.9], [22.4, -9.5]]), T.ang(0.3), F([[1, SILK.gold, -0.14]], { cast: 1, sheen: 0, base: 0, gap: 1.1, line: 0.9 }));
        hatch(g, T.all([[22.4, -15], [31.6, -12.1], [22.9, -11.4]]), T.ang(0.15), F([[1, SILK.gold, 0.06]], { cast: 1, sheen: 0, base: 0, gap: 1.1, line: 0.9 }));
        eye(g, T(19.3, -13.9), 1.5 * s);
    }

    // The paths of a long-tailed bird's train feathers, on the cloth, the outer ones first.
    function trainOf(o) {
        const s = o.s ?? 1, rnd = Motion.rng('train/' + o.seed), T = frame(o.x, o.y, o.rot ?? 0, s, o.flip), n = 9 + ((rnd() * 3) | 0), sag = o.sag ?? 0.5, out = [];
        for (let j = 0; j < n; j++) {
            const k = j / (n - 1) - 0.5, L = (182 + 78 * Math.cos(Math.PI * k) * (0.85 + rnd() * 0.3)) * (o.train ?? 1), h0 = Math.PI + k * 0.62, sg = sag * (0.7 + rnd() * 0.6) + k * 0.25, ph = rnd() * 6, wv = 0.07 + rnd() * 0.09, N = 44;
            const pts = [[-16, 2]];
            let u = -16, v = 2;
            for (let i = 1; i <= N; i++) {
                const q = i / N, h = h0 - sg * Math.pow(q, 1.3) + wv * Math.sin(q * 5.5 + ph);
                u += (Math.cos(h) * L) / N;
                v += (Math.sin(h) * L) / N;
                pts.push([u, v]);
            }
            out.push({ pts: T.all(pts), k: Math.abs(k) });
        }
        return out.sort((a, b) => b.k - a.k);
    }
    // A long-tailed bird in the Canton manner (half peacock, half phoenix): a train of
    // feathers with loose barbs and an eye at the end of each, a body of small feathers, a
    // folded wing, a long neck, a crested head.
    function peafowl(g, o) {
        const s = o.s ?? 1, rnd = Motion.rng('fowl/' + o.seed), T = frame(o.x, o.y, o.rot ?? 0, s, o.flip), pose = o.pose ?? 0;
        const F = (zones, extra) => field({ zones, cx: o.x, cy: o.y, R: 40 * s, rnd, ...extra });
        // the train
        const PBarb = F([[0.5, SILK.jade, -0.04], [1, SILK.teal, 0.1]], { base: 0, tip: 0.1, sheen: 0, an: 0.6, flank: 0 });
        const PGold = F([[1, SILK.gold, 0]], { base: 0, sheen: 0, an: 0.6, flank: 0 });
        for (const f of trainOf(o)) {
            const st = walk(f.pts, 2.3 * Math.max(0.8, s)), m = st.length;
            g.lineCap = 'round';
            g.lineJoin = 'round';
            g.strokeStyle = 'rgba(7,8,24,0.2)';
            g.lineWidth = 14 * s;
            if (m > 30) strokeLine(g, st.slice(Math.round(m * 0.3), m - 2), SX * 2, SY * 2);
            for (let i = 5; i < m - 6; i++) {
                const p = st[i], q = st[i + 1], ta = Math.atan2(q[1] - p[1], q[0] - p[0]), k = i / m, bl = (7 + 7 * Math.sin(Math.PI * Math.pow(k, 0.8))) * s;
                for (const sd of [-1, 1]) {
                    const a = ta + sd * (0.52 + rnd() * 0.16), l = bl * (0.75 + rnd() * 0.5);
                    thread(p[0], p[1], p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l, i % 6 === 0 ? PGold : PBarb, i);
                }
            }
            lay(g, 0.95);
            wire(g, st.slice(0, m - 4), SILK.gold[5], 0.9);
            // the eye of the feather: a fringe, an oval of gold, one of teal, a dark heart
            const E = st[m - 7], ta = Math.atan2(st[m - 5][1] - st[m - 9][1], st[m - 5][0] - st[m - 9][0]), b = pol(E[0], E[1], -7 * s, ta);
            for (let i = 0; i < 46; i++) {
                const a = ta + (i / 46 - 0.5) * 5.2, r0 = 6 * s, r1 = (11.5 + rnd() * 3.5) * s * (0.8 + 0.2 * Math.cos(a - ta));
                thread(E[0] + Math.cos(a) * r0, E[1] + Math.sin(a) * r0, E[0] + Math.cos(a) * r1, E[1] + Math.sin(a) * r1, i % 5 === 0 ? PGold : PBarb, i);
            }
            lay(g, 0.95);
            fan(g, S.ellipse(E[0], E[1], 8.6 * s, 7 * s, 18, ta), b, F([[1, SILK.gold, 0.02]], { axis: ta, cast: 1.6, base: 0.2, line: 1 }));
            const e2 = pol(E[0], E[1], 1.3 * s, ta);
            fan(g, S.ellipse(e2[0], e2[1], 6.2 * s, 5 * s, 16, ta), b, F([[0.6, SILK.teal, 0.04], [1, SILK.jade, 0.14]], { axis: ta, cast: 1, base: 0.1, line: 0.9 }));
            const e3 = pol(E[0], E[1], 2.4 * s, ta), ht = S.ellipse(e3[0], e3[1], 3.5 * s, 3 * s, 12, ta);
            ht[0] = pol(e3[0], e3[1], 1.6 * s, ta);
            fan(g, ht, pol(e3[0], e3[1], -3 * s, ta), F([[1, SILK.plum, -0.16]], { axis: ta, cast: 0, base: 0, line: 0.8, gleam: 0.8, gleamCol: SILK.peri[8] }));
        }
        // legs, and the bough it stands on
        if (o.perch !== false) rope(g, walk(S.curve(T.all([[-46, 37], [-14, 33], [14, 32.5], [52, 27]]), false, 8), 3), 3.6, SILK.gold, { rnd, tone: 0.36 });
        for (const [u, v] of [[3, 13], [-7, 13.4]]) {
            const foot = T(u + 2.5, 31.5);
            wire(g, [T(u, v), T(u + 3.6, 23), foot], SILK.gold[5], 1.5);
            for (const d of [-4.5, 0.5, 5]) wire(g, [foot, T(u + 2.5 + d, 33 + Math.abs(d) * 0.2)], SILK.gold[6], 1, { void: 0 });
        }
        // the body, in rows of small feathers
        const body = S.curve(T.all([[20, -6], [24, 2], [18, 11], [4, 15], [-12, 12], [-22, 6], [-24, 0], [-14, -8], [2, -12], [14, -11]]), true, 6);
        const PB = F([[1, SILK.peri, -0.1]], { cast: 3 });
        shade(g, o.x, o.y, 20 * s, 5, 0.3);
        under(g, [body], PB);
        g.save();
        traceAll(g, [body]);
        g.clip();
        let row = 0;
        for (let u = -27; u <= 25; u += 4.8, row++) for (let v = -13 + (row & 1) * 2.6; v <= 16; v += 5.2) {
            const c = T(u + (rnd() - 0.5), v + (rnd() - 0.5)), rumpy = u < -6 + (rnd() - 0.5) * 6;
            scale(g, c[0], c[1], T.ang(Math.PI - 0.1 + v * 0.015), 6 * s, F(rumpy ? [[0.6, SILK.jade, -0.04], [1, SILK.gold, 0]] : [[0.55, SILK.plum, -0.04], [1, SILK.peri, 0.1]], { cast: 1, line: 0.8, base: 0.2, gleam: 0.45 }));
        }
        g.restore();
        rim(g, [body], { ...PB, gleam: 0 });
        // the wing: flights, then barred coverts
        for (let k = 5; k >= 0; k--) {
            const b = T(6 - k * 2.6, -2 + k * 1.3);
            const G = bladeGeom(b[0], b[1], T.ang(Math.PI + 0.06 - k * 0.06), (22 + k * 3.2) * s, 6.4 * s, { shape: 'quill', bend: T.f * -0.1 });
            blade(g, G, F([[0.5, SILK.plum, -0.04], [1, SILK.wine, 0.08]], { slant: 0.58, cast: 1.6, line: 1, tipZones: [[1, SILK.ivory, -0.1]], tipFrom: 0.86, base: 0.1 }));
        }
        for (const [u, v, k] of [[-5, 1, 0], [-1, 2.4, 1], [3, 2.6, 0], [-2.5, -2.4, 1], [1.6, -1.6, 0], [5.6, -1, 1], [0, -5.6, 0], [4.4, -5.4, 1], [8.6, -4.6, 0], [9.6, -0.4, 1]]) {
            const c = T(u, v);
            scale(g, c[0], c[1], T.ang(Math.PI - 0.05), 6.4 * s, F([[0.5, k ? SILK.wine : SILK.gold, -0.04], [1, SILK.gold, 0.06]], { cast: 1.2, line: 0.85, base: 0.2 }));
        }
        // the neck: a long S of small feathers, lapping downwards
        const nk = walk(S.curve(T.all(pose ? [[13, -7], [24, -19], [24, -34], [13, -45]] : [[13, -7], [22, -21], [23.5, -36], [30, -48]]), false, 10), 3.1 * s), nn = nk.length;
        const band = [], bandR = [];
        for (let i = 0; i < nn; i++) {
            const p = nk[Math.max(0, i - 1)], q = nk[Math.min(nn - 1, i + 1)], tl = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, w = lerp(7.2, 3.5, i / (nn - 1)) * s;
            band.push([nk[i][0] + ((q[1] - p[1]) / tl) * w, nk[i][1] - ((q[0] - p[0]) / tl) * w]);
            bandR.unshift([nk[i][0] - ((q[1] - p[1]) / tl) * w, nk[i][1] + ((q[0] - p[0]) / tl) * w]);
        }
        const neck = [...band, ...bandR], PN = F([[1, SILK.peri, -0.08]], { cast: 2.4 });
        under(g, [neck], PN);
        g.save();
        traceAll(g, [neck]);
        g.clip();
        for (let i = 0; i < nn - 1; i++) {
            const p = nk[i], q = nk[i + 1], down = Math.atan2(p[1] - q[1], p[0] - q[0]), w = lerp(7.2, 3.5, i / (nn - 1)) * s, m = w > 5 * s ? 3 : 2;
            for (let j = 0; j < m; j++) {
                const off = ((j + 0.5) / m - 0.5) * 2 * w * 0.8 + (i & 1 ? 0.8 : -0.8) * s;
                scale(g, p[0] - Math.sin(down) * off, p[1] + Math.cos(down) * off, down + (rnd() - 0.5) * 0.2, 4.6 * s, F([[0.5, SILK.peri, -0.06], [1, i % 3 ? SILK.peri : SILK.teal, 0.12]], { cast: 0.8, line: 0.75, base: 0.2, gleam: 0.5 }));
            }
        }
        g.restore();
        rim(g, [neck], { ...PN, gleam: 0 });
        // the head: stitched back from the bill, a bare cheek, the eye, the bill, the crest
        const top = nk[nn - 1], fwd = T.ang(pose ? Math.PI + 0.25 : -0.2), hc = pol(top[0], top[1], 3 * s, fwd);
        const crown = pol(hc[0], hc[1], 5 * s, fwd - T.f * (pose ? -1.5 : 1.5)), tufts = [];
        for (let i = 0; i < 5; i++) {
            const a = fwd - T.f * (pose ? -1 : 1) * (1.1 + i * 0.22), e = pol(crown[0], crown[1], (9 + rnd() * 4) * s, a);
            wire(g, [crown, e], SILK.teal[6], 0.7);
            tufts.push(e[0], e[1], 1.3 * s);
        }
        knots(g, tufts, SILK.gold, 0.6);
        const bill = pol(hc[0], hc[1], 5.4 * s, fwd), nrm = fwd + Math.PI / 2;
        hatch(g, [pol(bill[0], bill[1], 2.3 * s, nrm), pol(bill[0], bill[1], 8.5 * s, fwd + T.f * 0.12), pol(bill[0], bill[1], -2.3 * s, nrm)], fwd, F([[1, SILK.gold, 0]], { cast: 1, sheen: 0, base: 0, gap: 1.1, line: 0.9 }));
        fan(g, S.ellipse(hc[0], hc[1], 6.6 * s, 5.6 * s, 18, fwd), bill, F([[0.4, SILK.ivory, 0], [1, SILK.peri, 0.06]], { axis: fwd + Math.PI, full: true, cast: 2, base: 0.05, ls: 0.07 }));
        eye(g, pol(hc[0], hc[1], 1.6 * s, fwd - T.f * (pose ? -0.5 : 0.5)), 1.35 * s);
    }

    // ------------------------------------------------------------------ Canton
    // A garden pavilion as small as a flower: a stone foot with its steps, four columns, a
    // lattice rail, a moon door, two roofs with upturned eaves, a knob on top, a lantern.
    function pavilion(g, o) {
        const s = o.s ?? 1, rnd = Motion.rng('pav/' + o.seed), T = frame(o.x, o.y, 0, s, o.flip);
        const F = (zones, extra) => field({ zones, cx: o.x, cy: o.y - 50 * s, R: 60 * s, rnd, base: 0, tip: 0, ...extra });
        const UP = -Math.PI / 2;
        g.fillStyle = 'rgba(7,8,24,0.3)';
        traceAll(g, [T.all([[-50, 3], [50, 3], [50, -50], [0, -96], [-50, -50]])], SX * 4, SY * 4);
        g.fill();
        // the back wall in shade, a round door in it
        g.fillStyle = SILK.plum[0];
        traceAll(g, [T.all([[-28, -9], [28, -9], [28, -46], [-28, -46]])]);
        g.fill();
        const door = T(0, -24), ring = S.ellipse(door[0], door[1], 11 * s, 11 * s, 28);
        g.fillStyle = SILK.wine[1];
        g.beginPath();
        g.arc(door[0], door[1], 11 * s, 0, TAU);
        g.fill();
        wire(g, [...ring, ring[0]], SILK.ivory[6], 1.1, { void: 0 });
        // someone in the doorway
        hatch(g, T.all([[-3.4, -9.5], [3.4, -9.5], [2, -20], [-2, -20]]), UP, F([[1, SILK.coral, 0.04]], { cast: 1, gap: 1.1, line: 0.8 }));
        knots(g, [...T(0, -22.6), 2 * s], SILK.ivory, 0.75);
        g.fillStyle = VOID;
        g.beginPath();
        g.arc(...T(0.4, -24.4), 1.5 * s, 0, TAU);
        g.fill();
        // the foot and its steps
        hatch(g, T.all([[-42, 0], [42, 0], [38, -9], [-38, -9]]), 0, F([[1, SILK.ivory, -0.06]], { cast: 2, sheen: 0.1 }));
        for (const [w, v] of [[11, -1.2], [9, -4.2], [7, -7.2]]) wire(g, [T(-w, v), T(w, v)], SILK.ivory[7], 0.8, { void: 0 });
        wire(g, [T(-11, 0), T(-7, -9)], VOID, 0.8, { void: 0 });
        wire(g, [T(11, 0), T(7, -9)], VOID, 0.8, { void: 0 });
        // the rail: a lattice between the outer columns
        for (const sd of [-1, 1]) {
            const x0 = sd * 9, x1 = sd * 27, lat = [];
            for (let k = 0; k < 4; k++) {
                const a = x0 + ((x1 - x0) * k) / 4, b = x0 + ((x1 - x0) * (k + 1)) / 4;
                lat.push(...T(a, -9.5), ...T(b, -17), ...T(a, -17), ...T(b, -9.5));
            }
            segs(g, lat, SILK.gold[5], 0.7);
            wire(g, [T(x0, -17.5), T(x1, -17.5)], SILK.gold[6], 1, { void: 0 });
        }
        // four columns, their floss running up them
        for (const u of [-27, -9, 9, 27]) hatch(g, T.all([[u - 2.2, -9], [u + 2.2, -9], [u + 1.9, -46], [u - 1.9, -46]]), UP, F([[1, SILK.wine, 0.1]], { cast: 1.6, gap: 1.1, line: 0.9 }));
        // a roof: tiles as stitches from ridge to eave, cords on ridge and eave, bells
        const roof = (pts, ridge, eave, bells) => {
            hatch(g, T.all(pts), UP, F([[0.45, SILK.teal, -0.04], [1, SILK.peri, 0.04]], { cast: 3, ls: 0.14, sheen: 0.2 }));
            cord(g, S.curve(T.all(eave), false, 6), SILK.gold, { w: 1.2, tone: 6, every: 3.2 });
            cord(g, T.all(ridge), SILK.gold, { w: 1.3, tone: 7, every: 3 });
            const list = [];
            for (const b of bells) list.push(...T(b[0], b[1]), 1.5 * s);
            knots(g, list, SILK.gold, 0.7);
        };
        roof([[-54, -55], [-38, -46.5], [-18, -44.5], [18, -44.5], [38, -46.5], [54, -55], [40, -53.5], [27, -58], [22, -63], [-22, -63], [-27, -58], [-40, -53.5]], [[-22, -63], [22, -63]], [[-54, -55], [-38, -46.5], [-18, -44.5], [18, -44.5], [38, -46.5], [54, -55]], [[-54, -56.5], [54, -56.5]]);
        // the upper storey: a lattice window
        hatch(g, T.all([[-15, -63], [15, -63], [14, -75], [-14, -75]]), UP, F([[1, SILK.wine, 0.02]], { cast: 1, gap: 1.1, line: 0.9 }));
        const win = [];
        for (let k = -2; k <= 2; k++) win.push(...T(k * 4.6, -65), ...T(k * 4.6, -73));
        win.push(...T(-10.5, -69), ...T(10.5, -69));
        segs(g, win, SILK.ivory[6], 0.7);
        roof([[-36, -84], [-24, -77], [-10, -75], [10, -75], [24, -77], [36, -84], [26, -82.5], [14, -86], [5, -92], [-5, -92], [-14, -86], [-26, -82.5]], [[-5, -92], [5, -92]], [[-36, -84], [-24, -77], [-10, -75], [10, -75], [24, -77], [36, -84]], [[-36, -85.5], [36, -85.5], [0, -95.5], [0, -99]]);
        // a lantern from one eave
        const lt = T(-49, -43.5);
        wire(g, [T(-50, -53), lt], SILK.gold[5], 0.7, { void: 0 });
        knots(g, [lt[0], lt[1], 2.6 * s], SILK.coral, 0.75);
    }
    // A humpbacked bridge: its stones stitched round the arch, a rail on posts, water under
    // it, a willow at one end, and someone crossing under a parasol.
    function bridge(g, o) {
        const s = o.s ?? 1, rnd = Motion.rng('bridge/' + o.seed), T = frame(o.x, o.y, 0, s, o.flip);
        const F = (zones, extra) => field({ zones, cx: o.x, cy: o.y + 12 * s, R: 55 * s, rnd, base: 0, tip: 0, ...extra });
        const top = (u) => 24 * (u / 59) * (u / 59);
        // the water: broken lines
        const water = [];
        for (let k = 0; k < 13; k++) {
            const v = 25 + k * 1.9 + rnd() * 1.2, u0 = -64 + rnd() * 50, len = 14 + rnd() * 30;
            water.push(...T(u0, v), ...T(u0 + len, v + (rnd() - 0.5)));
            if (rnd() < 0.8) water.push(...T(u0 + len + 5, v), ...T(u0 + len + 12 + rnd() * 26, v));
            if (rnd() < 0.5) water.push(...T(u0 + len + 46, v), ...T(u0 + len + 54 + rnd() * 14, v));
        }
        segs(g, water, SILK.peri[6], 0.8);
        segs(g, water.filter((_, i) => (i >> 2) % 3 === 0), SILK.ivory[8], 0.6);
        const reeds = [];
        for (let k = 0; k < 7; k++) {
            const u = -66 + k * 2.6 + rnd() * 2, h = 9 + rnd() * 12;
            reeds.push(...T(u, 27), ...T(u + (rnd() - 0.5) * 5, 27 - h));
        }
        segs(g, reeds, SILK.jade[6], 0.9);
        // the willow
        wire(g, [T(62, 24), T(60, 6), T(57, -12)], SILK.gold[3], 1.8);
        const strands = [];
        for (let k = 0; k < 7; k++) {
            let u = 57, v = -12, h = -2.6 + k * 0.42 + rnd() * 0.2;
            for (let i = 0; i < 9; i++) {
                const nu = u + Math.cos(h) * 4.4, nv = v + Math.sin(h) * 4.4;
                strands.push(...T(u, v), ...T(nu, nv));
                if (i > 1) strands.push(...T(nu, nv), ...T(nu + (k % 2 ? 1.6 : -1.6), nv + 2.2));
                u = nu;
                v = nv;
                h += (Math.PI / 2 - h) * 0.28;
            }
        }
        segs(g, strands, SILK.jade[6], 0.75);
        // the bridge: stones round the arch
        const deck = [], open = [];
        for (let i = 0; i <= 24; i++) {
            const u = -59 + (118 * i) / 24;
            deck.push([u, top(u)]);
        }
        for (let i = 0; i <= 18; i++) {
            const a = Math.PI * (i / 18);
            open.push([34 * Math.cos(a), 26 - 19 * Math.sin(a)]);
        }
        const stone = T.all([...deck, [59, 26], ...open, [-59, 26]]);
        g.fillStyle = 'rgba(7,8,24,0.3)';
        traceAll(g, [stone], SX * 3.5, SY * 3.5);
        g.fill();
        fan(g, stone, T(0, 26), F([[0.5, SILK.ivory, -0.12], [1, SILK.ivory, 0.02]], { axis: -Math.PI / 2, cast: 2.4, sheen: 0.14, ls: 0.12, an: 0.3 }));
        cord(g, T.all(open.slice(1, -1).map(([u, v]) => [u * 1.08, 26 + (v - 26) * 1.1])), SILK.ivory, { w: 1, tone: 3, every: 5 });
        // the rail
        const posts = [], caps = [];
        for (let k = -4; k <= 4; k++) {
            const u = k * 12.5;
            posts.push(...T(u, top(u)), ...T(u, top(u) - 7.5));
            caps.push(...T(u, top(u) - 8.2), 1.3 * s);
        }
        segs(g, posts, SILK.wine[6], 1.3);
        wire(g, T.all(deck.slice(2, -2).map(([u, v]) => [u, v - 5.6])), SILK.gold[6], 1, { void: 0 });
        knots(g, caps, SILK.gold, 0.66);
        // someone crossing, under a parasol
        const fu = -9, fv = top(fu);
        hatch(g, T.all([[fu - 3.6, fv], [fu + 3.6, fv], [fu + 2, fv - 11], [fu - 2, fv - 11]]), -Math.PI / 2, F([[1, SILK.rose, 0.06]], { cast: 1, gap: 1.1, line: 0.8 }));
        knots(g, [...T(fu, fv - 13.4), 2 * s], SILK.ivory, 0.75);
        g.fillStyle = VOID;
        g.beginPath();
        g.arc(...T(fu - 0.4, fv - 15.2), 1.5 * s, 0, TAU);
        g.fill();
        wire(g, [T(fu + 3, fv - 8), T(fu + 5, fv - 22)], SILK.gold[5], 0.7, { void: 0 });
        const pc = T(fu + 5, fv - 20), par = [];
        for (let i = 0; i <= 10; i++) par.push(pol(pc[0], pc[1], 9.5 * s, -Math.PI / 2 + (i / 10 - 0.5) * 2.5));
        fan(g, [pc, ...par], pc, F([[0.5, SILK.gold, -0.06], [1, SILK.coral, 0.04]], { axis: -Math.PI / 2, cast: 1.4, line: 0.9, ls: 0.06 }));
    }

    // ------------------------------------------------------------------ the layout
    // The finds, in the order they are dealt to the bays of the cloth.
    const FINDS = ['peafowl', 'songbird', 'pavilion', 'songbird', 'bridge', 'dragonfly', 'songbird', 'peafowl', 'songbird', 'pavilion', 'bridge', 'songbird', 'dragonfly'];
    // what each of them takes of the cloth: discs [x, y, r]
    const FOOT = {
        songbird: (o) => {
            const T = frame(o.x, o.y, o.rot ?? 0, o.s ?? 1, o.flip), s = o.s ?? 1;
            return [[...T(0, 0), 20 * s], [...T(18, -11), 12 * s], [...T(-30, 8), 13 * s], [...T(-34, 21), 8 * s], [...T(30, 15), 8 * s]];
        },
        peafowl: (o) => {
            const T = frame(o.x, o.y, o.rot ?? 0, o.s ?? 1, o.flip), s = o.s ?? 1, out = [[...T(0, 0), 30 * s], [...T(22, -30), 16 * s], [...T(o.pose ? 12 : 30, -48), 14 * s], [...T(0, 30), 12 * s]];
            for (const f of trainOf(o)) for (let i = 4; i < f.pts.length; i += 4) out.push([f.pts[i][0], f.pts[i][1], 12 * s]);
            return out;
        },
        pavilion: (o) => [[o.x, o.y - 26 * (o.s ?? 1), 40 * (o.s ?? 1)], [o.x, o.y - 68 * (o.s ?? 1), 34 * (o.s ?? 1)], [o.x - 34 * (o.s ?? 1), o.y - 10, 16], [o.x + 34 * (o.s ?? 1), o.y - 10, 16]],
        bridge: (o) => [[o.x, o.y + 8 * (o.s ?? 1), 30 * (o.s ?? 1)], [o.x - 38 * (o.s ?? 1), o.y + 16 * (o.s ?? 1), 26 * (o.s ?? 1)], [o.x + 40 * (o.s ?? 1), o.y + 12 * (o.s ?? 1), 28 * (o.s ?? 1)], [o.x - 4 * (o.s ?? 1), o.y - 18 * (o.s ?? 1), 14 * (o.s ?? 1)]],
        butterfly: (o) => [[o.x, o.y, o.r * 0.95]],
        dragonfly: (o) => [[o.x, o.y, o.r * 0.9], [o.x - Math.cos(o.rot) * o.r * 1.1, o.y - Math.sin(o.rot) * o.r * 1.1, o.r * 0.4]],
    };
    const REACH = { peafowl: 330, songbird: 70, pavilion: 110, bridge: 90, butterfly: 40, dragonfly: 60 };

    // Seeded, never a repeat: what has a place of its own, then bouquets (a big flower, its
    // companions, the branches that leave it), middling flowers in the bays, boughs and
    // sprays through the free cloth, and then whatever still fits in every hole that is left.
    const plans = new Map();
    function plan(box, o = {}) {
        const seed = o.seed ?? 'shawl', keepOut = o.keepOut ?? 0, anchors = o.anchors ?? [];
        const key = [box.x, box.y, box.w, box.h, seed, keepOut, o.verses !== false, JSON.stringify(anchors)].join('/');
        if (plans.has(key)) return plans.get(key);
        const rnd = Motion.rng('shawl/' + seed), CELL = 8, gw = Math.ceil(box.w / CELL), gh = Math.ceil(box.h / CELL), occ = new Uint8Array(gw * gh);
        const items = [];
        const put = (it) => {
            it.seed = seed + '/' + items.length;
            items.push(it);
            return it;
        };
        const span = (x, y, r, fn) => {
            const i0 = Math.floor((x - r - box.x) / CELL), i1 = Math.floor((x + r - box.x) / CELL), j0 = Math.floor((y - r - box.y) / CELL), j1 = Math.floor((y + r - box.y) / CELL);
            for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
                const cx = box.x + (i + 0.5) * CELL - x, cy = box.y + (j + 0.5) * CELL - y;
                if (cx * cx + cy * cy <= r * r) fn(i >= 0 && j >= 0 && i < gw && j < gh ? j * gw + i : -1);
            }
        };
        const discFree = (x, y, r) => {
            let n = 0, f = 0;
            span(x, y, Math.max(r, CELL * 0.75), (c) => {
                n++;
                if (c < 0 || !occ[c]) f++;
            });
            return n ? f / n : 1;
        };
        const markDisc = (x, y, r) => span(x, y, r, (c) => {
            if (c >= 0) occ[c] = 1;
        });
        const capFree = (x0, y0, x1, y1, r) => {
            const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (r * 0.9)));
            let f = 0;
            for (let i = 0; i <= n; i++) f += discFree(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, r);
            return f / (n + 1);
        };
        const markCap = (x0, y0, x1, y1, r) => {
            const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (r * 0.7)));
            for (let i = 0; i <= n; i++) markDisc(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, r);
        };
        // how far a ray runs before it meets something
        const reach = (x, y, a, max) => {
            const dx = Math.cos(a) * CELL, dy = Math.sin(a) * CELL;
            for (let d = CELL; d <= max; d += CELL) {
                x += dx;
                y += dy;
                const i = Math.floor((x - box.x) / CELL), j = Math.floor((y - box.y) / CELL);
                if (i < 0 || j < 0 || i >= gw || j >= gh || occ[j * gw + i]) return d - CELL;
            }
            return max;
        };
        const hueOf = () => LEAVES[(rnd() * LEAVES.length) | 0];
        // a leaf, if most of it lies on free cloth (from `skip` of its length on)
        const tryLeaf = (x, y, a, len, wid, need, o2 = {}) => {
            const s = o2.skip ?? 0.15, x0 = x + Math.cos(a) * len * s, y0 = y + Math.sin(a) * len * s, x1 = x + Math.cos(a) * len * 0.9, y1 = y + Math.sin(a) * len * 0.9;
            if (capFree(x0, y0, x1, y1, wid * 0.36) < need) return false;
            markCap(x0, y0, x1, y1, wid * 0.4);
            put({ k: 'leaf', z: o2.z ?? 1, x, y, a, len: len * 1.05, wid: wid * 1.14, bend: (rnd() - 0.5) * 0.7, bx: x + Math.cos(a) * len * 0.5, by: y + Math.sin(a) * len * 0.5, br: len * 0.62, hue: o2.hue, kind: o2.kind, shape: o2.shape });
            return true;
        };
        const collar = (x, y, r, n, hue, k0 = 0.95, k1 = 0.5) => {
            const a0 = rnd() * TAU;
            for (let j = 0; j < n; j++) {
                const a = a0 + (j / n) * TAU + (rnd() - 0.5) * 0.5, len = Math.max(26, r * (k0 + rnd() * k1));
                tryLeaf(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, a + (rnd() - 0.5) * 0.4, len, Math.min(44, len * (0.38 + rnd() * 0.1)), 0.55, { skip: 0.5, hue });
            }
        };
        // a path that finds its way through the free cloth, a step at a time
        const wander = (x, y, h, steps, step, o2 = {}) => {
            const pts = [[x, y]], need = o2.need ?? 0.78, r = o2.r ?? 12, kink = o2.kink ?? 0.3;
            for (let s = 0; s < steps; s++) {
                let best = -1, bh = h;
                for (const dh of [0, -0.45, 0.45, -0.9, 0.9]) {
                    const f = discFree(x + Math.cos(h + dh) * (step + r), y + Math.sin(h + dh) * (step + r), r) - Math.abs(dh) * 0.06;
                    if (f > best) {
                        best = f;
                        bh = h + dh;
                    }
                }
                if (best < need) break;
                h = bh + (rnd() - 0.5) * kink;
                x += Math.cos(h) * step;
                y += Math.sin(h) * step;
                pts.push([x, y]);
            }
            return pts;
        };
        const FLOWERS = ['peony', 'rose', 'mum', 'peony', 'rose', 'mum', 'mum'];
        const head = (k, x, y, r, z, extra = {}) => put({ k, z, x, y, r, bx: x, by: y, br: r * (k === 'cup' ? 2.6 : 1.15), ...extra });

        // where the verses run (the figure of the damask), cell by cell: the last pass of small
        // leaves keeps off it, so a little more of the cloth shows inside every letter
        let figure = null;
        if (o.verses !== false) {
            const c = document.createElement('canvas');
            c.width = gw;
            c.height = gh;
            const q = c.getContext('2d', { willReadFrequently: true });
            q.setTransform(1 / CELL, 0, 0, 1 / CELL, -box.x / CELL, -box.y / CELL);
            verses(q, box, o, (line, x, y) => q.fillText(line, x, y));
            const d = q.getImageData(0, 0, gw, gh).data;
            figure = new Uint8Array(gw * gh);
            for (let i = 0; i < gw * gh; i++) figure[i] = d[i * 4 + 3] > 110 ? 1 : 0;
        }

        // 0 · the hole of the dive, and what has a place of its own
        if (keepOut > 0) markDisc(0, 0, keepOut);
        const place = (a) => {
            const it = put({ ...a, z: a.z ?? (a.k === 'butterfly' || a.k === 'dragonfly' ? 6 : a.k === 'pavilion' || a.k === 'bridge' ? 4.6 : 5), bx: a.x, by: a.y, br: (REACH[a.k] ?? 120) * (a.s ?? 1) });
            for (const [mx, my, mr] of FOOT[a.k] ? FOOT[a.k](it) : [[a.x, a.y, 40]]) markDisc(mx, my, mr);
        };
        const fits = (a) => {
            const probe = { ...a, seed: seed + '/' + items.length };
            for (const [mx, my, mr] of FOOT[a.k](probe)) if (discFree(mx, my, mr + 6) < 0.98) return false;
            return true;
        };
        for (const a of anchors) place(a);
        // the finds are dealt out over the cloth, one to every bay of about 500 units, so that
        // whatever the emblem covers, something shows beside it
        const cols = Math.max(1, Math.round(box.w / 500)), rows = Math.max(1, Math.round(box.h / 480)), bays = [];
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) bays.push([i, j, rnd()]);
        bays.sort((p, q) => p[2] - q[2]);
        bays.forEach(([i, j], n) => {
            const k = FINDS[n % FINDS.length];
            for (let t = 0; t < 14; t++) {
                const a = { k, x: box.x + ((i + 0.2 + rnd() * 0.6) * box.w) / cols, y: box.y + ((j + 0.2 + rnd() * 0.6) * box.h) / rows, s: 0.88 + rnd() * 0.26, flip: rnd() < 0.5 };
                // a long-tailed bird sits level or head up, never head down
                if (k === 'peafowl') Object.assign(a, { rot: (a.flip ? 1 : -1) * (rnd() * 1.5 - 0.3), pose: rnd() < 0.4 ? 1 : 0, sag: 0.25 + rnd() * 0.5 });
                if (k === 'songbird') Object.assign(a, { rot: (rnd() - 0.5) * 0.5, s: 1.2 + rnd() * 0.45 });
                if (k === 'dragonfly') Object.assign(a, { rot: rnd() * TAU, r: 24 + rnd() * 9 });
                if (!fits(a)) continue;
                place(a);
                // long-tailed birds go in pairs: its mate faces it, a body's length off, looking back
                if (k === 'peafowl') {
                    const fa = (a.flip ? Math.PI : 0) + a.rot, d = (118 + rnd() * 40) * a.s;
                    const m = { ...a, x: a.x + Math.cos(fa) * d + Math.sin(fa) * 30, y: a.y + Math.sin(fa) * d + 26 + rnd() * 30, flip: !a.flip, rot: -a.rot * (0.4 + rnd() * 0.5), pose: 1 - a.pose, s: a.s * (0.86 + rnd() * 0.1), sag: 0.3 + rnd() * 0.4 };
                    if (fits(m)) place(m);
                }
                break;
            }
        });

        // 1 · bouquets: a principal flower, companions tucked against it, branches leaving it
        const bouquets = [];
        for (let i = 0; i < 1400; i++) {
            const x = box.x + rnd() * box.w, y = box.y + rnd() * box.h, r = 72 + rnd() * 40, gap = 330 + rnd() * 190;
            if (discFree(x, y, r * 1.1) < 0.97 || bouquets.some((b) => Math.hypot(b.x - x, b.y - y) < gap)) continue;
            bouquets.push({ x, y, r });
        }
        for (const b of bouquets) {
            const hue = hueOf(), a0 = rnd() * TAU, nc = 1 + ((rnd() * 3) | 0), heads = [];
            markDisc(b.x, b.y, b.r * 0.93);
            for (let c = 0; c < nc; c++) {
                const ang = a0 + (c / nc) * TAU * (0.6 + rnd() * 0.3), rr = 38 + rnd() * 34, d = (b.r + rr) * (0.8 + rnd() * 0.14), cx = b.x + Math.cos(ang) * d, cy = b.y + Math.sin(ang) * d;
                if (discFree(cx, cy, rr) < 0.72) continue;
                const pick = rnd(), k = pick < 0.34 ? 'peony' : pick < 0.58 ? 'rose' : pick < 0.82 ? 'mum' : 'cup';
                if (k === 'cup') {
                    const bx = b.x + Math.cos(ang) * b.r * 0.86, by = b.y + Math.sin(ang) * b.r * 0.86, cr = rr * 0.6;
                    markDisc(bx + Math.cos(ang) * cr * 1.1, by + Math.sin(ang) * cr * 1.1, cr * 1.25);
                    heads.push({ k, x: bx, y: by, r: cr, rot: ang + (rnd() - 0.5) * 0.4, hue, stalk: 0 });
                } else {
                    markDisc(cx, cy, rr * 0.93);
                    heads.push({ k, x: cx, y: cy, r: rr });
                }
            }
            // branches
            const nb = 2 + ((rnd() * 3) | 0), b0 = rnd() * TAU;
            for (let q = 0; q < nb; q++) {
                const ang = b0 + (q / nb) * TAU + (rnd() - 0.5) * 0.7, sx = b.x + Math.cos(ang) * b.r * 0.9, sy = b.y + Math.sin(ang) * b.r * 0.9;
                const way = wander(sx, sy, ang + (rnd() - 0.5) * 0.6, 12 + ((rnd() * 14) | 0), 15, { r: 13, need: 0.7, kink: 0.36 });
                if (way.length < 4) continue;
                const pts = walk(S.curve([[b.x + Math.cos(ang) * b.r * 0.4, b.y + Math.sin(ang) * b.r * 0.4], ...way], false, 8), 3), m = way[way.length >> 1];
                put({ k: 'stem', z: 0, pts, w: 2.6 + rnd() * 1.3, hue, bx: m[0], by: m[1], br: way.length * 9 + 30 });
                for (let s = 1; s < way.length; s++) markCap(way[s - 1][0], way[s - 1][1], way[s][0], way[s][1], 5);
                // what the branch ends in
                const e = way[way.length - 1], p = way[way.length - 2], ea = Math.atan2(e[1] - p[1], e[0] - p[0]), pick = rnd();
                if (pick < 0.45 && discFree(e[0] + Math.cos(ea) * 26, e[1] + Math.sin(ea) * 26, 30) > 0.8) {
                    const cr = 16 + rnd() * 10;
                    markDisc(e[0] + Math.cos(ea) * cr * 1.1, e[1] + Math.sin(ea) * cr * 1.1, cr * 1.3);
                    head('cup', e[0], e[1], cr, 3.2, { rot: ea, hue, stalk: 0 });
                } else if (pick < 0.8) {
                    const br = 9 + rnd() * 7;
                    markDisc(e[0] + Math.cos(ea) * br, e[1] + Math.sin(ea) * br, br * 1.2);
                    put({ k: 'bud', z: 3.2, x: e[0] + Math.cos(ea) * br, y: e[1] + Math.sin(ea) * br, r: br, rot: ea, hue, stalk: 0, bx: e[0], by: e[1], br: br * 3 });
                }
                // leaves in pairs along it, now and then a tendril
                for (let s = 8 + ((rnd() * 8) | 0); s < pts.length - 5; s += 13 + ((rnd() * 9) | 0)) {
                    const pp = pts[s], ta = Math.atan2(pts[s + 2][1] - pts[s - 2][1], pts[s + 2][0] - pts[s - 2][0]);
                    if (Math.hypot(pp[0] - b.x, pp[1] - b.y) < b.r * 0.92) continue;
                    for (const sd of [-1, 1]) {
                        const len = 40 + rnd() * 44;
                        if (!tryLeaf(pp[0], pp[1], ta + sd * (0.65 + rnd() * 0.5), len, len * (0.36 + rnd() * 0.1), 0.6, { hue }) && rnd() < 0.5) put({ k: 'tendril', z: 0.5, x: pp[0], y: pp[1], a: ta + sd * 1.2, len: 34 + rnd() * 30, gold: rnd() < 0.4, bx: pp[0], by: pp[1], br: 40 });
                    }
                }
            }
            for (const h of heads) {
                if (h.k !== 'cup') collar(h.x, h.y, h.r, 3 + ((rnd() * 3) | 0), hue, 1.1, 0.6);
                head(h.k, h.x, h.y, h.r, 3.5, h.k === 'cup' ? { rot: h.rot, hue: h.hue, stalk: 0 } : {});
            }
            collar(b.x, b.y, b.r, 6 + ((rnd() * 4) | 0), hue);
            head(rnd() < 0.62 ? 'peony' : 'rose', b.x, b.y, b.r, 4);
        }
        // 2 · middling flowers in the bays between the bouquets
        for (let i = 0; i < 1500; i++) {
            const r = 24 + rnd() * 30, x = box.x + rnd() * box.w, y = box.y + rnd() * box.h, pick = rnd(), hue = hueOf();
            if (discFree(x, y, r + 5) < 0.95) continue;
            if (pick < 0.18) {
                const rot = rnd() * TAU, cr = r * 0.62;
                markDisc(x + Math.cos(rot) * cr * 1.05, y + Math.sin(rot) * cr * 1.05, cr * 1.3);
                head('cup', x, y, cr, 3, { rot, hue });
                continue;
            }
            markDisc(x, y, r * 0.93);
            collar(x, y, r, 2 + ((rnd() * 3) | 0), hue, 1.2, 0.7);
            // the smaller ones are sometimes a wild rose: five broad petals and long stamens
            if (r < 38 && pick > 0.74) head('floret', x, y, r * 0.86, 3, { kind: 'round' });
            else head(FLOWERS[(rnd() * FLOWERS.length) | 0], x, y, r, 3);
        }
        // 3 · boughs of blossom, some with a bird on them
        for (let i = 0, birds = 0; i < 500; i++) {
            const x = box.x + rnd() * box.w, y = box.y + rnd() * box.h, h = rnd() * TAU;
            if (discFree(x, y, 16) < 0.95) continue;
            const pts = wander(x, y, h, 9 + ((rnd() * 14) | 0), 14, { r: 15, need: 0.82, kink: 0.9 });
            if (pts.length < 7) continue;
            const m = pts[pts.length >> 1], q = pts[(pts.length >> 1) + 1], ta = Math.atan2(q[1] - m[1], q[0] - m[0]);
            const sit = birds < 14 && rnd() < 0.55 && Math.abs(Math.sin(ta)) < 0.6;
            if (sit) {
                // it stands on the bough: its feet are 17.5 below its middle
                const flip = rnd() < 0.5, s = 1.1 + rnd() * 0.4, rot = clamp(Math.cos(ta) > 0 ? ta : wrap(ta + Math.PI), -0.4, 0.4);
                const a = { k: 'songbird', x: m[0] + Math.sin(rot) * 17.5 * s, y: m[1] - Math.cos(rot) * 17.5 * s, s, rot, flip, perch: false };
                if (fits(a)) {
                    place(a);
                    birds++;
                }
            }
            for (let s = 1; s < pts.length; s++) markCap(pts[s - 1][0], pts[s - 1][1], pts[s][0], pts[s][1], 17);
            put({ k: 'bough', z: 2, pts, bx: m[0], by: m[1], br: pts.length * 8 + 40 });
        }
        // 4 · sprays: a twig with small flowers
        for (let i = 0; i < 700; i++) {
            const x = box.x + rnd() * box.w, y = box.y + rnd() * box.h;
            if (discFree(x, y, 15) < 0.95) continue;
            const pts = wander(x, y, rnd() * TAU, 13, 13, { r: 13, need: 0.8 });
            if (pts.length < 5) continue;
            for (let s = 1; s < pts.length; s++) markCap(pts[s - 1][0], pts[s - 1][1], pts[s][0], pts[s][1], 15);
            const m = pts[pts.length >> 1];
            put({ k: 'spray', z: 2, pts, hue: hueOf(), bx: m[0], by: m[1], br: pts.length * 7.5 + 30 });
        }
        // 5 · butterflies wherever a clear patch is left
        for (let i = 0, got = 0; i < 500 && got < 46; i++) {
            const r = 15 + rnd() * 11, x = box.x + rnd() * box.w, y = box.y + rnd() * box.h;
            if (discFree(x, y, r * 1.05) < 0.97) continue;
            markDisc(x, y, r * 0.9);
            put({ k: 'butterfly', z: 6, x, y, r, rot: rnd() * TAU, bx: x, by: y, br: r * 1.5 });
            got++;
        }
        // 6 · fill: again and again, find the widest holes and put in each what fits; leaves
        //     first of all, turned to where there is room
        const inside = new Uint8Array(gw * gh);
        const sprig = (x, y, r, n, hue, flower) => {
            let ba = 0, bl = -1;
            for (let q = 0; q < 12; q++) {
                const a = (q / 12) * TAU + rnd() * 0.3, l = reach(x, y, a, 90) + reach(x, y, a + Math.PI, 30) * 0.4;
                if (l > bl) {
                    bl = l;
                    ba = a;
                }
            }
            const back = Math.min(r * 0.8, reach(x, y, ba + Math.PI, 30)), bx = x - Math.cos(ba) * back, by = y - Math.sin(ba) * back;
            let any = false;
            const willow = rnd() < (n === 1 ? 0.4 : 0.16); // long narrow leaves, as of bamboo or willow
            for (let q = 0; q < n; q++) {
                const a = ba + (q - (n - 1) / 2) * (willow ? 0.4 : 0.55 + rnd() * 0.3), len = clamp(back + reach(bx, by, a, 95) * 0.92, 14, 92);
                any = tryLeaf(bx, by, a, len, clamp(len * (willow ? 0.24 : 0.4), willow ? 5 : 6, r * 1.5), 0.6, { hue, skip: 0.1, kind: willow || len < 30 ? 'smooth' : undefined, shape: willow ? 'lance' : undefined }) || any;
            }
            if (flower === null) return markDisc(x, y, r * 0.5); // the last pass: a leaf or nothing
            if (!any || flower) {
                const rr = clamp(r * 0.5, 6, 13);
                markDisc(bx, by, rr);
                if (rnd() < 0.3) put({ k: 'bud', z: 2.6, x: bx, y: by, r: rr * 0.8, rot: ba + Math.PI + (rnd() - 0.5), hue, bx, by, br: rr * 3 });
                else put({ k: 'floret', z: 2.6, x: bx, y: by, r: rr, bx, by, br: rr * 1.3 });
            }
        };
        for (const thr of [40, 31, 24, 19, 15, 12, 10, 9, 9, 9, 8]) {
            for (let c = 0; c < gw * gh; c++) inside[c] = occ[c] ? 0 : 1;
            const d = S.edt(inside, gw, gh), cand = [];
            for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
                const c = j * gw + i, v = d[c];
                if (v * CELL < thr) continue;
                if ((i === 0 || v >= d[c - 1]) && (i === gw - 1 || v >= d[c + 1]) && (j === 0 || v >= d[c - gw]) && (j === gh - 1 || v >= d[c + gw])) cand.push(c);
            }
            cand.sort((p, q) => d[q] - d[p] || p - q);
            for (const c of cand) {
                const x = box.x + ((c % gw) + 0.5) * CELL, y = box.y + (Math.floor(c / gw) + 0.5) * CELL, r = Math.min(d[c] * CELL, 60);
                if (discFree(x, y, r * 0.8) < 0.9) continue; // something of this round took it
                const pick = rnd(), hue = hueOf();
                if (r >= 36) {
                    const rr = Math.min(46, r * 0.84);
                    markDisc(x, y, rr * 0.95);
                    collar(x, y, rr, 2, hue, 1.2, 0.6);
                    head(FLOWERS[(rnd() * FLOWERS.length) | 0], x, y, rr, 3);
                } else if (r >= 21) {
                    if (pick < 0.22) {
                        const rr = Math.min(22, r * 0.78);
                        markDisc(x, y, rr);
                        collar(x, y, rr, 3, hue, 1.5, 0.8);
                        put({ k: pick < 0.1 ? 'mum' : 'floret', z: 2.5, x, y, r: rr, bx: x, by: y, br: rr * 1.2 });
                    } else if (pick < 0.34) {
                        const a = rnd() * TAU, len = clamp(r + reach(x, y, a, 70), 30, 96);
                        markCap(x, y, x + Math.cos(a) * len * 0.8, y + Math.sin(a) * len * 0.8, len * 0.16);
                        put({ k: 'fern', z: 1, x: x - Math.cos(a) * r * 0.7, y: y - Math.sin(a) * r * 0.7, a, len, hue: rnd() < 0.5 ? 'jade' : 'teal', bx: x, by: y, br: len * 1.2 });
                    } else sprig(x, y, r, 3, hue, pick > 0.7);
                } else if (r >= 13) {
                    if (pick < 0.12) {
                        const rr = r * 0.74;
                        markDisc(x, y, rr);
                        put({ k: 'floret', z: 2.5, x, y, r: rr, bx: x, by: y, br: rr * 1.3 });
                    } else if (pick < 0.2) {
                        markDisc(x, y, r * 0.75);
                        put({ k: 'tendril', z: 0.5, x: x - r * 0.5, y, a: rnd() * TAU, len: r * 4.5, gold: rnd() < 0.5, bx: x, by: y, br: r * 2.2 });
                    } else sprig(x, y, r, 2, hue, pick > 0.8);
                } else if (thr === 8) {
                    if (figure && figure[c]) markDisc(x, y, r * 0.5);
                    else sprig(x, y, r, 1, hue, null);
                }
                else if (pick < 0.66) sprig(x, y, r, 1, hue, false);
                else {
                    const rr = Math.max(5.5, r * 0.78);
                    markDisc(x, y, rr);
                    if (pick < 0.84) put({ k: 'dots', z: 2, x, y, r: rr, bx: x, by: y, br: rr * 1.6 });
                    else put({ k: 'floret', z: 2.5, x, y, r: rr, bx: x, by: y, br: rr * 1.3 });
                }
            }
        }
        let free = 0;
        for (let c = 0; c < gw * gh; c++) if (!occ[c]) free++;
        items.sort((a, b) => a.z - b.z);
        const out = { items, bouquets, cells: 1 - free / (gw * gh) };
        plans.set(key, out);
        return out;
    }

    // ------------------------------------------------------------------ the cloth
    // The crepe's grain: a twill of warp and weft, a few pixels to the thread.
    let weave = null;
    function weaveTile() {
        if (weave) return weave;
        const n = 96, c = document.createElement('canvas');
        c.width = c.height = n;
        const q = c.getContext('2d'), im = q.createImageData(n, n);
        for (let i = 0; i < n * n; i++) {
            const x = i % n, y = (i / n) | 0;
            const v = (S.hashI(x, y, 0, 31) - 0.5) * 0.9 + ((x + y * 2) % 6 < 2 ? 0.34 : -0.12) + (S.hashI(x >> 2, y >> 1, 1, 31) - 0.5) * 0.5;
            const dark = v < 0;
            im.data[i * 4] = dark ? 6 : 132;
            im.data[i * 4 + 1] = dark ? 8 : 142;
            im.data[i * 4 + 2] = dark ? 26 : 226;
            im.data[i * 4 + 3] = Math.min(255, Math.abs(v) * 2 * 255 * (dark ? 0.2 : 0.1));
        }
        q.putImageData(im, 0, 0);
        return (weave = c);
    }
    // The figure of a damask: weft floats, a few pixels long, that catch the light.
    let floats = null;
    function floatTile() {
        if (floats) return floats;
        const n = 96, c = document.createElement('canvas');
        c.width = c.height = n;
        const q = c.getContext('2d'), im = q.createImageData(n, n);
        for (let i = 0; i < n * n; i++) {
            const x = i % n, y = (i / n) | 0;
            const on = (y & 1) === 0 && (x + (y >> 1) * 3) % 8 < 6;
            const v = on ? 0.55 + 0.45 * S.hashI(x >> 2, y, 2, 47) : 0.12 * S.hashI(x, y, 3, 47);
            im.data[i * 4] = 122;
            im.data[i * 4 + 1] = 132;
            im.data[i * 4 + 2] = 222;
            im.data[i * 4 + 3] = v * 255;
        }
        q.putImageData(im, 0, 0);
        return (floats = c);
    }
    // The verses, as lines across the cloth (Spanish, as written): [text, height of a capital]
    const VERSES = [
        ['LA LUNA VINO A LA FRAGUA', 170], ['DUENDE', 240], ['VOLVERÁN LAS OSCURAS GOLONDRINAS', 130], ['ANDALUCÍA', 260],
        ['VERDE QUE TE QUIERO VERDE', 150], ['DUENDE', 220], ['VOLVERÁN LAS OSCURAS GOLONDRINAS', 180],
    ];
    const TILT = -0.105;
    function verses(g, box, o, fn) {
        g.save();
        g.rotate(TILT);
        const r = Motion.rng('verses/' + (o.seed ?? 'shawl'));
        let y = box.y - 20;
        g.textBaseline = 'alphabetic';
        for (const [text, cap] of VERSES) {
            g.font = `100px 'IM Fell DW Pica SC', serif`;
            const capK = (g.measureText('H').actualBoundingBoxAscent || 68) / 100;
            g.font = `${(cap / capK).toFixed(1)}px 'IM Fell DW Pica SC', serif`;
            y += cap + 84;
            const line = text + '  ·  ', w = g.measureText(line).width;
            for (let x = box.x - 260 - r() * w; x < box.x + box.w + 260; x += w) fn(line, x, y);
        }
        g.restore();
    }
    function cloth(g, box, o, win) {
        const k = S.pxScale(g);
        g.save();
        g.beginPath();
        g.rect(win.x, win.y, win.w, win.h);
        g.clip();
        const wv = g.createPattern(weaveTile(), 'repeat');
        wv.setTransform(new DOMMatrix().scale(1 / k));
        g.fillStyle = wv;
        g.fillRect(win.x, win.y, win.w, win.h);
        if (o.verses !== false) {
            // verses woven into the silk, tone on tone: the figure of the damask
            const fl = g.createPattern(floatTile(), 'repeat');
            fl.setTransform(new DOMMatrix().rotate((-TILT * 180) / Math.PI).scale(1 / k));
            verses(g, box, o, (line, x, y) => {
                g.fillStyle = 'rgba(92,100,190,0.075)';
                g.fillText(line, x, y);
                g.fillStyle = fl;
                g.globalAlpha = 0.17;
                g.fillText(line, x, y);
                g.globalAlpha = 1;
            });
        }
        g.restore();
    }
    // The figure still tells through the embroidery laid over it: the silk is a little
    // glossier there (its lights lifted, its voids left dark), as a damask's figure is.
    function veil(g, box, o, win) {
        if (o.verses === false) return;
        g.save();
        g.beginPath();
        g.rect(win.x, win.y, win.w, win.h);
        g.clip();
        g.globalCompositeOperation = 'color-dodge';
        g.fillStyle = 'rgb(36,38,54)';
        verses(g, box, o, (line, x, y) => g.fillText(line, x, y));
        g.restore();
    }

    // ------------------------------------------------------------------ the shawl
    const PAINT = {
        stem: (g, o) => rope(g, o.pts, o.w, LEAF[o.hue].stem, { rnd: Motion.rng('stem/' + o.seed), tone: 0.5 }),
        leaf, fern, tendril, dots, spray, bough, floret, bud, mum, rose, peony, cup, butterfly, dragonfly, songbird, peafowl, pavilion, bridge,
    };
    function carpet(g, box, o = {}) {
        const L = plan(box, o), v = o.view;
        const win = v ? { x: Math.max(box.x, v.x), y: Math.max(box.y, v.y), w: Math.min(box.x + box.w, v.x + v.w) - Math.max(box.x, v.x), h: Math.min(box.y + box.h, v.y + v.h) - Math.max(box.y, v.y) } : box;
        g.save();
        if (!o.bare) cloth(g, box, o, win);
        for (const it of o.motifs === false ? [] : L.items) {
            if (v && (it.bx + it.br < v.x || it.bx - it.br > v.x + v.w || it.by + it.br < v.y || it.by - it.br > v.y + v.h)) continue;
            PAINT[it.k](g, it);
        }
        if (!o.bare) veil(g, box, o, win);
        g.restore();
        return L;
    }
    return { carpet, ghost: carpet, plan, peony, rose, mum, cup, floret, bud, leaf, fern, spray, bough, butterfly, dragonfly, songbird, peafowl, pavilion, bridge, SILK };
})();
