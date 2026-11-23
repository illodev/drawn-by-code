// Souvenir style kit: a place told through its painted emblems. Opaque paint modelled with
// light (never flat): emblem pieces with a dark contour and airbrushed shading, still lifes
// in gouache bands with visible strokes, gold, ribbons and lettering; then a camera that
// dives through a hole in one picture into the next (depth of field, motion blur, a soft
// lens and a lifted grade). Global: Souvenir. Depends on engine/core.js.
//
// Everything is deterministic: every texture comes from a seed, never from the frame.
// Pieces are painted once into sprites (per-pixel work is slow) and only the camera moves.
const Souvenir = (() => {
    // ------------------------------------------------------------------ colour
    const hex2rgb = (h) => {
        const n = parseInt(h.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const rgb2hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
    const mix = (a, b, t) => {
        const A = hex2rgb(a), B = hex2rgb(b);
        return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
    };
    const rgba = (h, a) => `rgba(${hex2rgb(h).join(',')},${a})`;
    const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
    const smooth = (a, b, x) => {
        const u = clamp((x - a) / (b - a));
        return u * u * (3 - 2 * u);
    };
    const lerp = (a, b, t) => a + (b - a) * t;

    // ------------------------------------------------------------------ noise
    // Integer lattice hash → [0, 1): the same on every machine.
    const hashI = (x, y, z, s) => {
        let h = (Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(s, 1911520717)) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    };
    // Smooth value noise in 3D, [-1, 1].
    function noise3(x, y, z, s = 0) {
        const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
        let fx = x - xi, fy = y - yi, fz = z - zi;
        fx = fx * fx * (3 - 2 * fx);
        fy = fy * fy * (3 - 2 * fy);
        fz = fz * fz * (3 - 2 * fz);
        const c = (i, j, k) => hashI(xi + i, yi + j, zi + k, s);
        const x00 = c(0, 0, 0) + (c(1, 0, 0) - c(0, 0, 0)) * fx, x10 = c(0, 1, 0) + (c(1, 1, 0) - c(0, 1, 0)) * fx;
        const x01 = c(0, 0, 1) + (c(1, 0, 1) - c(0, 0, 1)) * fx, x11 = c(0, 1, 1) + (c(1, 1, 1) - c(0, 1, 1)) * fx;
        const y0 = x00 + (x10 - x00) * fy, y1 = x01 + (x11 - x01) * fy;
        return (y0 + (y1 - y0) * fz) * 2 - 1;
    }
    const noise2 = (x, y, s = 0) => noise3(x, y, 0.5, s);
    const seedOf = (s) => (typeof s === 'number' ? s : Motion.hashStr(String(s))) | 0;

    // ------------------------------------------------------------------ geometry
    // Catmull-Rom through the points, densified. `tension` 0.5 is the usual curve.
    function curve(pts, closed = false, seg = 12) {
        const n = pts.length;
        if (n < 3) return pts.slice();
        const at = (i) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
        const out = [];
        const last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
            for (let k = 0; k < seg; k++) {
                const u = k / seg, u2 = u * u, u3 = u2 * u;
                const b0 = -0.5 * u3 + u2 - 0.5 * u, b1 = 1.5 * u3 - 2.5 * u2 + 1, b2 = -1.5 * u3 + 2 * u2 + 0.5 * u, b3 = 0.5 * u3 - 0.5 * u2;
                out.push([p0[0] * b0 + p1[0] * b1 + p2[0] * b2 + p3[0] * b3, p0[1] * b0 + p1[1] * b1 + p2[1] * b2 + p3[1] * b3]);
            }
        }
        if (!closed) out.push(pts[n - 1]);
        return out;
    }
    const trace = (g, pts, close = true) => {
        g.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
        if (close) g.closePath();
    };
    const bbox = (pts, pad = 0) => {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const [x, y] of pts) {
            if (x < x0) x0 = x;
            if (y < y0) y0 = y;
            if (x > x1) x1 = x;
            if (y > y1) y1 = y;
        }
        return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
    };
    const xf = (pts, { x = 0, y = 0, rot = 0, sx = 1, sy = sx } = {}) => {
        const c = Math.cos(rot), s = Math.sin(rot);
        return pts.map(([px, py]) => [x + px * sx * c - py * sy * s, y + px * sx * s + py * sy * c]);
    };
    const ellipse = (cx, cy, rx, ry, n = 48, rot = 0) => {
        const out = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            out.push([Math.cos(a) * rx, Math.sin(a) * ry]);
        }
        return xf(out, { x: cx, y: cy, rot });
    };
    // Output pixels per logical unit under the current transform.
    const pxScale = (g) => {
        const m = g.getTransform();
        return Math.max(0.02, Math.hypot(m.a, m.b));
    };

    // ------------------------------------------------------------------ distance field
    // Exact Euclidean distance (in pixels) from every inside pixel to the nearest outside one.
    function edt(inside, w, h) {
        const INF = 1e20;
        const f = new Float64Array(w * h);
        for (let i = 0; i < w * h; i++) f[i] = inside[i] ? INF : 0;
        const n = Math.max(w, h);
        const d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1), ff = new Float64Array(n);
        const pass = (off, stride, len) => {
            for (let i = 0; i < len; i++) ff[i] = f[off + i * stride];
            let k = 0;
            v[0] = 0;
            z[0] = -INF;
            z[1] = INF;
            for (let q = 1; q < len; q++) {
                let s;
                do {
                    const p = v[k];
                    s = (ff[q] + q * q - (ff[p] + p * p)) / (2 * q - 2 * p);
                } while (s <= z[k] && --k >= 0);
                k++;
                v[k] = q;
                z[k] = s;
                z[k + 1] = INF;
            }
            k = 0;
            for (let q = 0; q < len; q++) {
                while (z[k + 1] < q) k++;
                const p = v[k];
                d[q] = (q - p) * (q - p) + ff[p];
            }
            for (let i = 0; i < len; i++) f[off + i * stride] = d[i];
        };
        for (let x = 0; x < w; x++) pass(x, w, h);
        for (let y = 0; y < h; y++) pass(y * w, 1, w);
        const out = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) out[i] = Math.sqrt(f[i]);
        return out;
    }
    function boxBlur(a, w, h, r, passes = 2) {
        const tmp = new Float32Array(w * h);
        for (let p = 0; p < passes; p++) {
            for (let y = 0; y < h; y++) {
                let acc = 0;
                const row = y * w;
                for (let x = -r; x <= r; x++) acc += a[row + clamp(x, 0, w - 1)];
                for (let x = 0; x < w; x++) {
                    tmp[row + x] = acc / (2 * r + 1);
                    acc += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
                }
            }
            for (let x = 0; x < w; x++) {
                let acc = 0;
                for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, h - 1) * w + x];
                for (let y = 0; y < h; y++) {
                    a[y * w + x] = acc / (2 * r + 1);
                    acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
                }
            }
        }
        return a;
    }

    // A balloon over the silhouette: solves ∇²u = −1 inside the mask (u = 0 on the edge) from
    // coarse to fine and returns sqrt(4u), in pixels. For a circle that is exactly a sphere,
    // for an ellipse an ellipsoid, and for any other outline a smooth swelling with no
    // creases (a distance field has one along every ridge, and light finds it).
    function inflate(inside, w, h) {
        const levels = [{ m: inside, w, h }];
        while (Math.max(levels[levels.length - 1].w, levels[levels.length - 1].h) > 44) {
            const p = levels[levels.length - 1], nw = Math.ceil(p.w / 2), nh = Math.ceil(p.h / 2), m = new Uint8Array(nw * nh);
            for (let y = 0; y < nh; y++) {
                for (let x = 0; x < nw; x++) {
                    let n = 0;
                    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
                        const X = x * 2 + i, Y = y * 2 + j;
                        if (X < p.w && Y < p.h && p.m[Y * p.w + X]) n++;
                    }
                    m[y * nw + x] = n >= 2 ? 1 : 0;
                }
            }
            levels.push({ m, w: nw, h: nh });
        }
        let u = null, pw = 0, ph = 0;
        for (let li = levels.length - 1; li >= 0; li--) {
            const { m, w: lw, h: lh } = levels[li];
            const s2 = Math.pow(4, li);
            const nu = new Float32Array(lw * lh);
            if (u) {
                for (let y = 0; y < lh; y++) {
                    for (let x = 0; x < lw; x++) {
                        if (!m[y * lw + x]) continue;
                        const fx = Math.min(pw - 1, Math.max(0, (x - 0.5) / 2)), fy = Math.min(ph - 1, Math.max(0, (y - 0.5) / 2));
                        const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(pw - 1, x0 + 1), y1 = Math.min(ph - 1, y0 + 1);
                        const ax = fx - x0, ay = fy - y0;
                        nu[y * lw + x] = (u[y0 * pw + x0] * (1 - ax) + u[y0 * pw + x1] * ax) * (1 - ay) + (u[y1 * pw + x0] * (1 - ax) + u[y1 * pw + x1] * ax) * ay;
                    }
                }
            }
            const last = li === levels.length - 1;
            const iters = last ? 260 : li === 0 ? 10 : 30, om = last ? 1.86 : 1.35;
            for (let it = 0; it < iters; it++) {
                for (let y = 1; y < lh - 1; y++) {
                    for (let x = 1, i = y * lw + 1; x < lw - 1; x++, i++) {
                        if (!m[i]) continue;
                        const v = (nu[i - 1] + nu[i + 1] + nu[i - lw] + nu[i + lw] + s2) * 0.25;
                        nu[i] += om * (v - nu[i]);
                    }
                }
            }
            u = nu;
            pw = lw;
            ph = lh;
        }
        const out = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) out[i] = Math.sqrt(Math.max(0, 4 * u[i]));
        return out;
    }

    // ------------------------------------------------------------------ ramps
    // A ramp is [[tone, '#hex'], …] from dark to light, tone in 0..1. `soft` says how much
    // of each band is transition: 1 is an airbrushed gradient, 0.15 is gouache (flat tones
    // that meet on a short edge).
    function rampFn(stops, soft = 1) {
        const T = stops.map((s) => s[0]), C = stops.map((s) => hex2rgb(s[1]));
        return (t, out) => {
            if (t <= T[0]) {
                out[0] = C[0][0];
                out[1] = C[0][1];
                out[2] = C[0][2];
                return;
            }
            const n = T.length;
            if (t >= T[n - 1]) {
                out[0] = C[n - 1][0];
                out[1] = C[n - 1][1];
                out[2] = C[n - 1][2];
                return;
            }
            let i = 0;
            while (t > T[i + 1]) i++;
            let u = (t - T[i]) / (T[i + 1] - T[i]);
            u = clamp((u - (1 - soft)) / soft);
            u = u * u * (3 - 2 * u);
            out[0] = C[i][0] + (C[i + 1][0] - C[i][0]) * u;
            out[1] = C[i][1] + (C[i + 1][1] - C[i][1]) * u;
            out[2] = C[i][2] + (C[i + 1][2] - C[i][2]) * u;
        };
    }

    // ------------------------------------------------------------------ the form painter
    // Paints one piece as a lit volume, per pixel, once.
    //   box    {x, y, w, h} in the caller's units; res: pixels per unit
    //   mask   (g) => fills the silhouette (any colour) in the caller's units
    //   inflate 'round' (default: a balloon over the outline, see `inflate`) or 'bevel'
    //          (rises for R units in from the edge, then flat: cut card, a coin, a plank)
    //   R, profile  for 'bevel': the rim's width in units and its section ('dome' or default)
    //   relief  height multiplier (1 = as round as it is wide)
    //   height (x, y, m) => extra height in units (veins, dimples), added before lighting
    //   light  [x, y, z] towards the light
    //   ramp   [[tone, hex], …], soft (see rampFn)
    //   stroke { amp, freq, tone, seed } brush streaks that follow the form's tone lines;
    //          field: (x, y, tone) => [a, b, c] gives them a grain of their own (a leaf's veins)
    //   inflate 'none' leaves the surface to `height` alone (a folded leaf, a sheet)
    //   mottle { amp, freq } slow drift of tone (hand-mixed paint)
    //   marks  (g) => brush marks in greys over mid-grey (#808080), in units: lighter greys
    //          lift the tone, darker ones lower it, by markAmp (default 0.5) for full white
    //   spec   { amp, power, color, from, to, ragged } a sheen whose edge the streaks break up
    //   edge   { rough, freq, amp } a brushed outline: the last `rough` units break up (brush
    //          manner only: a piece with a contour keeps a clean edge under its line)
    //   occl   { amp, dir: [x, y], reach } a soft shade creeping in from one side
    //   tint   (x, y, tone, rgb) => void, last word on the colour (units)
    // Returns { canvas, box } for `put`.
    function form(o) {
        const res = o.res ?? 2;
        const box = o.box;
        const w = Math.max(2, Math.ceil(box.w * res)), h = Math.max(2, Math.ceil(box.h * res));
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        g.fillStyle = '#fff';
        o.mask(g);
        const img = g.getImageData(0, 0, w, h);
        const px = img.data;
        const inside = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) inside[i] = px[i * 4 + 3] > 127 ? 1 : 0;
        // height field, in pixels
        const d = edt(inside, w, h);
        let dmax = 0;
        for (let i = 0; i < w * h; i++) if (d[i] > dmax) dmax = d[i];
        const R = Math.min(dmax, (o.R ?? 1e9) * res) || 1;
        const relief = o.relief ?? 1;
        let H;
        if ((o.inflate ?? 'round') === 'round') {
            H = inflate(inside, w, h);
            if (relief !== 1) for (let i = 0; i < w * h; i++) H[i] *= relief;
        } else if (o.inflate === 'none') {
            H = new Float32Array(w * h);
        } else {
            const prof = typeof o.profile === 'function' ? o.profile : o.profile === 'dome' ? (m) => Math.sqrt(Math.max(0, 1 - (1 - m) * (1 - m))) : (m) => 1 - (1 - m) * (1 - m);
            H = new Float32Array(w * h);
            for (let i = 0; i < w * h; i++) H[i] = prof(Math.min(1, d[i] / R)) * relief * R;
            boxBlur(H, w, h, Math.max(1, Math.round((o.smooth ?? 0.006) * Math.max(w, h))), 2);
        }
        if (o.height) {
            for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) if (inside[i]) H[i] += o.height(box.x + x / res, box.y + y / res, Math.min(1, d[i] / R)) * res;
        }
        // brush marks: greys on mid-grey, read back as lighter and darker tones of the same
        // ramp (a stroke is a colour of the palette, never a veil over it)
        let marks = null;
        if (o.marks) {
            const mc = document.createElement('canvas');
            mc.width = w;
            mc.height = h;
            const mg = mc.getContext('2d', { willReadFrequently: true });
            mg.fillStyle = '#808080';
            mg.fillRect(0, 0, w, h);
            mg.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            o.marks(mg);
            marks = mg.getImageData(0, 0, w, h).data;
        }
        const markAmp = o.markAmp ?? 0.5;
        const L = o.light ?? LIGHT;
        const ll = Math.hypot(L[0], L[1], L[2]);
        const lx = L[0] / ll, ly = L[1] / ll, lz = L[2] / ll;
        // half vector for the sheen (the eye is straight in front)
        const hl = Math.hypot(lx, ly, lz + 1), hx = lx / hl, hy = ly / hl, hz = (lz + 1) / hl;
        const ramp = rampFn(o.ramp, o.soft ?? 1);
        const st = o.stroke, mo = o.mottle, oc = o.occl, sp = o.spec;
        const sSeed = seedOf(st?.seed ?? o.seed ?? 1), sFreq = (st?.freq ?? 0.05) / res * 2, sTone = st?.tone ?? 9, sAmp = st?.amp ?? 0;
        const spC = sp ? hex2rgb(sp.color ?? '#ffffff') : null;
        const rgb = [0, 0, 0];
        const eg = o.edge, eR = eg ? (eg.rough ?? 1.5) * res : 0, eF = eg?.freq ?? 0.3, eA = eg?.amp ?? 0.8;
        for (let y = 0, i = 0; y < h; y++) {
            for (let x = 0; x < w; x++, i++) {
                const a = px[i * 4 + 3];
                if (!a) continue;
                const xm = Math.max(0, x - 1), xp = Math.min(w - 1, x + 1), ym = Math.max(0, y - 1), yp = Math.min(h - 1, y + 1);
                const gx = (H[y * w + xp] - H[y * w + xm]) / (xp - xm || 1), gy = (H[yp * w + x] - H[ym * w + x]) / (yp - ym || 1);
                const nz = 1 / Math.sqrt(1 + gx * gx + gy * gy);
                const lam = (-gx * lx - gy * ly + lz) * nz;
                let tone = 0.5 + 0.5 * lam;
                const ux = box.x + x / res, uy = box.y + y / res;
                if (oc) {
                    const s = ((ux - box.x) / box.w - 0.5) * oc.dir[0] + ((uy - box.y) / box.h - 0.5) * oc.dir[1];
                    tone -= oc.amp * smooth(-(oc.reach ?? 0.5), 0.5, s);
                }
                if (mo) tone += mo.amp * noise2(ux * mo.freq, uy * mo.freq, sSeed + 7);
                if (marks) tone += (marks[i * 4] / 255 - 0.502) * markAmp;
                let streak = 0;
                if (sAmp) {
                    if (st.field) {
                        const q = st.field(ux, uy, tone);
                        streak = noise3(q[0], q[1], q[2] ?? 0.5, sSeed) * 0.7 + noise3(q[0] * 2.3, q[1] * 2.3, (q[2] ?? 0.5) * 2.1, sSeed + 3) * 0.3;
                    } else {
                        streak = noise3(x * sFreq, y * sFreq, tone * sTone, sSeed) * 0.7 + noise3(x * sFreq * 2.3, y * sFreq * 2.3, tone * sTone * 2.1, sSeed + 3) * 0.3;
                    }
                    tone += sAmp * streak;
                }
                ramp(clamp(tone), rgb);
                if (sp) {
                    // a sheen with a dry-brushed edge: the streaks decide where it breaks up
                    const sh = Math.pow(Math.max(0, (-gx * hx - gy * hy + hz) * nz), sp.power ?? 30);
                    const k = smooth(sp.from ?? 0.35, sp.to ?? 0.75, sh + (sp.ragged ?? 0.25) * streak) * (sp.amp ?? 0.8);
                    rgb[0] += (spC[0] - rgb[0]) * k;
                    rgb[1] += (spC[1] - rgb[1]) * k;
                    rgb[2] += (spC[2] - rgb[2]) * k;
                }
                if (o.tint) o.tint(ux, uy, tone, rgb, Math.min(1, d[i] / R));
                if (eg && d[i] < eR) {
                    // a brushed edge: the paint breaks up in its last stroke
                    const n = noise2(ux * eF, uy * eF, sSeed + 21) * 0.65 + noise2(ux * eF * 2.7, uy * eF * 2.7, sSeed + 22) * 0.35;
                    px[i * 4 + 3] = a * smooth(0.25, 0.75, d[i] / eR + n * eA);
                }
                px[i * 4] = rgb[0];
                px[i * 4 + 1] = rgb[1];
                px[i * 4 + 2] = rgb[2];
            }
        }
        g.putImageData(img, 0, 0);
        if (o.over) {
            // details painted on top stay inside the silhouette
            g.globalCompositeOperation = 'source-atop';
            o.over(g);
            g.globalCompositeOperation = 'source-over';
        }
        return { canvas: c, box };
    }
    const LIGHT = [-0.6, -0.66, 0.38]; // the house light: from the top left, raking, so a third of every form is in shadow

    // The house light as seen by a piece that will be pasted turned by `rot`: bake the sprite
    // with this and the light stays where it is however the piece is turned.
    const lightFor = (rot, L = LIGHT) => {
        const c = Math.cos(-rot), s = Math.sin(-rot);
        return [L[0] * c - L[1] * s, L[0] * s + L[1] * c, L[2]];
    };

    // Pastes a sprite made by `form` (or any { canvas, box }) with its own transform.
    function put(g, sp, { x = 0, y = 0, rot = 0, s = 1, sx = s, sy = s, alpha = 1 } = {}) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(sx, sy);
        if (alpha !== 1) g.globalAlpha *= alpha;
        g.drawImage(sp.canvas, sp.box.x, sp.box.y, sp.box.w, sp.box.h);
        g.restore();
    }

    // ------------------------------------------------------------------ brush
    // One dry-brush stroke: a bundle of bristle lines along a path, each with its own
    // gaps, so the stroke breaks up at its ends and lets the paint underneath through.
    function dab(g, pts, { w = 6, color = '#fff', alpha = 0.8, bristles = 7, seed = 1, dry = 0.35, taper = 0.6 } = {}) {
        const r = Motion.rng(seedOf(seed));
        // the bristles lift and land between points: a path of two or three points has
        // nowhere to do it and paints nothing, so walk it finely first
        if (pts.length < 16 && pts.length > 1) {
            const fine = [];
            for (let i = 0; i < pts.length - 1; i++) {
                const m = Math.ceil(16 / (pts.length - 1));
                for (let k = 0; k < m; k++) fine.push([pts[i][0] + ((pts[i + 1][0] - pts[i][0]) * k) / m, pts[i][1] + ((pts[i + 1][1] - pts[i][1]) * k) / m]);
            }
            fine.push(pts[pts.length - 1]);
            pts = fine;
        }
        const n = pts.length;
        g.save();
        g.lineCap = 'round';
        g.strokeStyle = color;
        for (let b = 0; b < bristles; b++) {
            const off = (b / Math.max(1, bristles - 1) - 0.5) * w + (r() - 0.5) * w * 0.12;
            const lw = (w / bristles) * (0.9 + r() * 0.9);
            const start = r() * dry * 0.5, end = 1 - r() * dry * 0.6;
            const gap = r() < dry ? 0.25 + r() * 0.5 : -1, gapW = 0.04 + r() * 0.12;
            g.globalAlpha = alpha * (0.55 + r() * 0.45);
            g.lineWidth = lw;
            g.beginPath();
            let pen = false;
            for (let i = 0; i < n; i++) {
                const u = i / (n - 1);
                const on = u >= start && u <= end && !(gap > 0 && Math.abs(u - gap) < gapW);
                const [x, y] = pts[i];
                const q = pts[Math.min(n - 1, i + 1)], p = pts[Math.max(0, i - 1)];
                const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1;
                const k = off * (1 - taper * Math.pow(Math.abs(u * 2 - 1), 3));
                const X = x - (ty / tl) * k, Y = y + (tx / tl) * k;
                if (on && !pen) g.moveTo(X, Y);
                else if (on) g.lineTo(X, Y);
                pen = on;
            }
            g.stroke();
        }
        g.restore();
    }

    // Only the shadow of what `drawFn(g)` paints, and only on paint that is already there:
    // how one piece shades the pieces under it. Blur and offset in the caller's units.
    function cast(g, drawFn, { blur = 6, dx = 3, dy = 4, color = 'rgba(20,16,30,0.5)' } = {}) {
        const m = g.getTransform(), k = Math.hypot(m.a, m.b), BIG = 20000;
        g.save();
        g.globalCompositeOperation = 'source-atop';
        g.setTransform(m.a, m.b, m.c, m.d, m.e - BIG, m.f);
        g.shadowColor = color;
        g.shadowBlur = blur * k;
        g.shadowOffsetX = BIG + dx * k;
        g.shadowOffsetY = dy * k;
        drawFn(g);
        g.restore();
    }

    // ------------------------------------------------------------------ the emblem manner
    // Tattoo-flash paint: a flat local colour, shade and light laid inside it with an
    // airbrush, and a dark contour that is heavier on the side away from the light.
    const INK = '#191c38'; // the contour: a blue-black, never pure black
    const SHADE_DIR = [0.62, 0.78]; // where shadows fall (the light is at the top left)

    // Airbrush inside a shape: colour sprayed in from its edge, `w` units deep, pushed
    // `push` units along `dir` (default: in from the shadow side). Call it between
    // save/clip and restore, or let `piece` do it.
    function spray(g, pts, { color = INK, alpha = 0.5, w = 10, push = null, dir = SHADE_DIR } = {}) {
        const m = g.getTransform(), k = Math.hypot(m.a, m.b), BIG = 20000, d = push ?? w * 0.6;
        const b = bbox(pts, w * 6 + 40);
        g.save();
        g.setTransform(m.a, m.b, m.c, m.d, m.e - BIG, m.f);
        g.shadowColor = rgba(color, alpha);
        g.shadowBlur = w * k;
        g.shadowOffsetX = BIG - dir[0] * d * k;
        g.shadowOffsetY = -dir[1] * d * k;
        g.fillStyle = '#000';
        g.beginPath();
        g.rect(b.x, b.y, b.w, b.h);
        trace(g, pts);
        g.fill('evenodd');
        g.restore();
    }

    // One piece of an emblem.
    //   fill    '#hex', or { from: [x, y], to: [x, y], stops: [[0, hex], [1, hex]] }
    //   shade   { color, alpha, w, push, dir } airbrushed in from the shadow side (or a list)
    //   light   the same from the lit side (dir defaults to the opposite of SHADE_DIR)
    //   detail  (g) => inner drawing, clipped to the piece
    //   line    contour width in units (0 = none); ink: its colour; heavy: how much thicker
    //           the contour is on the shadow side (in line widths)
    //   cast    { blur, dx, dy, color }: its shadow on the pieces already painted under it
    function piece(g, pts, o = {}) {
        const lw = o.line ?? 2.4, ink = o.ink ?? INK, heavy = o.heavy ?? 0.7;
        const outline = () => {
            g.beginPath();
            trace(g, pts);
        };
        if (o.cast) cast(g, (q) => { q.beginPath(); trace(q, pts); q.fillStyle = '#000'; q.fill(); }, o.cast);
        if (lw > 0) {
            // the heavy side of the contour: the shape itself in ink, nudged towards the shadow
            g.save();
            g.translate(SHADE_DIR[0] * lw * heavy, SHADE_DIR[1] * lw * heavy);
            outline();
            g.fillStyle = ink;
            g.fill();
            g.lineJoin = 'round';
            g.lineWidth = lw;
            g.strokeStyle = ink;
            g.stroke();
            g.restore();
        }
        if (typeof o.fill === 'object') {
            const gr = g.createLinearGradient(o.fill.from[0], o.fill.from[1], o.fill.to[0], o.fill.to[1]);
            for (const [t, c] of o.fill.stops) gr.addColorStop(t, c);
            g.fillStyle = gr;
        } else {
            g.fillStyle = o.fill ?? '#ccc';
        }
        outline();
        g.fill();
        g.save();
        outline();
        g.clip();
        for (const sh of [].concat(o.shade ?? [])) spray(g, pts, sh);
        for (const li of [].concat(o.light ?? [])) spray(g, pts, { color: '#ffffff', alpha: 0.4, dir: [-SHADE_DIR[0], -SHADE_DIR[1]], ...li });
        if (o.detail) o.detail(g);
        g.restore();
        if (lw > 0) {
            outline();
            g.lineJoin = 'round';
            g.lineWidth = lw;
            g.strokeStyle = ink;
            g.stroke();
        }
    }

    // An ink line with a brush pen: widest in the middle, tapering to both ends (or held,
    // with taper [0, 0]). For inner drawing: feather shafts, folds, creases.
    function ink(g, pts, { w = 2, color = INK, taper = [1, 1], alpha = 1 } = {}) {
        const n = pts.length;
        if (n < 2) return;
        const L = [], Rr = [];
        for (let i = 0; i < n; i++) {
            const p = pts[Math.max(0, i - 1)], q = pts[Math.min(n - 1, i + 1)];
            const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1;
            const u = i / (n - 1);
            const k = (1 - taper[0] * Math.pow(1 - Math.min(1, u * 2.2), 2)) * (1 - taper[1] * Math.pow(1 - Math.min(1, (1 - u) * 2.2), 2));
            const h = Math.max(0.12, (w * k) / 2);
            L.push([pts[i][0] - (ty / tl) * h, pts[i][1] + (tx / tl) * h]);
            Rr.push([pts[i][0] + (ty / tl) * h, pts[i][1] - (tx / tl) * h]);
        }
        g.save();
        g.globalAlpha *= alpha;
        g.fillStyle = color;
        g.beginPath();
        trace(g, [...L, ...Rr.reverse()]);
        g.fill();
        g.restore();
    }

    // Text set along a curve (a ribbon's lettering). pts: the baseline; the text is centred
    // on it. Each glyph is drawn by `glyph(g, ch)` at its own origin, or filled in `color`.
    function textOn(g, text, pts, { font = '48px serif', color = INK, spacing = 0, glyph = null, align = 0.5 } = {}) {
        g.save();
        g.font = font;
        g.textBaseline = 'alphabetic';
        const ws = [...text].map((ch) => g.measureText(ch).width + spacing);
        const total = ws.reduce((a, b) => a + b, 0);
        const seg = [];
        let len = 0;
        for (let i = 1; i < pts.length; i++) {
            const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
            seg.push([len, d]);
            len += d;
        }
        const at = (sd) => {
            let i = 0;
            while (i < seg.length - 1 && seg[i][0] + seg[i][1] < sd) i++;
            const k = clamp((sd - seg[i][0]) / (seg[i][1] || 1), -2, 3), p = pts[i], q = pts[i + 1];
            return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, Math.atan2(q[1] - p[1], q[0] - p[0])];
        };
        let sd = (len - total) * align;
        [...text].forEach((ch, i) => {
            const [x, y, a] = at(sd + ws[i] / 2);
            g.save();
            g.translate(x, y);
            g.rotate(a);
            g.translate(-(ws[i] - spacing) / 2, 0);
            if (glyph) glyph(g, ch, i);
            else {
                g.fillStyle = color;
                g.fillText(ch, 0, 0);
            }
            g.restore();
            sd += ws[i];
        });
        g.restore();
    }

    // ------------------------------------------------------------------ sheets and sprites
    // Helpers the first film's painters each wrote for themselves, lifted here for the next.

    // A turned frame: turn and mirror GEOMETRY, never the canvas, so the light stays where
    // it is. f([x, y]) → the page point; f.pts(list); f.dir(v) a direction of the part on
    // the page; f.sub(x, y, rot, s) a frame inside it (a wing on a body, a hand on a clock).
    function frame(x, y, rot = 0, s = 1, flip = false) {
        const c = Math.cos(rot) * s, sn = Math.sin(rot) * s, k = flip ? -1 : 1;
        const f = (p) => [x + p[0] * k * c - p[1] * sn, y + p[0] * k * sn + p[1] * c];
        f.pts = (a) => a.map(f);
        f.rot = rot;
        f.s = s;
        f.flip = flip;
        f.dir = (v) => [(v[0] * k * c - v[1] * sn) / s, (v[0] * k * sn + v[1] * c) / s];
        f.sub = (px, py, r2 = 0, s2 = 1) => {
            const o = f([px, py]);
            return frame(o[0], o[1], rot + (flip ? -r2 : r2), s * s2, flip);
        };
        return f;
    }

    // A thing painted on its own sheet: its casts (`cast` only falls on paint already there)
    // and its holes (`destination-out`) stay inside it instead of landing on its neighbours.
    // paint(g) draws in the caller's units; returns { canvas, box } for `put`, `sprayIn`,
    // `stamp`. Size the box generously: contours and casts need a margin.
    function sheet(box, res, paint) {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil(box.w * res));
        c.height = Math.max(1, Math.ceil(box.h * res));
        const g = c.getContext('2d');
        g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
        paint(g);
        return { canvas: c, box, res };
    }

    // The airbrush for a sprite: colour sprayed in from the sprite's own alpha edges (holes
    // included), `w` units deep, from the side `dir` points away from. What brings a lit
    // `form` volume back to the emblem manner. res: the sprite's pixels per unit.
    function sprayIn(sp, res, { color = INK, alpha = 0.5, w = 6, push = null, dir = SHADE_DIR } = {}) {
        const c = sp.canvas, d = (push ?? w * 0.6) * res, pad = Math.ceil(w * res * 2 + d), BIG = 20000;
        const inv = document.createElement('canvas');
        inv.width = c.width + pad * 2;
        inv.height = c.height + pad * 2;
        const q = inv.getContext('2d');
        q.fillStyle = '#000';
        q.fillRect(0, 0, inv.width, inv.height);
        q.globalCompositeOperation = 'destination-out';
        q.drawImage(c, pad, pad);
        const g = c.getContext('2d');
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = 'source-atop';
        g.shadowColor = rgba(color, alpha);
        g.shadowBlur = w * res;
        g.shadowOffsetX = BIG - dir[0] * d;
        g.shadowOffsetY = -dir[1] * d;
        g.drawImage(inv, -pad - BIG, -pad);
        g.restore();
    }

    // The contour for a sprite: its silhouette in ink, a little larger and heavier towards
    // the shadow, under the sprite itself; holes get their contour too. `cast` adds its
    // shadow on the paint already under it. Airbrush first, stamp after: a spray laid over
    // the ink turns the contour into a soft halo.
    function stamp(G, sp, { lw = 2.2, sh = SHADE_DIR, heavy = 0.75, cast: cs = null, ink: col = INK } = {}) {
        const b = sp.box;
        const sil = document.createElement('canvas');
        sil.width = sp.canvas.width;
        sil.height = sp.canvas.height;
        const q = sil.getContext('2d');
        q.drawImage(sp.canvas, 0, 0);
        q.globalCompositeOperation = 'source-in';
        q.fillStyle = col;
        q.fillRect(0, 0, sil.width, sil.height);
        if (cs) cast(G, (c) => c.drawImage(sil, b.x, b.y, b.w, b.h), cs);
        const d = lw * 0.8;
        for (const [ox, oy] of [[0, 0], [sh[0] * lw * heavy * 0.5, sh[1] * lw * heavy * 0.5], [sh[0] * lw * heavy, sh[1] * lw * heavy]]) {
            for (let k = 0; k < 16; k++) G.drawImage(sil, b.x + ox + Math.cos(k * 0.3927) * d, b.y + oy + Math.sin(k * 0.3927) * d, b.w, b.h);
        }
        G.drawImage(sp.canvas, b.x, b.y, b.w, b.h);
    }

    // A relief (a coin, chased metal, filigree, carving): paint its heights as greys with
    // ordinary canvas strokes (white = high) and get back height(x, y) in 0..1 for `form`
    // (`inflate: 'none'`, `height: (x, y) => relief(x, y) * depth`). Blur is in units.
    function reliefField(box, res, paint, blur = 0) {
        const sp = sheet(box, res, (g) => {
            g.fillStyle = '#000';
            g.fillRect(box.x, box.y, box.w, box.h);
            paint(g);
        });
        const w = sp.canvas.width, h = sp.canvas.height;
        const d = sp.canvas.getContext('2d').getImageData(0, 0, w, h).data;
        const f = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) f[i] = d[i * 4] / 255;
        if (blur > 0) boxBlur(f, w, h, Math.max(1, Math.round(blur * res)), 2); // on floats: a blur on the 8-bit canvas terraces the light
        return (x, y) => {
            const X = Math.max(0, Math.min(w - 1, Math.round((x - box.x) * res))), Y = Math.max(0, Math.min(h - 1, Math.round((y - box.y) * res)));
            return f[Y * w + X];
        };
    }

    // The tooth of the board under the paint: fine light and dark specks laid on whatever
    // is already painted in `box` (never on bare canvas). Call it last on a layer.
    const toothTiles = new Map();
    function tooth(g, box, { amp = 0.07, size = 1, seed = 1 } = {}) {
        const key = seed + '/' + amp;
        if (!toothTiles.has(key)) {
            const c = document.createElement('canvas');
            c.width = c.height = 256;
            const q = c.getContext('2d');
            const im = q.createImageData(256, 256);
            for (let i = 0; i < 256 * 256; i++) {
                const x = i & 255, y = i >> 8;
                // two octaves: specks, and a slower mottle (wrapped so the tile repeats)
                const v = (hashI(x, y, 0, seed) - 0.5) * 0.7 + noise3((x / 256) * 16, (y / 256) * 16, 0.5, seed) * 0.0 + (hashI(x >> 1, y >> 1, 1, seed) - 0.5) * 0.5;
                const dark = v < 0;
                im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = dark ? 10 : 255;
                im.data[i * 4 + 3] = Math.min(255, Math.abs(v) * 2 * amp * 255 * (dark ? 1.25 : 1));
            }
            q.putImageData(im, 0, 0);
            toothTiles.set(key, c);
        }
        // laid as a repeating pattern in pixels (tiles pasted one by one leave seams)
        const tile = toothTiles.get(key), m = g.getTransform();
        const pat = g.createPattern(tile, 'repeat');
        pat.setTransform(new DOMMatrix().scale(size));
        g.save();
        g.globalCompositeOperation = 'source-atop';
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = pat;
        g.fillRect(m.a * box.x + m.e, m.d * box.y + m.f, m.a * box.w, m.d * box.h);
        g.restore();
    }

    // The hand in the paint. A piece painted as local colour, airbrush and contour is clean
    // where a painter's is not: inside every fill the brush leaves strokes that follow the
    // form, and the mix drifts warmer and cooler. This lays that over a finished layer:
    // streaks along the layer's own edges and folds (across a flat they take the slant a
    // right hand gives them), a slow drift of the mix, on the paint only. No edge moves:
    // a line stays where it was drawn.
    //   amp   how much a stroke lightens or darkens (0.07 = 7 %)
    //   len   half the length of a stroke, in output pixels at 1920 (scaled with the output)
    //   drift how much the mix wanders in value; warm: and in temperature
    //   slant the angle strokes take across a flat (radians); wander: how far it strays
    function brushwork(canvas, { amp = 0.07, len = 9, drift = 0.035, warm = 0.02, slant = -0.55, wander = 0.7, seed = 1, k = 1.2 } = {}) {
        const w = canvas.width, h = canvas.height;
        if (w * h < 64) return;
        const g = canvas.getContext('2d', { willReadFrequently: true });
        const img = g.getImageData(0, 0, w, h), px = img.data;
        // luminance at half size, softened: the form the strokes follow
        const hw = Math.ceil(w / 2), hh = Math.ceil(h / 2);
        const lum = new Float32Array(hw * hh);
        for (let y = 0; y < hh; y++) {
            for (let x = 0; x < hw; x++) {
                const i = (Math.min(h - 1, y * 2) * w + Math.min(w - 1, x * 2)) * 4;
                lum[y * hw + x] = ((px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11) * px[i + 3]) / 65025;
            }
        }
        boxBlur(lum, hw, hh, 2, 2);
        // direction along the edges, kept as a doubled angle so opposite slopes agree
        const c2 = new Float32Array(hw * hh), s2 = new Float32Array(hw * hh);
        for (let y = 1; y < hh - 1; y++) {
            for (let x = 1; x < hw - 1; x++) {
                const i = y * hw + x;
                const gx = lum[i + 1] - lum[i - 1], gy = lum[i + hw] - lum[i - hw];
                const m = Math.hypot(gx, gy);
                // across a flat: a slant that wanders slowly
                const th = slant + wander * noise2(x / 140, y / 140, seed + 5);
                const wgt = Math.min(1, m * 40);
                // the stroke runs along the edge: perpendicular to the slope
                const ex = m > 1e-6 ? -gy / m : 0, ey = m > 1e-6 ? gx / m : 0;
                c2[i] = wgt * (ex * ex - ey * ey) + (1 - wgt) * Math.cos(2 * th);
                s2[i] = wgt * (2 * ex * ey) + (1 - wgt) * Math.sin(2 * th);
            }
        }
        boxBlur(c2, hw, hh, 4, 2);
        boxBlur(s2, hw, hh, 4, 2);
        // two grains of bristle: a fine one and a broad one
        const L = Math.max(3, Math.round(len * (k / 1.2)));
        const n1 = new Float32Array(w * h), n2 = new Float32Array(w * h);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                n1[y * w + x] = hashI(x, y, 1, seed) - 0.5;
                n2[y * w + x] = hashI(x >> 2, y >> 2, 2, seed) - 0.5;
            }
        }
        const norm = 1 / (0.29 / Math.sqrt(2 * L + 1));
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const o = (y * w + x) * 4;
                if (!px[o + 3]) continue;
                const hi = Math.min(hh - 1, y >> 1) * hw + Math.min(hw - 1, x >> 1);
                const a = 0.5 * Math.atan2(s2[hi], c2[hi]);
                const dx = Math.cos(a), dy = Math.sin(a);
                let acc1 = 0, acc2 = 0;
                for (let t = -L; t <= L; t++) {
                    const X = Math.max(0, Math.min(w - 1, Math.round(x + dx * t))), Y = Math.max(0, Math.min(h - 1, Math.round(y + dy * t)));
                    acc1 += n1[Y * w + X];
                    acc2 += n2[Y * w + X];
                }
                const st = Math.max(-2.2, Math.min(2.2, (acc1 / (2 * L + 1)) * norm * 0.55 + (acc2 / (2 * L + 1)) * 3.4 * 0.75));
                const dr = noise2(x / (90 * k), y / (90 * k), seed + 9), tw = noise2(x / (150 * k), y / (150 * k), seed + 13);
                const f = 1 + amp * st * 0.5 + drift * dr;
                px[o] = Math.max(0, Math.min(255, px[o] * f * (1 + warm * tw)));
                px[o + 1] = Math.max(0, Math.min(255, px[o + 1] * f));
                px[o + 2] = Math.max(0, Math.min(255, px[o + 2] * f * (1 - warm * tw)));
            }
        }
        g.putImageData(img, 0, 0);
    }

    // ------------------------------------------------------------------ the dive
    // A picture is a stack of painted layers at depths z; the camera sits on the axis at
    // cam.z looking down it. A layer `D` away is drawn at its painted size (1 layer unit =
    // 1 logical unit, origin at the centre of the frame); nearer ones grow as D / distance,
    // so a hole in a layer opens as the camera goes through it into the next picture.
    //
    //   layers: [{ id, z, box: {x, y, w, h}, paint(g), res?, hole? }]
    //     box   what the layer covers, in its own units (make far plates bigger than the
    //           frame: from the picture before, they are seen small and whole)
    //     res   extra paint resolution (default 1 = the output's, times `oversample`)
    //     hole  radius of a round hole about the origin: the layer is dropped once that
    //           hole is wider than the frame
    //     brush false for a layer that already has its brushwork (the brush manner), or
    //           { amp, len, drift, warm } to tune the hand laid over it (see `brushwork`)
    //     far   [s0, s1]: invisible while smaller than scale s0, whole from s1 (a picture
    //           that must not show as a speck before it arrives)
    //   cam: { z, focus (a depth), aperture, roll, x, y }
    //     blur = aperture × |scale of the layer − scale of the focus plane|, in logical
    //     units: what is near smears, what is far softens.
    function rig(env, layers, o = {}) {
        const D = o.D ?? 1000, over = o.oversample ?? 1.12;
        const order = layers.slice().sort((a, b) => b.z - a.z);
        const cv = new Map();
        // A loose piece (`loose`) is cut to its paint: its box only says where to paint it,
        // and what it covers on screen is what it painted (with two pixels of margin).
        const trim = (ly, c, res) => {
            const w = c.width, h = c.height, d = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
            let x0 = w, y0 = h, x1 = -1, y1 = -1;
            for (let y = 0; y < h; y++) {
                const row = y * w * 4;
                for (let x = 0; x < w; x++) {
                    if (d[row + x * 4 + 3] > 2) {
                        if (x < x0) x0 = x;
                        if (x > x1) x1 = x;
                        if (y < y0) y0 = y;
                        y1 = y;
                    }
                }
            }
            if (x1 < 0) {
                ly.trimmed = { x: ly.box.x, y: ly.box.y, w: 1 / res, h: 1 / res };
                const e = document.createElement('canvas');
                e.width = e.height = 1;
                return e;
            }
            // paint that reaches the box's edge was cut by it: the box is too small
            if (x0 === 0 || y0 === 0 || x1 === w - 1 || y1 === h - 1) console.warn(`souvenir: loose layer ${ly.id} touches its box (widen it)`);
            x0 = Math.max(0, x0 - 2);
            y0 = Math.max(0, y0 - 2);
            x1 = Math.min(w - 1, x1 + 2);
            y1 = Math.min(h - 1, y1 + 2);
            const o = document.createElement('canvas');
            o.width = x1 - x0 + 1;
            o.height = y1 - y0 + 1;
            o.getContext('2d').drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
            c.width = c.height = 0;
            ly.trimmed = { x: ly.box.x + x0 / res, y: ly.box.y + y0 / res, w: o.width / res, h: o.height / res };
            return o;
        };
        const canvasOf = (ly) => {
            if (!cv.has(ly.id)) {
                const res = env.k * over * (ly.res ?? 1);
                let c = document.createElement('canvas');
                c.width = Math.max(1, Math.ceil(ly.box.w * res));
                c.height = Math.max(1, Math.ceil(ly.box.h * res));
                const g = c.getContext('2d');
                g.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
                ly.paint(g, res);
                if (ly.loose) c = trim(ly, c, res);
                // the hand in the paint, unless the layer has its own (the brush manner does)
                if (ly.brush !== false && (o.brush ?? true)) brushwork(c, { seed: seedOf(ly.id), k: env.k, ...(typeof ly.brush === 'object' ? ly.brush : {}) });
                cv.set(ly.id, c);
            }
            return cv.get(ly.id);
        };
        // Each layer also as a pyramid of halves (every level a 2 × 2 average of the one
        // before). A layer seen small, or blurred at a reduced size, is drawn from the level
        // nearest its size on screen: drawn straight from the full painting it would be
        // point-sampled, and the paint's grain would shimmer from frame to frame.
        const mp = new Map();
        const resOf = (ly) => env.k * over * (ly.res ?? 1);
        const levelsOf = (ly) => {
            if (!mp.has(ly.id)) {
                const levels = [canvasOf(ly)];
                while (levels.length < 7) {
                    const p = levels[levels.length - 1];
                    if (Math.min(p.width, p.height) < 32) break;
                    const c = document.createElement('canvas');
                    c.width = Math.ceil(p.width / 2);
                    c.height = Math.ceil(p.height / 2);
                    c.getContext('2d').drawImage(p, 0, 0, p.width, p.height, 0, 0, p.width / 2, p.height / 2);
                    levels.push(c);
                }
                mp.set(ly.id, levels);
            }
            return mp.get(ly.id);
        };
        const drop = (ly) => {
            if (!cv.has(ly.id)) return;
            for (const c of mp.get(ly.id) ?? [cv.get(ly.id)]) c.width = c.height = 0;
            cv.delete(ly.id);
            mp.delete(ly.id);
        };
        const tmp = document.createElement('canvas');
        const tg = tmp.getContext('2d');
        const W = env.W, H = env.H, diag = Math.hypot(W, H) / 2;
        // A loose piece floats: it turns slowly on itself, sways and drifts a little, each at
        // its own rates (from its id), about the middle of its paint. `loose` may be true or
        // { spin (rad/s), sway (rad), bob (units), turn (a fixed angle) } to set any of them.
        const poseOf = (ly, t) => {
            if (!ly.loose) return null;
            const f = typeof ly.loose === 'object' ? ly.loose : {}, sd = seedOf(ly.id), h = (i) => hashI(i, 7, 3, sd), TAU = Math.PI * 2;
            const spin = f.spin ?? (h(1) < 0.5 ? -1 : 1) * (0.03 + 0.06 * h(2));
            const sway = f.sway ?? 0.03 + 0.05 * h(3), bob = f.bob ?? 5 + 10 * h(4);
            const a = (f.turn ?? 0) + spin * t + sway * Math.sin((TAU * t) / (5 + 4 * h(5)) + TAU * h(8));
            const bb = ly.trimmed ?? ly.box;
            return {
                a, dx: bob * Math.sin((TAU * t) / (6 + 5 * h(6)) + TAU * h(9)), dy: bob * 0.8 * Math.cos((TAU * t) / (7 + 5 * h(7)) + TAU * h(10)),
                px: bb.x + bb.w / 2, py: bb.y + bb.h / 2,
            };
        };
        // how far from the axis a layer reaches (what is off the frame does not count)
        const reachOf = (ly) => Math.min(diag, Math.max(Math.hypot(ly.box.x, ly.box.y), Math.hypot(ly.box.x + ly.box.w, ly.box.y), Math.hypot(ly.box.x, ly.box.y + ly.box.h), Math.hypot(ly.box.x + ly.box.w, ly.box.y + ly.box.h)));

        // One instant. g is in logical units. `motion.dz` is how far the camera travels
        // between this instant and the next one of the same exposure (see `draw`): a layer
        // that jumps more than a pixel and a half between them is softened by that much,
        // so the exposures never show as separate ghosts.
        function still(g, cam, motion = null) {
            const z = cam.z, sF = D / Math.max(1, cam.focus - z), ap = cam.aperture ?? 12, roll = cam.roll ?? 0, cx = cam.x ?? 0, cy = cam.y ?? 0;
            const k = pxScale(g), dz = motion ? Math.abs(motion.dz) : 0;
            for (const ly of order) {
                const d = ly.z - z;
                // a layer well behind the camera gives its memory back (a long film has a
                // hundred of them); it is painted again if the film is ever run backwards
                if (d < -D * 0.2) drop(ly);
                if (d <= D * 0.025) continue;
                const s = D / d;
                if (ly.hole && ly.hole * s > diag * 1.08) continue;
                // is any of it in the frame?
                const bx = (ly.box.x - cx) * s, by = (ly.box.y - cy) * s, bw = ly.box.w * s, bh = ly.box.h * s;
                const reach = Math.hypot(bw, bh);
                if (!roll && !ly.loose && (bx > W / 2 || by > H / 2 || bx + bw < -W / 2 || by + bh < -H / 2)) continue;
                if ((roll || ly.loose) && Math.hypot(bx + bw / 2, by + bh / 2) - reach * 0.58 - (ly.loose ? 20 * s : 0) > diag) continue;
                // it fades as the camera goes through it, and (if asked) while it is still a speck
                const fade = smooth(D * 0.03, D * 0.085, d) * (ly.alpha ?? 1) * (ly.far ? smooth(ly.far[0], ly.far[1], s) : 1);
                if (fade <= 0.003) continue;
                const gap = dz > 0 && d > dz ? Math.abs(D / (d - dz / 2) - D / (d + dz / 2)) * reachOf(ly) * k : 0;
                const bpx = Math.hypot(ap * Math.abs(s - sF) * (ly.blur ?? 1) * k, Math.max(0, gap - 1.5) * 0.5);
                const levels = levelsOf(ly), res = resOf(ly), bb = ly.trimmed ?? ly.box, pose = poseOf(ly, cam.t ?? 0);
                // the level whose pixels land nearest one to one (never much smaller: bilinear
                // sampling below about 0.6 skips pixels)
                const place = (q, kq) => {
                    const L = Math.max(0, Math.min(levels.length - 1, Math.floor(Math.log2(res / (s * kq)) + 0.35)));
                    const c = levels[L], u = (1 << L) / res;
                    q.translate(W / 2, H / 2);
                    q.rotate(roll);
                    q.scale(s, s);
                    q.translate(-cx, -cy);
                    if (pose) {
                        q.translate(pose.px + pose.dx, pose.py + pose.dy);
                        q.rotate(pose.a);
                        q.translate(-pose.px, -pose.py);
                    }
                    q.drawImage(c, bb.x, bb.y, c.width * u, c.height * u);
                };
                // where it lands on the frame, in logical units (its four corners carried through
                // its own pose, the camera's scale and the roll)
                const onScreen = () => {
                    const cr = Math.cos(roll), sr = Math.sin(roll), ca = pose ? Math.cos(pose.a) : 1, sa = pose ? Math.sin(pose.a) : 0;
                    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
                    for (const [X, Y] of [[bb.x, bb.y], [bb.x + bb.w, bb.y], [bb.x, bb.y + bb.h], [bb.x + bb.w, bb.y + bb.h]]) {
                        let x = X, y = Y;
                        if (pose) {
                            x = pose.px + pose.dx + ca * (X - pose.px) - sa * (Y - pose.py);
                            y = pose.py + pose.dy + sa * (X - pose.px) + ca * (Y - pose.py);
                        }
                        const u = (x - cx) * s, v = (y - cy) * s, sx = W / 2 + cr * u - sr * v, sy = H / 2 + sr * u + cr * v;
                        x0 = Math.min(x0, sx);
                        y0 = Math.min(y0, sy);
                        x1 = Math.max(x1, sx);
                        y1 = Math.max(y1, sy);
                    }
                    return [x0, y0, x1, y1];
                };
                g.save();
                g.globalAlpha = fade;
                if (bpx < 0.5) {
                    place(g, k);
                } else {
                    // Blur at a reduced size, so that the blur is 3 to 6 pixels of the working
                    // copy whatever its width: enough that halving the copy does not show, and
                    // the copy sits on a fixed grid of the output (a whole number of its own
                    // pixels of margin), so nothing shifts when the margin changes.
                    // Only the part of the frame the layer covers is worked on (a small piece costs
                    // what it covers, not the whole frame), on the same fixed grid.
                    const sh = Math.max(0, Math.min(5, Math.floor(Math.log2(bpx / 3))));
                    const q = 1 / (1 << sh), pad = Math.ceil(bpx * q * 2.6);
                    const [sx0, sy0, sx1, sy1] = onScreen();
                    const X0 = Math.max(0, sx0 * k), Y0 = Math.max(0, sy0 * k), X1 = Math.min(env.px[0], sx1 * k), Y1 = Math.min(env.px[1], sy1 * k);
                    const spread = bpx * 2.6; // how far its blur reaches, in pixels
                    if (sx1 * k < -spread || sy1 * k < -spread || sx0 * k > env.px[0] + spread || sy0 * k > env.px[1] + spread) {
                        g.restore();
                        continue;
                    }
                    const ix0 = Math.floor(X0 * q) - pad, iy0 = Math.floor(Y0 * q) - pad;
                    const tw = Math.max(1, Math.ceil(X1 * q) + pad - ix0), th = Math.max(1, Math.ceil(Y1 * q) + pad - iy0);
                    if (tmp.width < tw || tmp.height < th) {
                        tmp.width = Math.max(tmp.width, tw);
                        tmp.height = Math.max(tmp.height, th);
                    }
                    tg.setTransform(1, 0, 0, 1, 0, 0);
                    tg.filter = 'none';
                    tg.clearRect(0, 0, tw, th);
                    tg.save();
                    tg.beginPath();
                    tg.rect(0, 0, tw, th);
                    tg.clip();
                    tg.filter = `blur(${(bpx * q).toFixed(3)}px)`;
                    tg.setTransform(k * q, 0, 0, k * q, -ix0, -iy0);
                    place(tg, k * q);
                    tg.restore();
                    g.imageSmoothingQuality = 'high';
                    g.drawImage(tmp, 0, 0, tw, th, ix0 / (k * q), iy0 / (k * q), tw / (k * q), th / (k * q));
                }
                g.restore();
            }
        }

        // A frame as a camera with an open shutter sees it: several instants averaged.
        // camAt(t) → cam. As many instants as the sharpest moving thing needs: between two of
        // them nothing may jump more than a couple of pixels, or more than its own blur (what
        // is near and far out of focus hides a wide step; what is in focus does not).
        const sub = document.createElement('canvas'), acc = document.createElement('canvas');
        function draw(g, t, camAt, { shutter = 0.5, bg = '#000', maxSamples = 12 } = {}) {
            const dt = shutter / env.fps;
            const a = camAt(t - dt / 2), b = camAt(t + dt / 2), m = camAt(t);
            const sF = D / Math.max(1, m.focus - m.z), ap = m.aperture ?? 12;
            const slide = Math.hypot((b.x ?? 0) - (a.x ?? 0), (b.y ?? 0) - (a.y ?? 0)), turn = Math.abs((b.roll ?? 0) - (a.roll ?? 0)) * diag;
            let need = 0;
            for (const ly of order) {
                const da = ly.z - a.z, db = ly.z - b.z, s = D / (ly.z - m.z);
                if (Math.min(da, db) <= D * 0.085 || (ly.hole && ly.hole * s > diag) || (ly.far && s <= ly.far[0])) continue;
                const disp = (Math.abs(D / db - D / da) * reachOf(ly) + slide * s + turn) * env.k;
                need = Math.max(need, disp / Math.max(2, ap * Math.abs(s - sF) * (ly.blur ?? 1) * env.k));
            }
            const n = need < 0.4 ? 1 : Math.min(maxSamples, Math.max(2, Math.ceil(need)));
            if (n === 1) {
                g.fillStyle = bg;
                g.fillRect(0, 0, W, H);
                still(g, { ...m, t });
                return n;
            }
            for (const c of [sub, acc]) {
                if (c.width !== env.px[0] || c.height !== env.px[1]) {
                    c.width = env.px[0];
                    c.height = env.px[1];
                }
            }
            const sg = sub.getContext('2d'), ag = acc.getContext('2d');
            const motion = { dz: (b.z - a.z) / n };
            for (let i = 0; i < n; i++) {
                sg.setTransform(env.k, 0, 0, env.k, 0, 0);
                sg.globalAlpha = 1;
                sg.filter = 'none';
                sg.fillStyle = bg;
                sg.fillRect(0, 0, W, H);
                const ti = t - dt / 2 + (dt * (i + 0.5)) / n;
                still(sg, { ...camAt(ti), t: ti }, motion);
                ag.globalAlpha = 1 / (i + 1);
                ag.drawImage(sub, 0, 0);
            }
            g.drawImage(acc, 0, 0, W, H);
            return n;
        }
        return { still, draw, canvasOf, D };
    }

    // A flight down the axis that keeps gathering speed and turning. The speed grows by the
    // same ratio every second from v0 (so every stretch feels quicker than the one before),
    // reaches vmax as the camera passes depth `peakAt`, and then, over the last `hold`
    // seconds, eases down at `fall` per second to land on what the flight was going to. The
    // camera rolls on its axis `turns` whole turns over the flight (a whole number: it lands
    // level), slowly at first and faster as it goes faster (`bank` > 1 holds the roll back at
    // the start), so that the roll is part of the speed. Everything is a table made once.
    //   const F = flight({ start, v0, vmax, peakAt, hold });
    //   F.at(t) → { z, focus, aperture, roll }; F.length; F.tOf(z) (when the camera is at z);
    //   F.speed(t)
    function flight({ start, v0, vmax, peakAt, hold, fall = 0.55, soft = 0.5, turns = 1, bank = 1.3, focus = 1000, aperture = 10, step = 1 / 480 }) {
        const sp = (x) => (x > 30 ? x : Math.log1p(Math.exp(x)));
        const speedOf = (k, tp) => (t) => v0 * Math.exp(k * t - (k + fall) * soft * sp((t - tp) / soft));
        const run = (k, tp, until) => {
            const v = speedOf(k, tp), z = [start];
            for (let i = 1; i * step <= until + step; i++) z.push(z[i - 1] + ((v((i - 1) * step) + v(i * step)) / 2) * step);
            return z;
        };
        // the rise that brings the camera to peakAt just as it reaches vmax
        let lo = 1e-4, hi = 5;
        for (let it = 0; it < 60; it++) {
            const k = (lo + hi) / 2, tp = Math.log(vmax / v0) / k, z = run(k, tp, tp);
            if (z[Math.round(tp / step)] > peakAt) lo = k;
            else hi = k;
        }
        const k = (lo + hi) / 2, tp = Math.log(vmax / v0) / k, length = tp + hold;
        const Z = run(k, tp, length), speed = speedOf(k, tp), z1 = Z[Z.length - 1];
        const zAt = (t) => {
            const f = Math.max(0, Math.min(Z.length - 1.001, t / step)), i = Math.floor(f);
            return Z[i] + (Z[i + 1] - Z[i]) * (f - i);
        };
        const rollAt = (z) => turns * Math.PI * 2 * Math.pow(Math.max(0, Math.min(1, (z - start) / (z1 - start))), bank);
        const at = (t) => {
            const z = zAt(t);
            return { z, focus: z + focus, aperture, roll: rollAt(z) };
        };
        const tOf = (z) => {
            let a = 0, b = Z.length - 1;
            if (z <= Z[0]) return 0;
            if (z >= Z[b]) return b * step;
            while (b - a > 1) {
                const m = (a + b) >> 1;
                if (Z[m] < z) a = m;
                else b = m;
            }
            return (a + (z - Z[a]) / (Z[b] - Z[a])) * step;
        };
        return { at, tOf, zAt, speed, length, peak: tp, end: z1 };
    }

    // A camera track: keys [[t, v], …] joined by a monotone cubic (it never overshoots a key,
    // so a camera never backs up, and its speed is continuous through every key).
    function track(keys, t) {
        const n = keys.length;
        if (t <= keys[0][0]) return keys[0][1];
        if (t >= keys[n - 1][0]) return keys[n - 1][1];
        let i = 0;
        while (t > keys[i + 1][0]) i++;
        const d = (j) => (keys[j + 1][1] - keys[j][1]) / (keys[j + 1][0] - keys[j][0]);
        const slope = (j) => {
            if (j === 0 || j === n - 1) return 0;
            const a = d(j - 1), b = d(j);
            if (a * b <= 0) return 0;
            const ha = keys[j][0] - keys[j - 1][0], hb = keys[j + 1][0] - keys[j][0];
            return (3 * (ha + hb)) / ((2 * hb + ha) / a + (hb + 2 * ha) / b); // harmonic mean (Fritsch–Butland)
        };
        const h = keys[i + 1][0] - keys[i][0], u = (t - keys[i][0]) / h, u2 = u * u, u3 = u2 * u;
        const m0 = slope(i), m1 = slope(i + 1);
        return (2 * u3 - 3 * u2 + 1) * keys[i][1] + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * keys[i + 1][1] + (u3 - u2) * h * m1;
    }

    // ------------------------------------------------------------------ the finish
    // What the lens and the print add, in pixels, after everything is painted (call it from
    // the scene's `post`): a mist filter (the lights spread into a glow), blacks lifted to a
    // tinted grey, a little vignette, grain.
    const fin = { small: null, grain: [] };
    function finish(ctx, env, frame, o = {}) {
        const w = env.px[0], h = env.px[1];
        const mist = o.mist ?? 0.3, lift = o.lift ?? '#27222f', vig = o.vignette ?? 0.16, grain = o.grain ?? 0.05;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (mist > 0) {
            const q = 4, sw = Math.ceil(w / q), sh = Math.ceil(h / q);
            if (!fin.small) {
                fin.small = document.createElement('canvas');
                fin.soft = document.createElement('canvas');
            }
            for (const c of [fin.small, fin.soft]) {
                if (c.width !== sw || c.height !== sh) {
                    c.width = sw;
                    c.height = sh;
                }
            }
            const g = fin.small.getContext('2d');
            g.globalCompositeOperation = 'copy';
            g.imageSmoothingQuality = 'high';
            g.drawImage(ctx.canvas, 0, 0, sw, sh);
            // squared: only the lights are left to spread
            g.globalCompositeOperation = 'multiply';
            g.drawImage(fin.small, 0, 0);
            const g2 = fin.soft.getContext('2d');
            g2.globalCompositeOperation = 'copy';
            g2.filter = `blur(${((o.mistRadius ?? 0.014) * w / q).toFixed(2)}px)`;
            g2.drawImage(fin.small, 0, 0);
            g2.filter = 'none';
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = mist;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(fin.soft, 0, 0, w, h);
            ctx.globalAlpha = 1;
        }
        if (vig > 0) {
            const gr = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.56);
            gr.addColorStop(0, 'rgba(0,0,0,0)');
            gr.addColorStop(1, `rgba(8,4,16,${vig})`);
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = gr;
            ctx.fillRect(0, 0, w, h);
        }
        if (lift) {
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = lift;
            ctx.fillRect(0, 0, w, h);
        }
        if (grain > 0) {
            // eight grain plates, picked by the frame: the grain moves, the picture does not boil
            const n = frame & 7;
            if (!fin.grain[n]) {
                const c = document.createElement('canvas');
                c.width = c.height = 256;
                const g = c.getContext('2d');
                const im = g.createImageData(256, 256);
                for (let i = 0; i < 256 * 256; i++) {
                    const v = 128 + (hashI(i & 255, i >> 8, n, 77) + hashI(i & 255, i >> 8, n, 78) - 1) * 90;
                    im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
                    im.data[i * 4 + 3] = 255;
                }
                g.putImageData(im, 0, 0);
                fin.grain[n] = c;
            }
            const sc = Math.max(1, w / 1920) * (o.grainSize ?? 1.4);
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = grain;
            ctx.imageSmoothingEnabled = true;
            const ox = Math.floor(hashI(frame, 1, 0, 5) * 200), oy = Math.floor(hashI(frame, 2, 0, 5) * 200);
            for (let y = -oy * sc; y < h; y += 256 * sc) for (let x = -ox * sc; x < w; x += 256 * sc) ctx.drawImage(fin.grain[n], x, y, 256 * sc + 1, 256 * sc + 1);
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    }

    return { hex2rgb, rgb2hex, mix, rgba, clamp, smooth, lerp, hashI, noise3, noise2, seedOf, curve, trace, bbox, xf, ellipse, pxScale, edt, boxBlur, inflate, rampFn, form, put, dab, cast, spray, piece, ink, textOn, frame, sheet, sprayIn, stamp, reliefField, tooth, brushwork, rig, flight, track, finish, LIGHT, lightFor, INK, SHADE_DIR };
})();
