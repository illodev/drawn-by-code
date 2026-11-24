// The far world of the causeway, Miami 1985, invented: the airbrushed night sky (indigo
// zenith, a magenta-to-orange glow over the city, stars, a crescent moon, banks of low cloud
// lit from below, searchlights from downtown, a plane on its way in), downtown across the bay
// (some three hundred towers 2–3.5 km ahead: glass with light bands, concrete slabs, stepped
// Art Deco crowns lined with neon, round towers, a pyramid, and the landmark whose crown turns
// colour on every bar: the film's «lights»), the waterfront in front of it (pastel Deco hotels
// outlined in neon tubes, palms, the street lights' necklace, a bandshell, a marina), the
// port to the right of the road (a cruise ship lit deck by deck, gantry cranes, containers),
// and the bay, which mirrors all of it and draws it out into long streaks broken by the swell.
//
// How it is painted: everything goes into two offscreen canvases (the picture and its light)
// seen by the camera with its roll taken out, so that the water can mirror and smear the
// city in plain rows and columns; the result is put on the frame turned by the roll. Every
// building is painted once per scale (a sprite pair, or three with its neon) and placed by
// projecting three of its corners. Sizes in metres: x right, y up, z ahead; the bay at
// y = Causeway.WATER. Nothing but water and boats nearer than ~400 m (the causeway's room).
// Global: Skyline.
const Skyline = (() => {
    const P = Neon.PAL;
    const hex = Neon.hex, css = Neon.css, mix = Neon.mix, rgba = Neon.rgba;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
    const fract = (x) => x - Math.floor(x);
    const hash = (n) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
    const TAU = Math.PI * 2;
    const HAZE = hex('#6a2c72');                          // the city's haze, far things fade into it
    let WL = -4.5;                                       // the bay's surface (Causeway.WATER)

    // the shore across the bay: a wide bight, nearest (1.88 km) a little right of the road
    const zs = (x) => 1880 + 0.000055 * (x - 150) ** 2;
    const DOWNTOWN = [300, 0, 2450];

    // --- the camera without its roll -----------------------------------------------------
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    function unroll(cam) {
        const o = cam.pos, f = cam.f;
        const a = cam.view([o[0] + 1, o[1], o[2]]), b = cam.view([o[0], o[1] + 1, o[2]]), c = cam.view([o[0], o[1], o[2] + 1]);
        const F = nrm([a[2], b[2], c[2]]), X = [a[0], b[0], c[0]];
        const R = nrm([F[2], 0, -F[0]]), U = cross(F, R);
        const roll = Math.atan2(dot(X, U), dot(X, R));
        const cx = cam.W / 2, cy = cam.H / 2;
        const p = (Q) => { const d = [Q[0] - o[0], Q[1] - o[1], Q[2] - o[2]]; const z = dot(F, d), zz = Math.max(z, 0.01); return [cx + f * dot(R, d) / zz, cy - f * dot(U, d) / zz, z]; };
        const dir = (D) => { const z = dot(F, D); if (z <= 1e-3) return null; return [cx + f * dot(R, D) / z, cy - f * dot(U, D) / z, z]; };
        const yaw = Math.atan2(F[0], F[2]), pitch = Math.asin(clamp(F[1], -1, 1));
        const Fh = [Math.sin(yaw), 0, Math.cos(yaw)];
        const yh = dir(Fh)[1];
        const camH = o[1] - WL;
        // the water straight ahead at depth d (screen row), and the depth of a row
        const rowAt = (d) => p([o[0] + Fh[0] * d, WL, o[2] + Fh[2] * d])[1];
        return { p, dir, f, W: cam.W, H: cam.H, cx, cy, roll, yaw, pitch, yh, pos: o, camH, rowAt, Fh };
    }

    // --- surfaces ---------------------------------------------------------------------
    // Everything is painted straight onto the frame (g) and its light (L) in the camera's
    // UNROLLED coordinates, through a transform that turns them by the roll about the frame's
    // centre. «Unrolled pixels» (k × logical) address the small helper canvases (the bands
    // the water mirrors, the streaks), which keep a margin M for the corners the roll uncovers.
    let S = null;
    const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
    function surfaces(env) {
        if (S && S.k === env.k && S.PW === env.px[0]) return S;
        const k = env.k, M = Math.ceil(90 * k), PW = env.px[0], PH = env.px[1];
        const OW = PW + 2 * M, OH = PH + 2 * M;
        const neon = mkC(OW, OH);
        const half = [Math.ceil(OW / 2), Math.ceil(OH / 2)];
        S = {
            k, M, PW, PH, OW, OH, m: M / k,
            neon, nx: neon.getContext('2d'), Bn: [k, 0, 0, k, M, M],
            band: mkC(OW, 8), bandL: mkC(OW, 8), bandP: mkC(OW, 8),       // the city above the water
            pyr: [], prof: mkC(half[0], 1), profB: mkC(half[0], 1),      // the light's column profile
            streak: mkC(half[0], half[1]), streak2: mkC(half[0], half[1]), mask: mkC(half[0], half[1]),
            W: mkC(half[0], half[1]), WL: mkC(half[0], half[1]),
            ship: mkC(8, 8), shipL: mkC(8, 8),
        };
        return S;
    }
    // the frame's transforms for this camera: B (logical unrolled → pixels on the frame) and
    // Rm (unrolled pixels → pixels on the frame), and their inverse for reading bands back
    function turn(roll) {
        const k = S.k, cr = Math.cos(roll), sr = Math.sin(roll), cx = S.PW / 2, cy = S.PH / 2;
        S.Rm = [cr, sr, -sr, cr, cx - cr * cx + sr * cy, cy - sr * cx - cr * cy];
        S.Ri = [cr, -sr, sr, cr, cx - cr * cx - sr * cy, cy + sr * cx - cr * cy];
        S.B = [k * cr, k * sr, -k * sr, k * cr, S.Rm[4], S.Rm[5]];
    }
    const baseOf = (ctx) => (ctx === S.nx ? S.Bn : S.B);
    function logical(ctx) { ctx.setTransform(...baseOf(ctx)); ctx.globalAlpha = 1; ctx.filter = 'none'; }
    function devR(ctx) { ctx.setTransform(...S.Rm); }
    // copy rows [Y1, Y1 + h) of the unrolled picture of src (a frame-sized canvas) into dst
    function unrollBand(dst, src, Y1, h) {
        if (dst.width !== S.OW || dst.height < h) { dst.width = S.OW; dst.height = h + 8; }
        const x = dst.getContext('2d');
        x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, dst.width, dst.height);
        const [a, b, c, d, e, f] = S.Ri;
        x.setTransform(a, b, c, d, e + S.M, f - Y1);
        x.drawImage(src, 0, 0);
        x.setTransform(1, 0, 0, 1, 0, 0);
    }

    // --- cached glows ---------------------------------------------------------------------
    const GLOW = new Map();
    function glowSprite(c, hard = 0.12) {
        const key = c + hard;
        if (GLOW.has(key)) return GLOW.get(key);
        const s = mkC(64, 64), g = s.getContext('2d'), C = hex(c);
        const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, css(mix(C, [255, 255, 255], 0.85), 1));
        gr.addColorStop(hard, css(mix(C, [255, 255, 255], 0.3), 0.9));
        gr.addColorStop(0.35, css(C, 0.35));
        gr.addColorStop(1, css(C, 0));
        g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
        GLOW.set(key, s); return s;
    }
    const glow = (ctx, x, y, r, c, a = 1) => { if (a <= 0.003 || r <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(glowSprite(c), x - r, y - r, 2 * r, 2 * r); ctx.globalAlpha = 1; };
    // a four-point sparkle, like the references' stars
    let SPARK = null;
    function sparkle(ctx, x, y, r, a, rot = 0) {
        if (!SPARK) {
            SPARK = mkC(128, 128); const g = SPARK.getContext('2d');
            g.translate(64, 64);
            for (let i = 0; i < 4; i++) {
                g.rotate(Math.PI / 2);
                const lg = g.createLinearGradient(0, 0, 64, 0);
                lg.addColorStop(0, 'rgba(255,240,250,1)'); lg.addColorStop(0.3, 'rgba(255,170,230,0.5)'); lg.addColorStop(1, 'rgba(200,140,255,0)');
                g.fillStyle = lg; g.beginPath(); g.moveTo(0, -2.4); g.lineTo(64, 0); g.lineTo(0, 2.4); g.closePath(); g.fill();
            }
            const cg = g.createRadialGradient(0, 0, 0, 0, 0, 14);
            cg.addColorStop(0, 'rgba(255,255,255,1)'); cg.addColorStop(0.4, 'rgba(255,200,240,0.5)'); cg.addColorStop(1, 'rgba(255,180,240,0)');
            g.fillStyle = cg; g.fillRect(-14, -14, 28, 28);
        }
        ctx.save(); ctx.globalAlpha = Math.min(1, a); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(SPARK, -r, -r, 2 * r, 2 * r); ctx.restore();
    }

    // ======================================================================================
    // THE WORLD'S DATA (built once)
    // ======================================================================================
    let WORLD = null;
    const TPAL = {
        glass: { top: '#1a1a48', mid: '#242260', bot: '#4c2864', side: '#120f32', line: '#4d4c9c' },
        teal: { top: '#10243e', mid: '#173352', bot: '#3c2c5c', side: '#0c1830', line: '#3f7a9a' },
        slab: { top: '#2a2148', mid: '#352a55', bot: '#58305e', side: '#1a1434', line: '#8a7aaa' },
        deco: { top: '#30285a', mid: '#3e3166', bot: '#663a6c', side: '#1e1840', line: '#6a5a92' },
        sand: { top: '#3a2c55', mid: '#4a3660', bot: '#74406a', side: '#241a40', line: '#8a6a96' },
        land: { top: '#1e1a4c', mid: '#28225e', bot: '#4e2a66', side: '#141034', line: '#5a56aa' },
    };
    const WARM = ['#ffd08a', '#ffe2b0', '#ffbd7a', '#fff0d0', '#ffc890'], COOL = ['#d8f4ff', '#bfe8ff', '#e8fbff'], TINT = ['#ffc2ee', '#a8f0ff', '#ffd6a0'];
    const NEONS = [P.pink, P.cyan, P.violet, P.aqua, P.magenta, '#ff6a3d'];

    function build() {
        const items = [], R = Motion.rng('skyline-85');
        let id = 0;
        // --- towers ----------------------------------------------------------------------
        const HERO = [
            [300, 2450, 52, 52, 240, 'landmark', 'land'],
            [525, 2630, 44, 40, 206, 'glass', 'glass', { top: 'slant' }],
            [70, 2380, 46, 40, 178, 'deco', 'deco', { tiers: 3 }],
            [-170, 2300, 38, 38, 150, 'round', 'teal'],
            [790, 2520, 62, 26, 168, 'slab', 'slab'],
            [165, 2770, 42, 42, 198, 'pyramid', 'glass'],
            [-395, 2560, 30, 30, 172, 'glass', 'teal', { top: 'flat' }],
            [-338, 2600, 30, 30, 166, 'glass', 'teal', { top: 'flat' }],
            [960, 2700, 40, 40, 186, 'deco', 'sand', { tiers: 4 }],
            [425, 2290, 34, 34, 128, 'deco', 'deco', { tiers: 2 }],
            [-880, 2250, 54, 24, 158, 'slab', 'slab'],
            [-1250, 2420, 40, 40, 146, 'glass', 'glass', { top: 'notch' }],
            [-700, 2185, 34, 34, 126, 'round', 'teal'],
            [1320, 2330, 56, 24, 140, 'slab', 'sand'],
            [1680, 2420, 40, 40, 120, 'deco', 'deco', { tiers: 2 }],
            [-1600, 2560, 44, 30, 122, 'slab', 'slab'],
            [650, 2900, 46, 46, 168, 'glass', 'teal', { top: 'flat' }],
            [-40, 2960, 40, 40, 152, 'slab', 'sand'],
            [1080, 2420, 36, 36, 132, 'glass', 'glass', { top: 'slant' }],
            [-520, 2420, 42, 30, 118, 'deco', 'sand', { tiers: 2 }],
        ];
        const towers = [];
        const free = (x, z, w) => towers.every((t) => Math.abs(t.x - x) > (t.w + w) * 0.55 || Math.abs(t.z - z) > 70);
        const add = (x, z, w, d, h, type, pal, o = {}) => { const t = { id: id++, x, z, w, d, h, type, pal, ...o }; towers.push(t); return t; };
        for (const [x, z, w, d, h, type, pal, o] of HERO) add(x, z, w, d, h, type, pal, o);
        const TYPES = [['glass', 'glass', 0.22], ['glass', 'teal', 0.14], ['slab', 'slab', 0.24], ['slab', 'sand', 0.12], ['deco', 'deco', 0.12], ['deco', 'sand', 0.06], ['round', 'teal', 0.05], ['pyramid', 'glass', 0.05]];
        const pick = () => { let u = R(); for (const t of TYPES) { if ((u -= t[2]) < 0) return t; } return TYPES[0]; };
        const scatter = (n, x0, x1, dz0, dz1, hOf) => {
            for (let i = 0, tries = 0; i < n && tries < n * 20; tries++) {
                const x = x0 + (x1 - x0) * R(), z = zs(x) + dz0 + (dz1 - dz0) * R();
                const w = 20 + R() * 30, h = hOf(x, R());
                if (!free(x, z, w)) continue;
                const [type, pal] = h < 45 ? (R() < 0.6 ? ['slab', R() < 0.5 ? 'slab' : 'sand'] : ['glass', 'glass']) : pick();
                add(x, z, w, 18 + R() * 26, h, type, pal, { top: ['flat', 'flat', 'slant', 'notch'][Math.floor(R() * 4)], tiers: 2 + Math.floor(R() * 2) });
                i++;
            }
        };
        scatter(120, -600, 1200, 160, 1250, (x, r) => 38 + 150 * Math.exp(-(((x - 320) / 560) ** 2)) * Math.pow(r, 0.85) + 18 * R());
        scatter(75, -2500, -600, 110, 950, (x, r) => 30 + 105 * Math.exp(-(((x + 1050) / 650) ** 2)) * r + 14 * R());
        scatter(50, 1200, 3000, 110, 800, (x, r) => 26 + 90 * Math.exp(-(((x - 1500) / 600) ** 2)) * r + 12 * R());
        scatter(40, -5600, -2500, 60, 450, (x, r) => 22 + 48 * r);
        scatter(26, 3000, 4800, 60, 400, (x, r) => 20 + 40 * r);
        for (const t of towers) tower(t, R);

        // --- the waterfront: pastel hotels, the drive, palms, lamps (blocks along the shore)
        const blocks = [];
        for (let x = -1760; x < 1860; ) {
            const len = 150 + R() * 80;
            blocks.push(waterfront(id++, x, Math.min(1860, x + len), R));
            x += len;
        }
        // the far shores: low-rise lights, a few palms, lamps
        const far = [];
        for (let x = -6400; x < -1760; ) { const len = 260 + R() * 120; far.push(suburb(id++, x, Math.min(-1760, x + len), R)); x += len; }
        for (let x = 1860; x < 5200; ) { const len = 260 + R() * 120; far.push(suburb(id++, x, x + len, R)); x += len; }
        const marina = marinaItem(id++, R);

        // the back layer (far shores and towers) and the front layer (the waterfront), far to near
        const dist = (it) => Math.hypot(it.O[0] - 5, it.O[2]);
        const back = [...far, ...towers].sort((a, b) => dist(b) - dist(a));
        const front = blocks.sort((a, b) => dist(b) - dist(a));

        // --- the sky -------------------------------------------------------------------------
        const SR = Motion.rng('stars-85'), stars = [];
        for (let i = 0; i < 1100; i++) {
            const az = -2.0 + 3.8 * SR(), el = 0.025 + 1.15 * Math.pow(SR(), 0.75);
            const mag = Math.pow(SR(), 3.2);
            stars.push({ d: [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)], el, r: 0.45 + mag * 1.7, a: 0.25 + 0.75 * mag, col: ['#ffffff', '#fff6fb', '#d8e4ff', '#ffd8f0', '#fff0d0'][Math.floor(SR() * 5)], tw: 1 + SR() * 4, ph: SR() * TAU, spark: mag > 0.55 && SR() < 0.6 });
        }
        const CR = Motion.rng('clouds-85'), puffs = [];
        // banks of low cloud over the city, lit from below; thin streaks higher up
        const bank = (az0, az1, el0, thick, n, size, dist, kind) => {
            for (let i = 0; i < n; i++) {
                const u = (i + CR() * 0.8) / n, az = az0 + (az1 - az0) * u;
                const edge = Math.sin(Math.PI * u) ** 0.6;
                const rows = kind === 'streak' ? 1 : 1 + Math.floor(CR() * 3 * edge);
                for (let r = 0; r < rows; r++) {
                    const rx = size * (0.6 + CR() * 0.9) * (kind === 'streak' ? 3.5 : 1);
                    const el = el0 + (r * 0.45 + CR() * 0.4) * thick * edge + Math.sin(az * 7 + CR()) * thick * 0.25;
                    puffs.push({ az, el, rx, ry: rx * (kind === 'streak' ? 0.09 : 0.32 + CR() * 0.12), kind, dist, v: CR() });
                }
            }
        };
        bank(-1.35, 1.15, 0.010, 0.014, 70, 0.022, 9, 'bank');       // the low bank behind the city
        bank(-0.9, 0.95, 0.040, 0.018, 34, 0.026, 7, 'bank');        // broken cloud above it
        bank(-1.2, 1.1, 0.075, 0.03, 16, 0.05, 6, 'streak');         // long thin streaks
        bank(-0.7, 0.8, 0.15, 0.05, 8, 0.07, 5, 'streak');
        puffs.sort((a, b) => b.el - a.el);                            // tops first: the lit undersides overlap them

        // searchlights: two beams from downtown roofs
        const beams = [
            { x: 120, y: WL + 150, z: 2600, az: -0.35, amp: 0.45, w: 0.33, ph: 0.4, col: '#c9b8ff' },
            { x: 610, y: WL + 175, z: 2780, az: 0.25, amp: 0.5, w: 0.27, ph: 2.6, col: '#ffbfe6' },
        ];
        return { back, front, marina, stars, puffs, beams };
    }

    // ---- a tower: geometry, its live windows, its beacons, its painter --------------------
    function tower(t, R) {
        const r = Motion.rng('tower-' + t.id);
        t.fog = clamp((Math.hypot(t.x, t.z) - 2000) / 2600, 0, 0.6);
        t.side = t.x > 5 ? -1 : 1;                                   // which side face we see
        t.sw = Math.min(t.d, t.d * Math.abs(t.x - 5) / t.z * 1.0);    // its apparent width (m)
        t.fp = t.type === 'slab' ? 3.1 : t.type === 'glass' || t.type === 'landmark' ? 3.9 : 3.5;
        t.cp = t.type === 'glass' ? 2.2 : t.type === 'slab' ? 3.0 : 2.8;
        // the crown's share of the height
        const crown = t.type === 'deco' ? t.h * 0.16 : t.type === 'landmark' ? 34 : t.type === 'pyramid' ? t.w * 0.75 : t.type === 'slab' ? 6 : t.top === 'slant' ? t.w * 0.45 : 3;
        t.h0 = Math.max(12, t.h - crown);
        t.nf = Math.floor((t.h0 - 3) / t.fp); t.nc = Math.max(2, Math.floor(t.w / t.cp));
        t.office = t.type === 'glass' || t.type === 'landmark' || (t.type === 'deco' && r() < 0.5);
        t.lit = t.office ? 0.16 + r() * 0.2 : 0.18 + r() * 0.2;
        t.warm = r() < (t.office ? 0.45 : 0.8);
        t.neonA = NEONS[Math.floor(r() * NEONS.length)]; t.neonB = NEONS[Math.floor(r() * NEONS.length)];
        t.ph = r() * TAU;
        // windows that switch on and off with the music, and a few TVs
        t.live = [];
        const nl = 3 + Math.floor(r() * 5);
        for (let i = 0; i < nl; i++) t.live.push({ f: 1 + Math.floor(r() * (t.nf - 1)), c: Math.floor(r() * t.nc), per: 2 + Math.floor(r() * 7), ph: Math.floor(r() * 16), tv: r() < 0.25, col: t.warm ? WARM[i % WARM.length] : COOL[i % COOL.length] });
        t.liveBand = t.office && r() < 0.5 ? { f: 2 + Math.floor(r() * (t.nf - 3)), per: 4 * (1 + Math.floor(r() * 3)), ph: Math.floor(r() * 8) } : null;
        // aircraft warning lights
        t.beacons = [];
        if (t.h > 105) t.beacons.push([t.w / 2, t.h + (t.type === 'deco' ? t.h * 0.08 : t.type === 'landmark' ? 14 : t.type === 'slab' ? 14 : 1)]);
        if (t.h > 175) t.beacons.push([0.6, t.h0 * 0.55], [t.w - 0.6, t.h0 * 0.55]);
        // the item's frame and sprite bounds (metres, u along the front face, v up)
        t.O = [t.x - t.w / 2, WL + 2.5, t.z]; t.ex = [1, 0, 0];
        t.u0 = t.side < 0 ? -t.sw - 1 : -1; t.u1 = t.side > 0 ? t.w + t.sw + 1 : t.w + 1;
        t.v1 = t.h + (t.type === 'deco' ? t.h * 0.1 : t.type === 'landmark' ? 18 : t.type === 'slab' ? 16 : 4) + 2;
        t.neon = true; t.kind = 'tower';
        t.paint = (pc, lc, nc, s) => paintTower(t, pc, lc, nc, s);
        return t;
    }

    // a vertical gradient fill
    function vfill(ctx, x, y0, w, y1, stops) {
        const gr = ctx.createLinearGradient(0, y0, 0, y1);
        stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), typeof c === 'string' ? c : css(c)));
        ctx.fillStyle = gr; ctx.fillRect(x, y0, w, y1 - y0);
    }
    // a neon tube along a path, in metres: a coloured body and a white-hot core, min widths in px
    function tubeM(ctx, s, pts, colr, w = 0.45, close = false, alpha = 1) {
        if (!ctx) return;
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = alpha;
        ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); if (close) ctx.closePath();
        const C = hex(colr);
        ctx.strokeStyle = css(C, 0.95); ctx.lineWidth = Math.max(w, 1.0 / s); ctx.stroke();
        ctx.strokeStyle = css(mix(C, [255, 255, 255], 0.75)); ctx.lineWidth = Math.max(w * 0.4, 0.45 / s); ctx.stroke();
        ctx.restore();
    }

    function paintTower(t, pc, lc, nc, s) {
        const r = Motion.rng('paint-' + t.id), pal = TPAL[t.pal], fog = t.fog;
        const F = (c, extra = 0) => css(mix(c, HAZE, Math.min(0.8, fog + extra)));
        const { w, h0, sw, side } = t;
        const px = 1 / s;
        // the side face, turned away: darker, a cooler sky on it
        if (sw > 0.2) {
            const x0 = side < 0 ? -sw : w, x1 = side < 0 ? 0 : w + sw;
            const far = side < 0 ? x0 : x1, near = side < 0 ? x1 : x0, drop = h0 * t.d / t.z;
            pc.save(); pc.beginPath(); pc.moveTo(near, 0); pc.lineTo(near, -h0); pc.lineTo(far, -h0 + drop); pc.lineTo(far, 0); pc.closePath(); pc.clip();
            vfill(pc, Math.min(x0, x1), -h0, Math.abs(x1 - x0), 0, [F(pal.side), F(mix(pal.side, '#3a1c4c', 0.5)), F(mix(pal.bot, '#1a1030', 0.45))]);
            // its windows, foreshortened
            const cols = Math.max(1, Math.floor(t.d / t.cp)), cw = sw / cols;
            if (cw * s > 0.6) for (let f = 0; f < t.nf; f++) for (let c = 0; c < cols; c++) {
                if (r() > t.lit * 0.8) continue;
                const y = -(2 + f * t.fp + t.fp * 0.55), x = Math.min(x0, x1) + c * cw + cw * 0.2;
                const colr = t.warm ? WARM[Math.floor(r() * 5)] : COOL[Math.floor(r() * 3)];
                pc.fillStyle = F(mix(colr, pal.side, 0.35), -0.2); pc.fillRect(x, y, Math.max(cw * 0.55, 0.7 * px), Math.max(t.fp * 0.45, 0.7 * px));
                lc.fillStyle = css(hex(colr), 0.45 * (1 - fog * 0.6)); lc.fillRect(x, y, Math.max(cw * 0.55, 0.7 * px), Math.max(t.fp * 0.45, 0.7 * px));
            }
            pc.restore();
        }
        // the front face: airbrushed, the sky on top, the street's glow below
        const front = () => { pc.beginPath(); pc.rect(0, -h0, w, h0); };
        pc.save();
        if (t.type === 'round') {
            const gr = pc.createLinearGradient(0, 0, w, 0);
            gr.addColorStop(0, F('#3e5a8a')); gr.addColorStop(0.18, F(pal.mid)); gr.addColorStop(0.6, F(pal.top)); gr.addColorStop(0.92, F('#4a2458')); gr.addColorStop(1, F('#b04a86'));
            pc.fillStyle = gr; pc.fillRect(0, -h0, w, h0);
            vfill(pc, 0, -h0 * 0.35, w, 0, ['rgba(0,0,0,0)', css(hex(pal.bot), 0.7)]);
        } else {
            vfill(pc, 0, -h0, w, 0, [F(pal.top), F(pal.mid), F(pal.bot)]);
        }
        front(); pc.clip();
        // facade texture by type
        const lineC = css(mix(hex(pal.line), HAZE, fog), 0.32);
        if (t.type === 'glass' || t.type === 'landmark') {
            // a sheen of sky sliding down the glass, then mullions
            const sh = pc.createLinearGradient(0, -h0, w, -h0 * 0.4);
            sh.addColorStop(0, 'rgba(180,150,255,0)'); sh.addColorStop(0.45, 'rgba(200,160,255,0.16)'); sh.addColorStop(0.6, 'rgba(255,150,220,0.08)'); sh.addColorStop(1, 'rgba(180,150,255,0)');
            pc.fillStyle = sh; pc.fillRect(0, -h0, w, h0);
            if (t.cp * s > 1.6) { pc.fillStyle = lineC; for (let x = t.cp; x < w - 0.1; x += t.cp) pc.fillRect(x - 0.1, -h0, Math.max(0.2, 0.5 * px), h0); }
            if (t.type === 'landmark') { pc.fillStyle = css(mix(hex(pal.line), HAZE, fog), 0.45); for (const x of [w * 0.2, w * 0.5, w * 0.8]) pc.fillRect(x - 0.8, -h0, 1.6, h0); }
        } else if (t.type === 'slab') {
            if (t.fp * s > 1.4) for (let f = 0; f < t.nf; f++) { const y = -(2 + f * t.fp); pc.fillStyle = lineC; pc.fillRect(0, y - Math.max(0.25, 0.5 * px), w, Math.max(0.25, 0.5 * px)); }
            pc.fillStyle = 'rgba(10,6,30,0.25)'; for (let x = w / 3; x < w - 1; x += w / 3) pc.fillRect(x - 0.3, -h0, 0.6, h0);
        } else if (t.type === 'deco') {
            pc.fillStyle = css(mix(hex(pal.line), HAZE, fog), 0.38);
            for (let x = 0; x <= w; x += 4) pc.fillRect(x - 0.45, -h0, 0.9, h0);
        }
        // the windows
        const ww = t.cp * (t.type === 'glass' ? 0.78 : 0.56), wh = t.fp * (t.office ? 0.62 : 0.5);
        const skip = new Set(t.live.map((L) => L.f * 1000 + L.c)), bandF = t.liveBand ? t.liveBand.f : -1;
        for (let f = 0; f < t.nf; f++) {
            const y = -(2 + f * t.fp + t.fp * 0.3 + wh);
            const rowOn = t.office ? (r() < t.lit * 1.4 ? 0.85 : 0.04) : null;
            const rowCol = t.warm ? WARM[Math.floor(r() * 5)] : COOL[Math.floor(r() * 3)];
            for (let c = 0; c < t.nc; c++) {
                const x = (w - t.nc * t.cp) / 2 + c * t.cp + (t.cp - ww) / 2;
                const on = f !== bandF && !skip.has(f * 1000 + c) && r() < (rowOn ?? t.lit);
                const xx = x, yy = y, wW = Math.max(ww, 0.75 * px), hH = Math.max(wh, 0.75 * px);
                if (on) {
                    const colr = r() < 0.08 ? TINT[Math.floor(r() * 3)] : t.office ? rowCol : (t.warm ? WARM[Math.floor(r() * 5)] : COOL[Math.floor(r() * 3)]);
                    const a = 0.65 + r() * 0.35;
                    pc.fillStyle = css(mix(hex(colr), HAZE, fog * 0.7), a); pc.fillRect(xx, yy, wW, hH);
                    lc.fillStyle = css(hex(colr), a * (0.75 - fog * 0.55)); lc.fillRect(xx, yy, wW, hH);
                } else if (t.type === 'glass' || t.type === 'landmark') {
                    pc.fillStyle = 'rgba(130,110,220,0.10)'; pc.fillRect(xx, yy, wW, hH);
                } else {
                    pc.fillStyle = 'rgba(8,5,24,0.35)'; pc.fillRect(xx, yy, wW, hH);
                }
            }
        }
        // the street's glow climbing the foot of the facade
        vfill(pc, 0, -Math.min(h0, 40), w, 0, ['rgba(255,140,110,0)', css(mix(hex('#ff8a70'), HAZE, fog), 0.34)]);
        pc.restore();
        // rim light: cyan on the left edge (the moon's side of the sky), pink on the right
        const rw = Math.max(0.35, 0.6 * px);
        pc.fillStyle = css(mix(hex('#7fe6ff'), HAZE, fog), 0.55); pc.fillRect(0, -h0, rw, h0);
        pc.fillStyle = css(mix(hex('#ff6fb8'), HAZE, fog), 0.55); pc.fillRect(w - rw, -h0, rw, h0);
        // the top
        const na = 1 - fog * 0.55;
        if (t.type === 'deco') {
            const n = t.tiers ?? 3, th = (t.h - h0) / n;
            for (let i = 0; i < n; i++) {
                const inset = (i + 1) * w * 0.12, y0 = -h0 - i * th, y1 = y0 - th;
                const wi = w - 2 * inset;
                vfill(pc, inset, y1, wi, y0, [F(mix(pal.top, '#5a4a8a', 0.3 + i * 0.1)), F(pal.mid)]);
                pc.fillStyle = css(mix(hex(pal.line), HAZE, fog), 0.4); for (let x = inset + 2; x < inset + wi - 1; x += 3.2) pc.fillRect(x - 0.3, y1, 0.6, th);
                // floodlight from below on each setback
                vfill(pc, inset, y1, wi, y0, ['rgba(255,190,240,0)', css(hex(t.neonB), 0.22 * na)]);
                tubeM(nc, s, [[inset - 0.3, y0 - 0.2], [inset + wi + 0.3, y0 - 0.2]], i % 2 ? t.neonB : t.neonA, 0.5, false, na);
                if (i === n - 1) tubeM(nc, s, [[inset, y0], [inset, y1], [inset + wi, y1], [inset + wi, y0]], t.neonA, 0.45, false, na);
            }
            // the spire
            const yb = -h0 - n * th, sp = t.h * 0.08;
            pc.fillStyle = F('#5a4a7a'); pc.beginPath(); pc.moveTo(w / 2 - 1.4, yb); pc.lineTo(w / 2, yb - sp); pc.lineTo(w / 2 + 1.4, yb); pc.fill();
        } else if (t.type === 'landmark') {
            // the crown's tiers (lit per frame in the bar's colour) and a mast
            const n = 4, th = (t.h - h0) / n;
            t.tiers = [];
            for (let i = 0; i < n; i++) {
                const inset = (i + 0.5) * w * 0.09, y0 = -h0 - i * th, y1 = y0 - th;
                vfill(pc, inset, y1, w - 2 * inset, y0, [F('#3a3070'), F('#2a2458')]);
                t.tiers.push([inset, y1, w - 2 * inset, th]);
            }
            pc.strokeStyle = F('#4a4070'); pc.lineWidth = Math.max(0.6, 0.8 * px);
            pc.beginPath(); pc.moveTo(w / 2, -t.h); pc.lineTo(w / 2, -t.h - 16); pc.stroke();
        } else if (t.type === 'pyramid') {
            const ph = t.h - h0;
            pc.save(); pc.beginPath(); pc.moveTo(0, -h0); pc.lineTo(w / 2, -t.h); pc.lineTo(w, -h0); pc.closePath(); pc.clip();
            const gr = pc.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, F('#5a4a9a')); gr.addColorStop(0.5, F('#2a245a')); gr.addColorStop(1, F('#4a2060'));
            pc.fillStyle = gr; pc.fillRect(0, -t.h, w, ph);
            vfill(pc, 0, -t.h, w, -h0, ['rgba(255,170,230,0)', css(hex(t.neonA), 0.3 * na)]);
            pc.restore();
            tubeM(nc, s, [[0, -h0], [w / 2, -t.h], [w, -h0]], t.neonA, 0.55, false, na);
            tubeM(nc, s, [[0, -h0 - 0.3], [w, -h0 - 0.3]], t.neonB, 0.4, false, na * 0.8);
        } else if (t.type === 'slab') {
            const pw = w * 0.38, ph = 5;
            vfill(pc, (w - pw) / 2, -h0 - ph, pw, -h0, [F('#463a66'), F(pal.top)]);
            pc.fillStyle = F('#2a2244'); pc.fillRect(w * 0.12, -h0 - 3, 3, 3);
            pc.strokeStyle = F('#5a4a7a'); pc.lineWidth = Math.max(0.3, 0.6 * px); pc.beginPath(); pc.moveTo(w / 2 + pw * 0.3, -h0 - ph); pc.lineTo(w / 2 + pw * 0.3, -h0 - 14); pc.stroke();
            if (r() < 0.5) tubeM(nc, s, [[0, -h0 + 0.4], [w, -h0 + 0.4]], t.neonA, 0.4, false, na * 0.9);
        } else if (t.type === 'round') {
            tubeM(nc, s, [[0.5, -h0 + 0.5], [w - 0.5, -h0 + 0.5]], t.neonA, 0.55, false, na);
            tubeM(nc, s, [[0.5, -h0 + 2.2], [w - 0.5, -h0 + 2.2]], t.neonB, 0.35, false, na * 0.7);
            vfill(pc, w * 0.2, -h0 - 3, w * 0.6, -h0, [F('#3a3a70'), F(pal.top)]);
        } else if (t.top === 'slant') {
            const rise = t.h - h0;
            pc.save(); pc.beginPath(); pc.moveTo(0, -h0); pc.lineTo(0, -h0 - rise * 0.25); pc.lineTo(w, -t.h); pc.lineTo(w, -h0); pc.closePath(); pc.clip();
            vfill(pc, 0, -t.h, w, -h0, [css(mix(hex('#8ad8ff'), HAZE, fog), 0.9), F('#3a4a9a')]);
            pc.fillStyle = 'rgba(20,20,70,0.35)'; for (let x = 1.5; x < w; x += 3) pc.fillRect(x, -t.h, 0.4, rise);
            pc.restore();
            lc.save(); lc.globalAlpha = 0.35 * na; lc.beginPath(); lc.moveTo(0, -h0); lc.lineTo(0, -h0 - rise * 0.25); lc.lineTo(w, -t.h); lc.lineTo(w, -h0); lc.closePath(); lc.fillStyle = '#5ac8ff'; lc.fill(); lc.restore();
            tubeM(nc, s, [[0, -h0 - rise * 0.25], [w, -t.h]], t.neonA, 0.55, false, na);
        } else if (t.top === 'notch') {
            pc.fillStyle = F(pal.top); pc.fillRect(0, -h0 - 6, w * 0.6, 6);
            tubeM(nc, s, [[0, -h0 - 6], [w * 0.6, -h0 - 6], [w * 0.6, -h0], [w, -h0]], t.neonA, 0.45, false, na);
        } else {
            // a flat roof: a lit band and the machinery on it
            pc.fillStyle = F(mix(pal.top, '#000000', 0.2)); pc.fillRect(w * 0.15, -h0 - 3, w * 0.25, 3); pc.fillRect(w * 0.55, -h0 - 2, w * 0.3, 2);
            tubeM(nc, s, [[0, -h0 + 1.2], [w, -h0 + 1.2]], t.neonA, 0.5, false, na);
            if (t.h > 120) { lc.fillStyle = css(hex(t.neonB), 0.25 * na); lc.fillRect(0, -h0 + 2, w, 4); }
        }
    }

    // ---- the waterfront: a block of shore with its buildings, drive, lamps and palms -----
    const PASTEL = ['#f6b7a0', '#8fe3c8', '#b8a6f0', '#f4ecd8', '#8ed7f2', '#f28a8a', '#ffd2a8', '#c9f0d8'];
    function waterfront(id, x0, x1, R) {
        const za = zs(x0) + 18, zb = zs(x1) + 18, len = Math.hypot(x1 - x0, zb - za);
        const it = { id, kind: 'block', x: (x0 + x1) / 2, z: (za + zb) / 2, O: [x0, WL + 1.6, za], ex: [(x1 - x0) / len, 0, (zb - za) / len], len, neon: true };
        it.u0 = -1; it.u1 = len + 1; it.v1 = 70;
        const r = Motion.rng('wf-' + id);
        // the buildings along it
        const bl = [];
        for (let u = 2 + r() * 8; u < len - 12; ) {
            const kindR = r();
            const marinaPark = x0 > -1000 && x1 < -250;
            let kind = kindR < 0.62 ? 'hotel' : kindR < 0.8 ? 'mimo' : kindR < 0.9 ? 'park' : 'market';
            if (marinaPark && r() < 0.5) kind = r() < 0.5 ? 'market' : 'park';
            if (x0 < 200 && x1 > 120 && !bl.some((b) => b.kind === 'shell')) kind = 'shell';
            const w = kind === 'park' ? 30 + r() * 30 : kind === 'shell' ? 46 : kind === 'mimo' ? 30 + r() * 25 : kind === 'market' ? 50 + r() * 30 : 26 + r() * 40;
            if (u + w > len - 2) break;
            const h = kind === 'hotel' ? 14 + r() * 22 : kind === 'mimo' ? 30 + r() * 26 : kind === 'market' ? 9 + r() * 4 : kind === 'shell' ? 15 : 0;
            bl.push({ kind, u, w, h, col: PASTEL[Math.floor(r() * PASTEL.length)], nA: NEONS[Math.floor(r() * 5)], nB: NEONS[Math.floor(r() * 5)], fin: r() < 0.6, corner: r() < 0.5 ? (r() < 0.5 ? -1 : 1) : 0, sign: Math.floor(r() * 4), back: 10 + r() * 30, seed: r() * 1e6 });
            u += w + 3 + r() * 16;
        }
        it.bl = bl;
        it.v1 = Math.max(30, ...bl.map((b) => b.h + (b.fin ? 14 : 4))) + 4;
        // palms along the promenade, lamps along the drive
        it.palms = []; for (let u = r() * 8; u < len; u += 7 + r() * 13) it.palms.push({ u, h: 10 + r() * 7, lean: (r() - 0.5) * 0.25, coco: r() < 0.3, seed: r() * 1e6 });
        it.lamps = []; for (let u = 6 + r() * 4; u < len; u += 26) it.lamps.push(u);
        it.cars = []; for (let i = 0; i < 2 + Math.floor(r() * 3); i++) it.cars.push({ u: r() * len, v: 8 + r() * 6, dir: r() < 0.5 ? 1 : -1 });
        it.fog = clamp((Math.hypot(it.x, it.z) - 1900) / 3000, 0, 0.4);
        it.paint = (pc, lc, nc, s) => paintWaterfront(it, pc, lc, nc, s);
        return it;
    }

    function palmM(pc, s, u, h, lean, coco, seed, rim) {
        const r = Motion.rng('palm-' + seed), px = 1 / s;
        const tx = u + lean * h, ty = -h;
        pc.strokeStyle = coco ? '#2a1a30' : '#3a2a44'; pc.lineCap = 'round';
        pc.lineWidth = Math.max(coco ? 0.4 : 0.55, 0.7 * px);
        pc.beginPath(); pc.moveTo(u, 0); pc.quadraticCurveTo(u + lean * h * 0.2, -h * 0.5, tx, ty); pc.stroke();
        if (rim) { pc.strokeStyle = 'rgba(255,170,150,0.35)'; pc.lineWidth = Math.max(0.15, 0.4 * px); pc.beginPath(); pc.moveTo(u + 0.25, 0); pc.quadraticCurveTo(u + 0.25 + lean * h * 0.2, -h * 0.5, tx + 0.25, ty); pc.stroke(); }
        // fronds: arching leaves with hanging leaflets
        const n = coco ? 9 : 11;
        for (let i = 0; i < n; i++) {
            const an = (i / n) * TAU + r() * 0.4, dx = Math.cos(an), len = (coco ? 4.2 : 3.6) * (0.8 + r() * 0.4);
            const ex = tx + dx * len, ey = ty + (0.3 + (1 - Math.abs(dx)) * 0.5) * len * 0.8, cx = tx + dx * len * 0.5, cy = ty - (0.4 + r() * 0.4) * len * 0.5;
            pc.strokeStyle = '#1c1030'; pc.lineWidth = Math.max(0.22, 0.6 * px);
            pc.beginPath(); pc.moveTo(tx, ty); pc.quadraticCurveTo(cx, cy, ex, ey); pc.stroke();
            if (s > 1.2) { pc.lineWidth = Math.max(0.1, 0.4 * px); for (let j = 2; j < 8; j++) { const q = j / 8, x = (1 - q) ** 2 * tx + 2 * (1 - q) * q * cx + q * q * ex, y = (1 - q) ** 2 * ty + 2 * (1 - q) * q * cy + q * q * ey, ll = (1 - q * 0.6) * 0.9; pc.beginPath(); pc.moveTo(x, y); pc.lineTo(x + Math.sign(dx) * ll * 0.3, y + ll); pc.stroke(); } }
        }
        pc.fillStyle = coco ? '#24142e' : '#2c3a3a'; pc.beginPath(); pc.ellipse(tx, ty + 0.5, Math.max(0.35, 0.6 * px), Math.max(0.8, 0.8 * px), 0, 0, TAU); pc.fill();
    }

    function paintWaterfront(it, pc, lc, nc, s) {
        const px = 1 / s, fog = it.fog;
        const F = (c, extra = 0) => css(mix(typeof c === 'string' ? hex(c) : c, HAZE, Math.min(0.8, fog + extra)));
        const na = 1 - fog * 0.5;
        for (const b of it.bl) {
            const r = Motion.rng('b-' + b.seed);
            const { u, w, h } = b;
            if (b.kind === 'park') {
                // a lawn with string lights between posts
                for (let x = u; x <= u + w; x += 10) { pc.fillStyle = '#2a2040'; pc.fillRect(x, -5, Math.max(0.25, 0.6 * px), 5); }
                for (let x = u; x < u + w - 1; x += 10) for (let q = 0.1; q < 1; q += 0.2) {
                    const xx = x + q * 10, yy = -5 + Math.sin(q * Math.PI) * 1.4;
                    const c = [P.yellow, P.pink, P.cyan, '#fff0d0'][Math.floor(q * 5) % 4];
                    pc.fillStyle = c; pc.fillRect(xx, yy, Math.max(0.3, 0.7 * px), Math.max(0.3, 0.7 * px));
                    lc.fillStyle = css(hex(c), 0.8); lc.fillRect(xx - 0.2, yy - 0.2, Math.max(0.7, 1.1 * px), Math.max(0.7, 1.1 * px));
                }
                continue;
            }
            if (b.kind === 'shell') {
                // the bandshell: a white half-dome with arcs of neon
                const cx = u + w / 2, rx = w / 2, ry = h;
                const gr = pc.createRadialGradient(cx, 0, 0, cx, 0, rx);
                gr.addColorStop(0, F('#ffd6e8')); gr.addColorStop(0.6, F('#c8a8e0')); gr.addColorStop(1, F('#7a5a9a'));
                pc.fillStyle = gr; pc.beginPath(); pc.ellipse(cx, 0, rx, ry, 0, Math.PI, 0); pc.fill();
                for (let i = 0; i < 4; i++) { const q = 1 - i * 0.2; const pts = []; for (let a = 0; a <= 24; a++) { const an = Math.PI + (a / 24) * Math.PI; pts.push([cx + Math.cos(an) * rx * q, Math.sin(an) * ry * q]); } tubeM(nc, s, pts, [P.pink, P.cyan, P.violet, P.aqua][i], 0.45, false, na); }
                lc.fillStyle = css(hex('#ffb0d8'), 0.3); lc.beginPath(); lc.ellipse(cx, 0, rx * 0.5, ry * 0.45, 0, Math.PI, 0); lc.fill();
                continue;
            }
            if (b.kind === 'market') {
                // low pavilions under festoons of bulbs, lit shopfronts
                vfill(pc, u, -h, w, 0, [F(mix(b.col, '#2a1a4a', 0.5)), F(mix(b.col, '#ff9a7a', 0.25))]);
                pc.fillStyle = F('#2a3a4a'); pc.beginPath(); pc.moveTo(u - 1, -h); pc.lineTo(u + w / 2, -h - 4); pc.lineTo(u + w + 1, -h); pc.fill();
                for (let x = u + 2; x < u + w - 2; x += 4.5) { const c = WARM[Math.floor(r() * 5)]; pc.fillStyle = c; pc.fillRect(x, -3.5, 3, 3); lc.fillStyle = css(hex(c), 0.7); lc.fillRect(x, -3.5, 3, 3); }
                for (let q = 0; q <= 1; q += 0.05) { const xx = u + q * w, yy = -h - 0.5 + Math.sin(q * Math.PI * 3) ** 2 * 1.5; const c = [P.yellow, '#fff0d0', P.pink][Math.floor(q * 20) % 3]; lc.fillStyle = css(hex(c), 0.9); lc.fillRect(xx, yy, Math.max(0.6, 1.2 * px), Math.max(0.6, 1.2 * px)); pc.fillStyle = c; pc.fillRect(xx, yy, Math.max(0.3, 0.7 * px), Math.max(0.3, 0.7 * px)); }
                tubeM(nc, s, [[u + w * 0.4, -h - 2], [u + w * 0.4, -h - 9], [u + w * 0.6, -h - 9], [u + w * 0.6, -h - 2]], b.nA, 0.45, true, na);
                continue;
            }
            // hotels and MiMo blocks: a pastel facade at night, warm below, its neon
            const night = mix(b.col, '#22163e', b.kind === 'mimo' ? 0.5 : 0.4);
            vfill(pc, u, -h, w, 0, [F(mix(night, '#1e1440', 0.25)), F(night), F(mix(night, '#ffb08a', 0.38))]);
            // a rounded corner: a turning gradient and speed lines
            if (b.corner) {
                const cw = Math.min(6, w * 0.18), x0 = b.corner < 0 ? u : u + w - cw;
                const gr = pc.createLinearGradient(x0, 0, x0 + cw, 0);
                const lit = css(mix(mix(b.col, '#ffffff', 0.2), HAZE, fog), 0.55), dark = 'rgba(20,10,40,0.35)';
                gr.addColorStop(0, b.corner < 0 ? dark : 'rgba(0,0,0,0)'); gr.addColorStop(0.5, lit); gr.addColorStop(1, b.corner < 0 ? 'rgba(0,0,0,0)' : dark);
                pc.fillStyle = gr; pc.fillRect(x0, -h, cw, h);
            }
            const fp = b.kind === 'mimo' ? 3.2 : 3.4, nf = Math.floor((h - 4.5) / fp);
            // eyebrows over the window rows, the windows under them
            const cols = Math.max(2, Math.floor(w / 3.4));
            for (let f = 0; f < nf; f++) {
                const y = -(4.5 + f * fp + fp);
                pc.fillStyle = css(mix(mix(b.col, '#ffffff', 0.35), HAZE, fog), 0.6); pc.fillRect(u, y, w, Math.max(0.25, 0.6 * px));
                pc.fillStyle = 'rgba(16,8,36,0.35)'; pc.fillRect(u, y + Math.max(0.25, 0.6 * px), w, Math.max(0.3, 0.6 * px));
                for (let c = 0; c < cols; c++) {
                    if (b.fin && Math.abs(u + (c + 0.5) * w / cols - (u + w / 2)) < 2.4) continue;
                    const x = u + c * w / cols + w / cols * 0.22, ww = w / cols * 0.56, wy = y + fp * 0.32, wh = fp * 0.5;
                    if (r() < 0.42) {
                        const colr = r() < 0.15 ? TINT[Math.floor(r() * 3)] : WARM[Math.floor(r() * 5)];
                        pc.fillStyle = css(mix(hex(colr), HAZE, fog * 0.6)); pc.fillRect(x, wy, Math.max(ww, 0.7 * px), Math.max(wh, 0.7 * px));
                        lc.fillStyle = css(hex(colr), 0.7 * na); lc.fillRect(x, wy, Math.max(ww, 0.7 * px), Math.max(wh, 0.7 * px));
                    } else { pc.fillStyle = 'rgba(14,8,34,0.55)'; pc.fillRect(x, wy, Math.max(ww, 0.7 * px), Math.max(wh, 0.7 * px)); }
                }
                if (b.kind === 'mimo') { pc.fillStyle = css(mix(hex('#f4ecd8'), HAZE, fog + 0.2), 0.5); pc.fillRect(u - 0.8, y + fp - 0.5, w + 1.6, Math.max(0.35, 0.7 * px)); }
            }
            // the lit ground floor: a terrace with columns and an awning
            const tc = WARM[Math.floor(r() * 5)];
            pc.fillStyle = css(mix(hex(tc), HAZE, fog * 0.5), 0.85); pc.fillRect(u + 0.5, -4, w - 1, 3.4);
            lc.fillStyle = css(hex(tc), 0.55 * na); lc.fillRect(u + 0.5, -4, w - 1, 3.4);
            pc.fillStyle = 'rgba(30,14,40,0.8)'; for (let x = u + 2; x < u + w - 1; x += 4) pc.fillRect(x, -4, Math.max(0.4, 0.6 * px), 4);
            const aw = [b.nA, '#ffffff'];
            for (let x = u + 0.5, i = 0; x < u + w - 0.5; x += 1.6, i++) { pc.fillStyle = css(mix(hex(aw[i % 2]), HAZE, fog + 0.25), 0.8); pc.fillRect(x, -4.9, 1.6, 0.9); }
            // the roof: a stepped parapet outlined in neon, a racing stripe under it
            const steps = b.fin ? 2 : 1, cx = u + w / 2, pts = [[u, -h]];
            if (steps === 2) { pts.push([cx - w * 0.3, -h], [cx - w * 0.3, -h - 1.6], [cx - w * 0.16, -h - 1.6], [cx - w * 0.16, -h - 3.2], [cx + w * 0.16, -h - 3.2], [cx + w * 0.16, -h - 1.6], [cx + w * 0.3, -h - 1.6], [cx + w * 0.3, -h]); }
            pts.push([u + w, -h]);
            pc.fillStyle = F(mix(night, '#2a1a50', 0.2)); pc.beginPath(); pts.forEach((p, i) => (i ? pc.lineTo(p[0], p[1]) : pc.moveTo(p[0], p[1]))); pc.lineTo(u + w, -h + 0.5); pc.lineTo(u, -h + 0.5); pc.fill();
            tubeM(nc, s, pts, b.nA, 0.45, false, na);
            tubeM(nc, s, [[u + 0.4, -h + 2.2], [u + w - 0.4, -h + 2.2]], b.nB, 0.3, false, na * 0.85);
            if (b.kind === 'hotel' && h > 22) tubeM(nc, s, [[u + 0.4, -6.2], [u + w - 0.4, -6.2]], b.nB, 0.3, false, na * 0.7);
            // the fin: a pylon above the roof with a vertical blade of neon (no letters)
            if (b.fin) {
                const fw = Math.min(4.6, w * 0.14), fh = 8 + (b.seed % 7), top = -h - 3.2 - fh;
                vfill(pc, cx - fw / 2, top, fw, -h + 2, [F(mix(b.col, '#ffffff', 0.2)), F(night)]);
                tubeM(nc, s, [[cx - fw / 2, -h + 1], [cx - fw / 2, top], [cx + fw / 2, top], [cx + fw / 2, -h + 1]], b.nA, 0.4, false, na);
                const bx = cx, by0 = top + 1.6, by1 = -h + 1;
                if (b.sign === 0) for (let y = by0; y < by1 - 1; y += 2.4) tubeM(nc, s, [[bx - fw * 0.3, y + 1.2], [bx, y], [bx + fw * 0.3, y + 1.2]], b.nB, 0.32, false, na);
                else if (b.sign === 1) for (let y = by0 + 1; y < by1 - 1; y += 2.6) { const pts2 = []; for (let a = 0; a <= 12; a++) pts2.push([bx + Math.cos(a / 12 * TAU) * fw * 0.28, y + Math.sin(a / 12 * TAU) * 0.9]); tubeM(nc, s, pts2, b.nB, 0.3, false, na); }
                else if (b.sign === 2) { const pts2 = []; for (let y = by0, i = 0; y < by1; y += 1.3, i++) pts2.push([bx + (i % 2 ? 1 : -1) * fw * 0.3, y]); tubeM(nc, s, pts2, b.nB, 0.32, false, na); }
                else tubeM(nc, s, [[bx, by0], [bx, by1]], b.nB, 0.6, false, na);
                if (fh > 10) tubeM(nc, s, [[cx, top], [cx, top - 4]], b.nB, 0.3, false, na);
            }
            // speed lines round the rounded corner
            if (b.corner) { const x0 = b.corner < 0 ? u : u + w - 7, x1 = x0 + 7; for (let i = 0; i < 3; i++) tubeM(nc, s, [[x0, -h + 4 + i * 1.2], [x1, -h + 4 + i * 1.2]], b.nB, 0.25, false, na * 0.9); }
            // the edges catch the moon (cyan) and the neon (pink)
            pc.fillStyle = css(mix(hex('#8ff0ff'), HAZE, fog), 0.4); pc.fillRect(u, -h, Math.max(0.3, 0.6 * px), h);
            pc.fillStyle = css(mix(hex('#ff7ac0'), HAZE, fog), 0.4); pc.fillRect(u + w - Math.max(0.3, 0.6 * px), -h, Math.max(0.3, 0.6 * px), h);
        }
        // the drive, the promenade and the seawall
        vfill(pc, 0, -1.2, it.len, 0.2, [F('#3a2448'), F('#5a3050')]);
        pc.fillStyle = F('#c89070'); pc.fillRect(0, -0.1, it.len, Math.max(0.25, 0.5 * px));
        vfill(pc, 0, 0, it.len, 1.6, [F('#3a2440'), F('#1a1028')]);
        for (let x = 1; x < it.len; x += 3) { lc.fillStyle = css(hex('#ffc890'), 0.4 * na); lc.fillRect(x, -0.15, Math.max(0.3, 0.7 * px), Math.max(0.3, 0.7 * px)); }
        // palms, then lamps over the drive
        for (const p of it.palms) palmM(pc, s, p.u, p.h, p.lean, p.coco, p.seed, true);
        for (const u of it.lamps) {
            pc.strokeStyle = '#2a2040'; pc.lineWidth = Math.max(0.2, 0.55 * px); pc.beginPath(); pc.moveTo(u, 0); pc.lineTo(u, -8); pc.lineTo(u + 1.4, -8.3); pc.stroke();
            pc.fillStyle = '#ffd9a0'; pc.fillRect(u + 0.9, -8.4, Math.max(0.6, 0.9 * px), Math.max(0.4, 0.8 * px));
            lc.globalAlpha = na; lc.drawImage(glowSprite(P.sodium), u + 1.3 - 2.6, -8.2 - 2.6, 5.2, 5.2); lc.globalAlpha = 1;
            // the pool of light under it
            const gr = pc.createRadialGradient(u + 1.3, 0, 0, u + 1.3, 0, 7); gr.addColorStop(0, 'rgba(255,190,120,0.3)'); gr.addColorStop(1, 'rgba(255,190,120,0)');
            pc.fillStyle = gr; pc.fillRect(u - 6, -4, 14, 4.2);
        }
    }

    // ---- far shores: low-rise lights ------------------------------------------------------
    function suburb(id, x0, x1, R) {
        const za = zs(x0) + 30, zb = zs(x1) + 30, len = Math.hypot(x1 - x0, zb - za);
        const it = { id, kind: 'suburb', x: (x0 + x1) / 2, z: (za + zb) / 2, O: [x0, WL + 1.6, za], ex: [(x1 - x0) / len, 0, (zb - za) / len], len, neon: false };
        it.u0 = -1; it.u1 = len + 1; it.v1 = 34;
        it.fog = clamp((Math.hypot(it.x, it.z) - 1900) / 3200, 0.1, 0.7);
        it.paint = (pc, lc, nc, s) => {
            const r = Motion.rng('sub-' + id), px = 1 / s, fog = it.fog;
            for (let u = 0; u < len; ) {
                const w = 12 + r() * 40, h = 5 + r() * (r() < 0.2 ? 26 : 12);
                vfill(pc, u, -h, w, 0, [css(mix(hex('#2a1e48'), HAZE, fog)), css(mix(hex('#4a2a58'), HAZE, fog))]);
                for (let y = -h + 1.5; y < -1.5; y += 3.2) for (let x = u + 1; x < u + w - 1; x += 3) {
                    if (r() > 0.22) continue;
                    const c = WARM[Math.floor(r() * 5)];
                    pc.fillStyle = css(mix(hex(c), HAZE, fog * 0.6)); pc.fillRect(x, y, Math.max(1.4, 0.8 * px), Math.max(1.2, 0.8 * px));
                    lc.fillStyle = css(hex(c), 0.55 * (1 - fog * 0.6)); lc.fillRect(x, y, Math.max(1.4, 0.8 * px), Math.max(1.2, 0.8 * px));
                }
                u += w + r() * 10;
            }
            for (let u = r() * 20; u < len; u += 18 + r() * 30) palmM(pc, s, u, 10 + r() * 5, (r() - 0.5) * 0.2, r() < 0.3, id * 100 + u, false);
            for (let u = 5; u < len; u += 30) { lc.globalAlpha = 0.8 * (1 - fog * 0.5); lc.drawImage(glowSprite(P.sodium), u - 3, -7 - 3, 6, 6); lc.globalAlpha = 1; pc.fillStyle = '#ffd9a0'; pc.fillRect(u - 0.5, -7.3, Math.max(1, px), Math.max(0.8, px)); }
            pc.fillStyle = css(mix(hex('#1a1028'), HAZE, fog)); pc.fillRect(0, 0, len, 1.6);
        };
        return it;
    }

    // ---- the marina: boats in their berths in front of the bayfront park ------------------
    function marinaItem(id, R) {
        const x0 = -930, x1 = -330, z = zs(-630) - 70;
        const it = { id, kind: 'marina', x: (x0 + x1) / 2, z, O: [x0, WL, z], ex: [1, 0, 0], len: x1 - x0, neon: false, fog: 0.05 };
        it.u0 = -1; it.u1 = it.len + 1; it.v1 = 26;
        const r = Motion.rng('marina');
        it.boats = [];
        for (let u = 4; u < it.len - 8; u += 5 + r() * 6) it.boats.push({ u, l: 7 + r() * 12, sail: r() < 0.55, mast: 9 + r() * 11, cab: r() < 0.6, neon: r() < 0.15 ? [P.cyan, P.pink, P.violet][Math.floor(r() * 3)] : null, row: r() < 0.5 ? 0 : 1 });
        it.paint = (pc, lc, nc, s) => {
            const px = 1 / s;
            // the pontoons: two lines of dock lights at the waterline
            for (const [y, a] of [[0.1, 0.9], [-0.6, 0.7]]) {
                pc.fillStyle = '#3a2a4a'; pc.fillRect(0, y - 0.25, it.len, Math.max(0.3, 0.7 * px));
                for (let x = 2; x < it.len; x += 9) { pc.fillStyle = '#bfe8ff'; pc.fillRect(x, y - 0.6, Math.max(0.4, 0.8 * px), Math.max(0.4, 0.8 * px)); lc.fillStyle = css(hex('#9adfff'), 0.6 * a); lc.fillRect(x - 0.2, y - 0.8, Math.max(0.8, 1.2 * px), Math.max(0.8, 1.2 * px)); }
            }
            for (const b of it.boats.sort((a, c) => a.row - c.row)) {
                const y = b.row ? -0.6 : 0.1, u = b.u + (b.row ? 2 : 0);
                // the hull (white, a dark boot stripe), the cabin
                pc.fillStyle = '#d8d0ec'; pc.beginPath(); pc.moveTo(u, y - 1.6); pc.lineTo(u + b.l, y - 1.8); pc.lineTo(u + b.l - 1.5, y); pc.lineTo(u + 0.6, y); pc.closePath(); pc.fill();
                pc.fillStyle = 'rgba(40,24,80,0.6)'; pc.fillRect(u + 0.6, y - 0.4, b.l - 2, Math.max(0.2, 0.5 * px));
                if (b.cab) { pc.fillStyle = '#c8bce0'; pc.fillRect(u + b.l * 0.25, y - 3, b.l * 0.4, 1.4); pc.fillStyle = '#ffd9a0'; pc.fillRect(u + b.l * 0.3, y - 2.6, b.l * 0.28, Math.max(0.4, 0.6 * px)); lc.fillStyle = css(hex('#ffcf8a'), 0.55); lc.fillRect(u + b.l * 0.3, y - 2.6, b.l * 0.28, Math.max(0.4, 0.6 * px)); }
                if (b.sail) {
                    pc.strokeStyle = '#b8b0d0'; pc.lineWidth = Math.max(0.12, 0.5 * px); pc.beginPath(); pc.moveTo(u + b.l * 0.42, y - 1.6); pc.lineTo(u + b.l * 0.42, y - 1.6 - b.mast); pc.stroke();
                    pc.strokeStyle = 'rgba(200,190,230,0.35)'; pc.beginPath(); pc.moveTo(u + b.l * 0.42, y - 1.6 - b.mast); pc.lineTo(u + b.l - 0.5, y - 1.8); pc.moveTo(u + b.l * 0.42, y - 1.6 - b.mast); pc.lineTo(u + 0.5, y - 1.6); pc.stroke();
                    // the anchor light at the masthead
                    lc.globalAlpha = 0.9; lc.drawImage(glowSprite('#e8f4ff'), u + b.l * 0.42 - 1.6, y - 1.6 - b.mast - 1.6, 3.2, 3.2); lc.globalAlpha = 1;
                    pc.fillStyle = '#ffffff'; pc.fillRect(u + b.l * 0.42 - 0.25, y - 1.8 - b.mast, Math.max(0.5, px), Math.max(0.5, px));
                }
                if (b.neon) { pc.fillStyle = b.neon; pc.fillRect(u + 0.8, y - 0.15, b.l - 2.4, Math.max(0.3, 0.6 * px)); lc.fillStyle = css(hex(b.neon), 0.9); lc.fillRect(u + 0.8, y - 0.3, b.l - 2.4, Math.max(0.5, 1.0 * px)); }
            }
        };
        return it;
    }

    // ======================================================================================
    // SPRITES (one per item and scale) AND THEIR PLACEMENT
    // ======================================================================================
    const SPR = new Map();
    function sprite(it, s) {
        const key = it.id + '@' + s;
        let sp = SPR.get(key);
        if (sp) return sp;
        const w = Math.ceil((it.u1 - it.u0) * s) + 2, h = Math.ceil((it.v1 + 2) * s) + 2;
        const mk = () => { const c = mkC(w, h), x = c.getContext('2d'); x.setTransform(s, 0, 0, s, 1 - it.u0 * s, 1 + it.v1 * s); return [c, x]; };
        const [pc, px] = mk(), [lc, lx] = mk(), [nc, nx] = it.neon ? mk() : [null, null];
        lx.globalCompositeOperation = 'lighter';
        it.paint(px, lx, nx, s);
        sp = { pic: pc, lit: lc, neon: nc, ox: it.u0 - 1 / s, oy: it.v1 + 1 / s, mw: w / s, mh: h / s };
        SPR.set(key, sp);
        return sp;
    }
    // the item's metres → unrolled screen, as an affine map from three projected points
    function frameOf(it, V) {
        const O = it.O, ex = it.ex, Lx = Math.max(10, it.u1 - it.u0), Ly = Math.max(10, it.v1);
        const A = V.p(O); if (A[2] < 30) return null;
        const B = V.p([O[0] + ex[0] * Lx, O[1], O[2] + ex[2] * Lx]), C = V.p([O[0], O[1] + Ly, O[2]]);
        return { a: (B[0] - A[0]) / Lx, b: (B[1] - A[1]) / Lx, c: -(C[0] - A[0]) / Ly, d: -(C[1] - A[1]) / Ly, e: A[0], f: A[1], depth: A[2] };
    }
    const bucket = (s) => 2 ** clamp(Math.ceil(Math.log2(s) * 4 - 0.1) / 4, -2.5, 3);
    function place(ctx, F) {
        const [A, B, C, D, E, G] = baseOf(ctx);
        ctx.setTransform(A * F.a + C * F.b, B * F.a + D * F.b, A * F.c + C * F.d, B * F.c + D * F.d, A * F.e + C * F.f + E, B * F.e + D * F.f + G);
    }
    // is the item on screen? (its corners, logical)
    function visible(it, F, V) {
        const xs = [F.e + F.a * it.u0, F.e + F.a * it.u1, F.e + F.a * it.u0 + F.c * -it.v1, F.e + F.a * it.u1 + F.c * -it.v1];
        const m = S.m + 4;
        return Math.max(...xs) > -m && Math.min(...xs) < V.W + m && F.f + F.d * -it.v1 < V.H + m;
    }

    // ======================================================================================
    // PER FRAME
    // ======================================================================================
    // the landmark's crown: one colour per bar, turning through the neon palette
    const CROWN = [P.pink, P.cyan, P.violet, P.aqua, P.magenta, P.gold];
    function crownColour(T, fx = {}) {
        const bar = Math.floor((T - Song.bar0) / (4 * Song.beat));
        const c = CROWN[((bar % CROWN.length) + CROWN.length) % CROWN.length];
        return fx.hue ? Neon.shift(c, fx.hue, 1.2) : hex(c);
    }
    const fBucket = (fpx) => 2 ** (Math.ceil(Math.log2(fpx) * 4 - 0.05) / 4);
    const compose = (A, F) => ({ a: A.a * F.a + A.c * F.b, b: A.b * F.a + A.d * F.b, c: A.a * F.c + A.c * F.d, d: A.b * F.c + A.d * F.d, e: A.a * F.e + A.c * F.f + A.e, f: A.b * F.e + A.d * F.f + A.f });
    // the affine map of a strip of a flat painting: canvas px (u, v) → screen, from the
    // projections of three of its corners
    const stripMap = (TL, TR, BL, ua, ub, h) => {
        const a = (TR[0] - TL[0]) / (ub - ua), b = (TR[1] - TL[1]) / (ub - ua), c = (BL[0] - TL[0]) / h, d = (BL[1] - TL[1]) / h;
        return { a, b, c, d, e: TL[0] - a * ua, f: TL[1] - b * ua };
    };
    const SINK = mkC(1, 1).getContext('2d');             // swallows a pass meant for one layer only

    // the sky: gradient by elevation, the glow over the city, stars, moon, clouds, plane
    function sky(V, T, fx) {
        const px = S.px, lx = S.lx, m = S.m, hold = fx.hold ?? 0;
        const W = V.W + 2 * m;
        const yAt = (deg) => V.cy - V.f * Math.tan(deg * Math.PI / 180 - V.pitch);
        const stops = [[0, '#c23f74'], [1.2, '#a8336f'], [3.5, '#82286f'], [7, '#5a1e6c'], [12, '#3a1762'], [20, '#24114e'], [30, '#170b3b'], [44, '#0e0829'], [62, '#08061c']];
        const y0 = yAt(62), y1 = yAt(0) + 1;
        const gr = px.createLinearGradient(0, y0, 0, y1);
        for (const [d, c] of stops) gr.addColorStop(1 - d / 62, css(mix(c, '#ff6a9a', hold * 0.14 * Math.max(0, 1 - d / 20))));
        px.fillStyle = gr; px.fillRect(-m, -m, W, Math.max(0, V.yh + 3 + m));
        // the glow over the city: orange at its heart, magenta round it (rises in the hold)
        const glowAt = (P3, rx, ry, stopsG, a) => {
            const c = V.dir(nrm([P3[0] - V.pos[0], 0, P3[2] - V.pos[2]])); if (!c) return;
            px.save(); px.translate(c[0], V.yh); px.scale(1, ry / rx);
            const g2 = px.createRadialGradient(0, 0, 0, 0, 0, rx);
            for (const [u, col, al] of stopsG) g2.addColorStop(u, rgba(col, al * a));
            px.fillStyle = g2; px.fillRect(-rx, -rx, 2 * rx, rx + 2);
            px.restore();
        };
        const up = 1 + hold * 0.5;
        glowAt(DOWNTOWN, V.f * 0.8 * (1 + hold * 0.1), V.f * 0.14 * up, [[0, '#ffb070', 0.85], [0.14, '#ff8a68', 0.66], [0.34, '#f0567e', 0.42], [0.66, '#b0347a', 0.16], [1, '#a0306e', 0]], Math.min(1, 0.85 * up));
        glowAt([-1100, 0, 2350], V.f * 0.35, V.f * 0.07, [[0, '#ff9a7a', 0.5], [0.4, '#e0508a', 0.25], [1, '#a0306e', 0]], 1);
        glowAt([1600, 0, 2400], V.f * 0.3, V.f * 0.06, [[0, '#ff7ab0', 0.4], [1, '#a0306e', 0]], 1);
        // stars: dimmer in the glow; a few sparkle; in the hold they stop twinkling
        const tw = T - 1.4 * (fx.holdT ?? 0);
        for (const st of WORLD.stars) {
            const q = V.dir(st.d); if (!q) continue;
            if (q[0] < -m || q[0] > V.W + m || q[1] < -m || q[1] > V.yh) continue;
            const fade = sstep(0.03, 0.16, st.el) * (1 - 0.6 * Math.exp(-(((q[0] - V.cx) / (V.f * 0.6)) ** 2)) * (1 - sstep(0.05, 0.3, st.el)));
            const a = st.a * fade * (0.7 + 0.3 * Math.sin(tw * st.tw + st.ph) * (1 - hold * 0.8));
            if (a < 0.03) continue;
            px.fillStyle = rgba(st.col, a);
            if (st.r < 1.1) px.fillRect(q[0] - st.r / 2, q[1] - st.r / 2, st.r, st.r);
            else { px.beginPath(); px.arc(q[0], q[1], st.r * 0.62, 0, TAU); px.fill(); }
            if (st.spark) sparkle(lx, q[0], q[1], st.r * (5 + 4 * (fx.star ?? 0)), a * 0.7, 0.0);
        }
        clouds(V, T, fx);
        moon(V, T, fx);
        plane(V, T, fx);
    }

    // a thin crescent moon high to the right, its earthshine and its halo
    const MOON = nrm([Math.sin(0.36), Math.tan(0.30), Math.cos(0.36)]);
    let MOONSPR = null;
    function moon(V, T, fx) {
        const q = V.dir(MOON); if (!q) return;
        const r = V.f * 0.024;
        if (!MOONSPR) {
            const N = 256, c = mkC(N, N), g = c.getContext('2d'), R = N * 0.42, cx = N / 2;
            // earthshine: the dark disc, faintly lit, with its seas
            const e = g.createRadialGradient(cx - R * 0.2, cx - R * 0.2, R * 0.1, cx, cx, R);
            e.addColorStop(0, '#4a3c7a'); e.addColorStop(1, '#2a2050');
            g.fillStyle = e; g.beginPath(); g.arc(cx, cx, R, 0, TAU); g.fill();
            const mr = Motion.rng('maria');
            for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(20,14,50,0.35)'; g.beginPath(); g.ellipse(cx + (mr() - 0.5) * R * 1.1, cx + (mr() - 0.5) * R * 1.1, R * (0.1 + mr() * 0.18), R * (0.08 + mr() * 0.14), mr() * 3, 0, TAU); g.fill(); }
            // the lit crescent: the disc minus a disc moved up and left
            const lit = mkC(N, N), l = lit.getContext('2d');
            const lg = l.createLinearGradient(cx + R, cx + R, cx - R * 0.2, cx - R * 0.2);
            lg.addColorStop(0, '#fff6e6'); lg.addColorStop(0.5, '#ffe3cc'); lg.addColorStop(1, '#f5c8d8');
            l.fillStyle = lg; l.beginPath(); l.arc(cx, cx, R, 0, TAU); l.fill();
            for (let i = 0; i < 7; i++) { l.fillStyle = 'rgba(190,150,170,0.35)'; l.beginPath(); l.ellipse(cx + R * (0.3 + mr() * 0.5), cx + R * (0.1 + mr() * 0.6), R * 0.08, R * 0.12, mr() * 3, 0, TAU); l.fill(); }
            l.globalCompositeOperation = 'destination-out';
            l.beginPath(); l.arc(cx - R * 0.42, cx - R * 0.3, R * 0.96, 0, TAU); l.fill();
            l.globalCompositeOperation = 'destination-in'; l.beginPath(); l.arc(cx, cx, R, 0, TAU); l.fill();
            g.drawImage(lit, 0, 0);
            MOONSPR = { c, lit, N, R };
        }
        const sc = r / MOONSPR.R, sz = MOONSPR.N * sc;
        glow(S.lx, q[0], q[1], r * 5, '#b8a0ff', 0.32);
        glow(S.px, q[0], q[1], r * 7, '#9a70e0', 0.18);
        S.px.drawImage(MOONSPR.c, q[0] - sz / 2, q[1] - sz / 2, sz, sz);
        S.lx.globalAlpha = 0.8; S.lx.drawImage(MOONSPR.lit, q[0] - sz / 2, q[1] - sz / 2, sz, sz); S.lx.globalAlpha = 1;
        WORLD.moonAt = q; WORLD.moonR = r;
    }

    // banks of low cloud, lit pink and orange from below by the city: painted once into a
    // panorama (azimuth × elevation) and laid on the sky in strips through the projection
    const PUFF = {};
    function puffSprite(kind) {
        if (PUFF[kind]) return PUFF[kind];
        const W = 192, H = 96, c = mkC(W, H), g = c.getContext('2d');
        // a lumpy cloud: overlapping soft lobes over a flatter base
        const R = Motion.rng('puff' + kind), streak = kind === 1;
        g.save(); g.translate(W / 2, H * 0.62);
        const n = streak ? 5 : 9;
        for (let i = 0; i < n; i++) {
            const x = (R() - 0.5) * W * (streak ? 0.75 : 0.62), up = streak ? R() * 0.15 : Math.pow(R(), 0.7) * 0.55;
            const rr = H * (streak ? 0.14 : 0.16 + R() * 0.16) * (1 - Math.abs(x) / W * 0.9);
            const y = -up * H * 0.5 + rr * 0.4;
            const gr = g.createRadialGradient(x, y, 0, x, y, rr * 1.5);
            gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rr * 1.5 * (streak ? 3 : 1.5), rr * 1.5, 0, 0, TAU); g.fill();
        }
        g.restore();
        // the base is flat: fade the mask out below it
        g.globalCompositeOperation = 'destination-out';
        const fb = g.createLinearGradient(0, H * 0.66, 0, H * 0.8); fb.addColorStop(0, 'rgba(0,0,0,0)'); fb.addColorStop(1, 'rgba(0,0,0,1)');
        g.fillStyle = fb; g.fillRect(0, H * 0.66, W, H * 0.34);
        const body = mkC(W, H), b = body.getContext('2d'), lit = mkC(W, H), l = lit.getContext('2d');
        b.drawImage(c, 0, 0); b.globalCompositeOperation = 'source-in';
        const bg = b.createLinearGradient(0, H * 0.1, 0, H * 0.78); bg.addColorStop(0, 'rgba(70,40,120,0.55)'); bg.addColorStop(0.55, 'rgba(110,50,130,0.85)'); bg.addColorStop(1, 'rgba(150,60,130,1)');
        b.fillStyle = bg; b.fillRect(0, 0, W, H);
        l.drawImage(c, 0, 0); l.globalCompositeOperation = 'source-in';
        const lg = l.createLinearGradient(0, H * 0.3, 0, H * 0.78); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.65, 'rgba(255,255,255,0.55)'); lg.addColorStop(1, 'rgba(255,255,255,1)');
        l.fillStyle = lg; l.fillRect(0, 0, W, H);
        const tint = (col) => { const t = mkC(W, H), x = t.getContext('2d'); x.drawImage(lit, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, W, H); return t; };
        PUFF[kind] = { body, orange: tint('#ffa468'), pink: tint('#ff5a9c'), mauve: tint('#c0508e'), W, H };
        return PUFF[kind];
    }
    const CPANO = new Map();
    const CP = { az0: -1.55, az1: 1.35, el0: -0.004, el1: 0.27 };
    function cloudPano(fr) {
        if (CPANO.has(fr)) return CPANO.get(fr);
        const w = Math.ceil((CP.az1 - CP.az0) * fr), h = Math.ceil((CP.el1 - CP.el0) * fr);
        const body = mkC(w, h), lit = mkC(w, h), bx = body.getContext('2d'), lx = lit.getContext('2d');
        const cAz = 0.115;                                  // downtown, from the causeway
        for (const p of WORLD.puffs) {
            const u = (p.az - CP.az0) * fr, v = (CP.el1 - p.el) * fr, rx = p.rx * fr, ry = p.ry * fr;
            const sp = puffSprite(p.kind === 'streak' ? 1 : Math.floor(p.v * 3) + 2);
            const near = Math.exp(-(((p.az - cAz) / 0.6) ** 2)), hi = sstep(0.0, 0.14, p.el);
            bx.globalAlpha = p.kind === 'streak' ? 0.55 : 0.9; bx.drawImage(sp.body, u - rx, v - ry, 2 * rx, 2 * ry);
            lx.globalAlpha = Math.min(1, (0.3 + 0.7 * near) * (1 - hi * 0.45) * (p.kind === 'streak' ? 0.9 : 0.8));
            lx.drawImage(near > 0.55 ? sp.orange : sp.pink, u - rx, v - ry, 2 * rx, 2 * ry);
            bx.globalAlpha = (1 - near) * 0.45; bx.drawImage(sp.mauve, u - rx, v - ry, 2 * rx, 2 * ry);
        }
        const pano = { w, h, body, lit, fr };
        CPANO.set(fr, pano);
        return pano;
    }
    function clouds(V, T, fx) {
        const fr = fBucket(V.f * S.k), pano = cloudPano(fr);
        const drift = (T - 58.9 - (fx.holdT ?? 0)) * 0.0011;
        const dirOf = (u, v) => { const az = CP.az0 + u / fr + drift, el = CP.el1 - v / fr; return [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)]; };
        const sw = Math.max(16, Math.round(70 * fr / V.f));
        const litA = Math.min(1, 0.85 + 0.15 * (fx.hold ?? 0));
        for (let ua = 0; ua < pano.w; ua += sw) {
            const ub = Math.min(pano.w, ua + sw);
            const TL = V.dir(dirOf(ua, 0)), TR = V.dir(dirOf(ub, 0)), BL = V.dir(dirOf(ua, pano.h));
            if (!TL || !TR || !BL) continue;
            if (Math.max(TL[0], TR[0]) < -S.m - 4 || Math.min(TL[0], TR[0]) > V.W + S.m + 4) continue;
            const A = stripMap(TL, TR, BL, ua, ub, pano.h), x1 = Math.min(pano.w, ub + 2);
            place(S.px, A);
            S.px.globalAlpha = 1; S.px.drawImage(pano.body, ua, 0, x1 - ua, pano.h, ua, 0, x1 - ua, pano.h);
            S.px.globalAlpha = litA; S.px.drawImage(pano.lit, ua, 0, x1 - ua, pano.h, ua, 0, x1 - ua, pano.h);
            place(S.lx, A); S.lx.globalAlpha = 0.1; S.lx.drawImage(pano.lit, ua, 0, x1 - ua, pano.h, ua, 0, x1 - ua, pano.h);
        }
        S.px.globalAlpha = 1; S.lx.globalAlpha = 1;
        logical(S.px); logical(S.lx);
    }

    // a plane on its way in: white strobes, a red beacon, red and green wing lights
    function plane(V, T, fx) {
        const t = T - 58.9, x = -900 + t * 72, y = 620 - t * 3, z = 4000;
        const c = V.p([x, y, z]); if (c[2] < 1) return;
        const s = V.f / c[2], px = S.px, lx = S.lx;
        const wing = 18 * s, len = 22 * s;
        px.strokeStyle = 'rgba(30,18,60,0.9)'; px.lineCap = 'round';
        px.lineWidth = Math.max(0.8, 2.4 * s); px.beginPath(); px.moveTo(c[0] - len, c[1] + 0.6 * s); px.lineTo(c[0] + len, c[1]); px.stroke();
        px.lineWidth = Math.max(0.6, 1.1 * s); px.beginPath(); px.moveTo(c[0] - wing * 0.3, c[1] - 0.4 * s); px.lineTo(c[0] + wing * 0.25, c[1] + 0.7 * s); px.stroke();
        px.beginPath(); px.moveTo(c[0] - len * 0.9, c[1] + 0.5 * s); px.lineTo(c[0] - len * 1.05, c[1] - 4 * s); px.stroke();
        px.strokeStyle = 'rgba(255,150,170,0.5)'; px.lineWidth = Math.max(0.5, 0.6 * s); px.beginPath(); px.moveTo(c[0] - len, c[1] + 1.4 * s); px.lineTo(c[0] + len, c[1] + 0.9 * s); px.stroke();
        const strobe = fract(T * 0.83) < 0.05 || (fract(T * 0.83) > 0.12 && fract(T * 0.83) < 0.16);
        const beacon = 0.5 + 0.5 * Math.cos(T * TAU * 1.0);
        glow(lx, c[0] - wing * 0.3, c[1] - 0.4 * s, Math.max(3, 3 * s), P.red, 0.9);
        glow(lx, c[0] + wing * 0.25, c[1] + 0.7 * s, Math.max(3, 3 * s), '#4aff8a', 0.9);
        glow(lx, c[0], c[1] - 1.2 * s, Math.max(3.5, 3.5 * s), P.red, beacon);
        glow(lx, c[0] + len, c[1], Math.max(4, 4 * s), '#fff4e0', 0.85);
        if (strobe) sparkle(lx, c[0] - wing * 0.3, c[1] - 0.4 * s, 14, 1);
    }

    // ---- the city as impostors ----------------------------------------------------------
    // Two flat paintings on planes across the bay (the towers and far shores at 2.6 km, the
    // waterfront at 1.96 km), painted from a reference eye near the camera and laid on the
    // frame in narrow strips through the real projection. The eye (to 10 m across, 6 m up,
    // 40 m along) and the pixel density are quantized from the camera, so the same frame
    // always gets the same painting; parallax stays under a pixel. Overlays (windows on the
    // beat, the crown, beacons, cars) go through the same strips so they sit on it exactly.
    const IMP = new Map();
    const LAYERS = [['back', 2600], ['front', 1960]];
    function impostor(V, trip) {
        const ex = Math.round(V.pos[0] / 10) * 10, ey = Math.round(V.pos[1] / 6) * 6, ez = Math.round(V.pos[2] / 40) * 40;
        const fr = fBucket(V.f * S.k);
        const key = [ex, ey, ez, fr, trip ? 1 : 0].join();
        if (IMP.has(key)) return IMP.get(key);
        if (IMP.size >= 2) IMP.delete(IMP.keys().next().value);
        const imp = { E: [ex, ey, ez], fr, trip, layers: [] };
        const ref = (Q) => { const z = Q[2] - ez; return [fr * (Q[0] - ex) / z, -fr * (Q[1] - ey) / z, z]; };
        for (const [name, Z] of LAYERS) {
            const list = name === 'back' ? WORLD.back : WORLD.front;
            const entries = [];
            let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
            for (const it of list) {
                const az = Math.atan2(it.O[0] - ex, it.O[2] - ez);
                if (az < -1.3 || az > 1.0) continue;
                const O = it.O, Lx = Math.max(10, it.u1 - it.u0), Ly = Math.max(10, it.v1);
                const A = ref(O), B = ref([O[0] + it.ex[0] * Lx, O[1], O[2] + it.ex[2] * Lx]), C = ref([O[0], O[1] + Ly, O[2]]);
                const F = { a: (B[0] - A[0]) / Lx, b: (B[1] - A[1]) / Lx, c: -(C[0] - A[0]) / Ly, d: -(C[1] - A[1]) / Ly, e: A[0], f: A[1] };
                for (const [u, v] of [[it.u0, 2], [it.u1, 2], [it.u0, -it.v1], [it.u1, -it.v1]]) {
                    const x = F.e + F.a * u + F.c * v, y = F.f + F.b * u + F.d * v;
                    u0 = Math.min(u0, x); u1 = Math.max(u1, x); v0 = Math.min(v0, y); v1 = Math.max(v1, y);
                }
                entries.push({ it, F });
            }
            const ou = -Math.floor(u0) + 3, ov = -Math.floor(v0) + 3, w = Math.ceil(u1 - u0) + 6, h = Math.ceil(v1 - v0) + 6;
            const mk2 = () => { const c = mkC(w, h); return [c, c.getContext('2d')]; };
            const [pic, pc] = mk2(), [lit, lc] = mk2(), [neon, nc] = trip ? mk2() : [null, null];
            lc.globalCompositeOperation = 'lighter';
            for (const en of entries) {
                const F = en.F; F.e += ou; F.f += ov;
                const sp = sprite(en.it, bucket(Math.hypot(F.a, F.b)));
                const put = (ctx, img, a = 1) => { ctx.setTransform(F.a, F.b, F.c, F.d, F.e, F.f); ctx.globalAlpha = a; ctx.drawImage(img, sp.ox, -sp.oy, sp.mw, sp.mh); };
                put(pc, sp.pic); put(lc, sp.lit);
                if (sp.neon) { if (trip) put(nc, sp.neon); else { put(pc, sp.neon, 0.6); put(lc, sp.neon, 1); } }
            }
            for (const c of [pc, lc, nc]) if (c) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; }
            const D = Z - ez;
            imp.layers.push({ name, Z, D, pic, lit, neon, w, h, ou, ov, entries, vg: ov - fr * (WL + 2.5 - ey) / D });
        }
        IMP.set(key, imp);
        return imp;
    }

    // the strips of an impostor's layer as seen by V (with the trip's breathing)
    function strips(V, imp, L, T, fx) {
        const { fr, E } = imp, D = L.D;
        const P3 = (u, v) => [E[0] + (u - L.ou) / fr * D, E[1] - (v - L.ov) / fr * D, E[2] + D];
        const sw = Math.max(12, Math.round(56 * fr / V.f)), out = [];
        const br = (fx.breathe ?? 0) * 2.4;
        for (let ua = 0; ua < L.w; ua += sw) {
            const ub = Math.min(L.w, ua + sw);
            const TL = V.p(P3(ua, 0)), TR = V.p(P3(ub, 0)), BL = V.p(P3(ua, L.h));
            if (TL[2] < 50 || TR[2] < 50) continue;
            if (Math.max(TL[0], TR[0], BL[0]) < -S.m - 8 || Math.min(TL[0], TR[0], BL[0]) > V.W + S.m + 8) continue;
            const A = stripMap(TL, TR, BL, ua, ub, L.h);
            if (br > 0 && L.name === 'back') {
                // the city breathes: every strip stretches up from the ground on its own phase
                const sx = (TL[0] + TR[0]) / 2, st = 1 + br * (0.55 + 0.45 * Math.sin(T * 3.1 + sx * 0.011)) * (0.7 + 0.3 * Math.sin(sx * 0.031 - T * 2));
                A.e += A.c * L.vg * (1 - st); A.f += A.d * L.vg * (1 - st); A.c *= st; A.d *= st;
            }
            out.push({ ua, ub, A });
        }
        return out;
    }

    // the city through its impostors, with the overlays; returns the top of the city (y)
    function city(V, T, fx, neonTo) {
        const trip = (fx.trip ?? 0) > 0;
        if (V.f * S.k > 1900) return cityDirect(V, T, fx, neonTo);   // long lenses: every item itself
        const imp = impostor(V, trip);
        const px = S.px, lx = S.lx, kick = fx.kick ?? 0;
        let top = V.yh;
        for (const L of imp.layers) {
            const st = strips(V, imp, L, T, fx);
            L.st = st;
            for (const { ua, ub, A } of st) {
                const x1 = Math.min(L.w, ub + 2), sw = x1 - ua;
                place(px, A); px.drawImage(L.pic, ua, 0, sw, L.h, ua, 0, sw, L.h);
                place(lx, A); lx.drawImage(L.lit, ua, 0, sw, L.h, ua, 0, sw, L.h);
                if (L.neon) {
                    const nt = neonTo.x;
                    place(nt, A);
                    const na = L.name === 'front' ? 0.85 + 0.7 * kick : 1;
                    nt.globalAlpha = Math.min(1, na); nt.drawImage(L.neon, ua, 0, sw, L.h, ua, 0, sw, L.h);
                    if (na > 1) { nt.globalAlpha = na - 1; nt.drawImage(L.neon, ua, 0, sw, L.h, ua, 0, sw, L.h); }
                    nt.globalAlpha = 1;
                    if (!neonTo.sep) { place(px, A); px.globalAlpha = 0.6; px.drawImage(L.neon, ua, 0, sw, L.h, ua, 0, sw, L.h); px.globalAlpha = 1; }
                }
                top = Math.min(top, A.f, A.f + A.b * (ub - ua));
            }
            logical(px); logical(lx);
            if (L.name === 'back') haze(V, fx);
        }
        // overlays, through the strip under each item
        for (const L of imp.layers) {
            if (!L.st.length) continue;
            const s0 = L.st[0].ua, swd = L.st.length > 1 ? L.st[1].ua - L.st[0].ua : L.w;
            for (const en of L.entries) {
                const it = en.it; if (it.kind !== 'tower' && !(it.kind === 'block' && it.cars.length)) continue;
                const uc = en.F.e + en.F.a * (it.u0 + it.u1) / 2;
                const si = L.st.find((q) => uc >= q.ua && uc < q.ub); if (!si) continue;
                dynamic(it, compose(si.A, en.F), V, T, fx);
            }
        }
        logical(px); logical(lx);
        if (neonTo.sep) logical(neonTo.x);
        return top;
    }

    // the haze at street level, over the feet of the towers
    function haze(V, fx) {
        const px = S.px, lx = S.lx;
        const c = V.dir(nrm([DOWNTOWN[0] - V.pos[0], 0, DOWNTOWN[2] - V.pos[2]])); if (!c) return;
        const rx = V.f * 1.1, ry = V.f * 0.022 * (1 + (fx.hold ?? 0) * 0.5);
        px.save(); px.translate(c[0], V.yh + 3); px.scale(1, ry / rx);
        const gr = px.createRadialGradient(0, 0, 0, 0, 0, rx);
        gr.addColorStop(0, 'rgba(255,140,120,0.42)'); gr.addColorStop(0.35, 'rgba(240,90,140,0.26)'); gr.addColorStop(1, 'rgba(160,50,120,0)');
        px.fillStyle = gr; px.fillRect(-rx, -rx, 2 * rx, rx); px.restore();
        lx.save(); lx.translate(c[0], V.yh + 3); lx.scale(1, ry / rx);
        const gl = lx.createRadialGradient(0, 0, 0, 0, 0, rx);
        gl.addColorStop(0, `rgba(255,130,110,${0.07 + 0.05 * (fx.hold ?? 0)})`); gl.addColorStop(1, 'rgba(255,120,140,0)');
        lx.fillStyle = gl; lx.fillRect(-rx, -rx, 2 * rx, rx); lx.restore();
    }

    // the city item by item (close-ups, and the reference the impostors are checked against)
    function cityDirect(V, T, fx, neonTo) {
        const px = S.px, lx = S.lx, k = S.k;
        const kick = fx.kick ?? 0, br = fx.breathe ?? 0;
        let top = V.yh;
        const draw = (it, front) => {
            const F = frameOf(it, V); if (!F) return;
            if (!visible(it, F, V)) return;
            if (br > 0 && it.kind === 'tower') { const b = br * 2.4 * (0.55 + 0.45 * Math.sin(T * 3.1 + it.ph)); F.c *= (1 + b); F.d *= (1 + b); }
            const sp = sprite(it, bucket(k * Math.hypot(F.a, F.b)));
            place(px, F); px.drawImage(sp.pic, sp.ox, -sp.oy, sp.mw, sp.mh);
            place(lx, F); lx.drawImage(sp.lit, sp.ox, -sp.oy, sp.mw, sp.mh);
            if (sp.neon) {
                const na = front ? 0.85 + 0.7 * kick : 1;
                place(neonTo.x, F); neonTo.x.globalAlpha = Math.min(1, na); neonTo.x.drawImage(sp.neon, sp.ox, -sp.oy, sp.mw, sp.mh); neonTo.x.globalAlpha = 1;
                if (!neonTo.sep) { place(px, F); px.globalAlpha = 0.6; px.drawImage(sp.neon, sp.ox, -sp.oy, sp.mw, sp.mh); px.globalAlpha = 1; }
            }
            top = Math.min(top, F.f + F.d * -it.v1);
            dynamic(it, F, V, T, fx);
        };
        for (const it of WORLD.back) draw(it, false);
        logical(px); logical(lx);
        haze(V, fx);
        for (const it of WORLD.front) draw(it, true);
        logical(px); logical(lx); if (neonTo.sep) logical(neonTo.x);
        return top;
    }

    // what changes on a building from frame to frame: windows on the beat, TVs, the crown,
    // aircraft lights, cars on the drive
    function dynamic(it, F, V, T, fx) {
        const px = S.px, lx = S.lx;
        const beat = Math.floor(Song.beatAt(T));
        if (it.kind === 'tower') {
            place(px, F); place(lx, F);
            const fog = it.fog, ww = it.cp * (it.type === 'glass' ? 0.78 : 0.56), wh = it.fp * (it.office ? 0.62 : 0.5);
            const minW = 0.75 / (S.k * Math.hypot(F.a, F.b));
            for (const L of it.live) {
                let on, a = 1;
                if (L.tv) { on = true; a = 0.45 + 0.35 * Math.sin(T * 9.7 + L.ph) * Math.sin(T * 4.3 + L.f); }
                else on = hash(it.id * 131 + L.f * 7 + L.c + Math.floor((beat + L.ph) / L.per) * 0.37) < 0.55;
                if (!on) continue;
                const x = (it.w - it.nc * it.cp) / 2 + L.c * it.cp + (it.cp - ww) / 2, y = -(2 + L.f * it.fp + it.fp * 0.3 + wh);
                const colr = L.tv ? '#8ab8ff' : L.col;
                px.fillStyle = css(mix(hex(colr), HAZE, fog * 0.7), a); px.fillRect(x, y, Math.max(ww, minW), Math.max(wh, minW));
                lx.fillStyle = css(hex(colr), a * (0.8 - fog * 0.5)); lx.fillRect(x, y, Math.max(ww, minW), Math.max(wh, minW));
            }
            if (it.liveBand) {
                const lb = it.liveBand, on = Math.floor((beat + lb.ph) / lb.per) % 2 === 0;
                if (on) {
                    const y = -(2 + lb.f * it.fp + it.fp * 0.3 + wh), colr = it.warm ? '#ffe0b0' : '#d8f4ff';
                    px.fillStyle = css(mix(hex(colr), HAZE, fog * 0.7), 0.85); px.fillRect(0.8, y, it.w - 1.6, Math.max(wh, minW));
                    lx.fillStyle = css(hex(colr), 0.75 - fog * 0.45); lx.fillRect(0.8, y, it.w - 1.6, Math.max(wh, minW));
                }
            }
            if (it.type === 'landmark' && it.tiers) {
                // the crown, floodlit in the bar's colour, its edges in tubes
                const C = crownColour(T, fx), barT = (T - Song.bar0) / (4 * Song.beat), flash = Math.exp(-fract(barT) * 8 * 4 * Song.beat);
                for (const [x, y, w, h] of it.tiers) {
                    for (const [ctx, a] of [[px, 0.85], [lx, 0.75 + 0.25 * flash]]) {
                        const gr = ctx.createLinearGradient(0, y + h, 0, y);
                        gr.addColorStop(0, css(mix(C, [255, 255, 255], 0.25 + 0.3 * flash), a)); gr.addColorStop(1, css(C, a * 0.25));
                        ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
                    }
                    tubeM(lx, S.k * Math.hypot(F.a, F.b), [[x - 0.3, y + h], [x + w + 0.3, y + h]], '#' + C.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join(''), 0.7);
                }
            }
            // aircraft warning lights: a slow red blink
            for (const [u, v] of it.beacons) {
                const b = Math.max(0, Math.sin(T * 2.4 + it.ph + v * 0.01)) ** 2;
                logical(lx); logical(px);
                const q = [F.e + F.a * u + F.c * -v, F.f + F.b * u + F.d * -v];
                const s = S.k * Math.hypot(F.a, F.b);
                px.fillStyle = rgba(P.red, 0.5 + 0.5 * b); px.fillRect(q[0] - 0.7, q[1] - 0.7, 1.4, 1.4);
                glow(lx, q[0], q[1], Math.max(3, 3.2 * s / S.k) * (0.7 + 0.5 * b), P.red, 0.35 + 0.65 * b);
                place(px, F); place(lx, F);
            }
        } else if (it.kind === 'block' && it.cars.length) {
            place(px, F); place(lx, F);
            const s = S.k * Math.hypot(F.a, F.b);
            for (const c of it.cars) {
                const u = ((c.u + c.dir * 14 * (T - 58)) % it.len + it.len) % it.len;
                const col = c.dir > 0 ? P.red : '#fff4e0';
                lx.fillStyle = css(hex(col), 0.9); lx.fillRect(u - 0.9, -1.0, Math.max(0.5, 1.2 / s), Math.max(0.5, 1.2 / s)); lx.fillRect(u + 0.9, -1.0, Math.max(0.5, 1.2 / s), Math.max(0.5, 1.2 / s));
            }
        }
    }

    // ---- the bay ----------------------------------------------------------------------------
    // The whole bay is built in two half-resolution canvases in unrolled pixels (W: the
    // picture, opaque; WL: its light) and laid on the frame once: the water's colour (the
    // sky's glow reflected near the far shore, deep indigo nearer), the city mirrored in the
    // first stretch, long vertical streaks under every light broken by the swell, the
    // sheen of the sky on the crests, the ship's reflection.

    // the band of picture and light above the shore (unrolled), to be mirrored
    function copyBand(yS, yTop) {
        const k = S.k, Y0 = Math.round(yS * k), Y1 = Math.round(Math.max(yTop, -S.m) * k), Hs = Y0 - Y1;
        S.bandH = Hs; S.bandY0 = Y0;
        if (Hs < 2) return;
        unrollBand(S.band, S.px.canvas, Y1, Hs);
        unrollBand(S.bandL, S.lx.canvas, Y1, Hs);
    }

    // the light above the water averaged down each column (with the ship's), then curved so
    // the bright columns stand out: the profile of the streaks
    function profile(yA, yB, box) {
        const k = S.k, Y1 = Math.round(Math.max(yA, -S.m) * k), Y0 = Math.round(yB * k);
        const h = Math.max(2, Y0 - Y1), w = S.prof.width;
        unrollBand(S.bandP, S.lx.canvas, Y1, h);
        if (box) { const x = S.bandP.getContext('2d'); x.globalCompositeOperation = 'lighter'; x.drawImage(S.shipL, 0, 0, box.w, box.h, box.x0 * k + S.M, box.y0 * k - Y1, box.w, box.h); x.globalCompositeOperation = 'source-over'; }
        let lvl = 0, src = S.bandP, sy = 0, sw = S.OW, sh = h;
        while (sh > 1) {
            const nh = Math.max(1, Math.ceil(sh / 2));
            if (!S.pyr[lvl]) S.pyr[lvl] = mkC(w, nh);
            const dst = S.pyr[lvl]; if (dst.height < nh) dst.height = nh;
            const dx = dst.getContext('2d');
            dx.setTransform(1, 0, 0, 1, 0, 0); dx.globalCompositeOperation = 'copy'; dx.imageSmoothingEnabled = true; dx.imageSmoothingQuality = 'medium';
            dx.drawImage(src, 0, sy, sw, sh, 0, 0, w, nh);
            src = dst; sy = 0; sw = w; sh = nh; lvl++;
        }
        const im = src.getContext('2d').getImageData(0, 0, w, 1), d = im.data;
        const gain = h / (11 * k);
        for (let i = 0; i < d.length; i += 4) {
            const a = d[i + 3] / 255, r = d[i] * a, g = d[i + 1] * a, b = d[i + 2] * a, mx = Math.max(r, g, b, 1);
            const I = Math.min(1, Math.pow(Math.min(1, mx / 255 * gain), 1.35) * 1.1);
            // push the colour away from grey so the streaks keep their neon
            const avg = (r + g + b) / 3, sat = 1.5;
            const R = clamp(avg + (r - avg) * sat, 0, mx), G = clamp(avg + (g - avg) * sat, 0, mx), B = clamp(avg + (b - avg) * sat, 0, mx);
            d[i] = R / mx * 255 * I; d[i + 1] = G / mx * 255 * I; d[i + 2] = B / mx * 255 * I; d[i + 3] = 255;
        }
        S.prof.getContext('2d').putImageData(im, 0, 0);
        // a blurred copy: the streaks widen nearer the viewer
        const pb = S.profB.getContext('2d');
        pb.setTransform(1, 0, 0, 1, 0, 0); pb.globalCompositeOperation = 'copy'; pb.globalAlpha = 1; pb.drawImage(S.prof, 0, 0);
        pb.globalCompositeOperation = 'lighter';
        for (const [dx, a] of [[-4, 0.3], [-2, 0.4], [2, 0.4], [4, 0.3], [-7, 0.12], [7, 0.12]]) { pb.globalAlpha = a; pb.drawImage(S.prof, dx, 0); }
        pb.globalAlpha = 1;
    }

    // the crests of the swell flow toward the camera: rows at depths d0·q^(j − Φ)
    const CREST = { d0: 6, q: 1.022 };
    const flowPhase = (V, T) => (V.pos[0] * V.Fh[0] + V.pos[2] * V.Fh[2]) / (100 * Math.log(CREST.q)) + (T - 58.9) * 0.9;

    function water(V, yS, T, fx, box) {
        const k = S.k, M = S.M, hw = S.W.width, hh = S.W.height, calm = fx.hold ?? 0;
        let Y0d = Math.round(yS * k); if ((Y0d + M) % 2) Y0d++;
        const Y0 = (Y0d + M) / 2, HH = Math.max(1, hh - Y0);                // the shore, in half pixels
        const w = S.W.getContext('2d'), wl = S.WL.getContext('2d'), st = S.streak.getContext('2d'), s2 = S.streak2.getContext('2d'), mk = S.mask.getContext('2d');
        for (const c of [w, wl, st, s2, mk]) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none'; c.clearRect(0, Y0 - 2, hw, hh - Y0 + 2); }
        const half = (c) => c.setTransform(k / 2, 0, 0, k / 2, M / 2, M / 2);       // logical → half px
        const yAt = (depth) => (M + V.rowAt(depth) * k) / 2;
        const at = (y) => clamp((y - Y0) / HH, 0.01, 0.99);
        // 1 · the water's colour
        half(w);
        const m = S.m, gr = w.createLinearGradient(0, yS, 0, V.H + m);
        const yOf = (depth) => clamp((V.rowAt(depth) - yS) / (V.H + m - yS), 0, 1);
        gr.addColorStop(0, '#5e2266'); gr.addColorStop(yOf(900), '#43195c'); gr.addColorStop(yOf(250), '#2a134d'); gr.addColorStop(yOf(70), '#1c0f3e'); gr.addColorStop(1, '#150c34');
        w.fillStyle = gr; w.fillRect(-m, yS, V.W + 2 * m, V.H + m - yS + 4);
        const c = V.dir(nrm([DOWNTOWN[0] - V.pos[0], 0, DOWNTOWN[2] - V.pos[2]]));
        if (c) {
            const rx = V.f * 0.8, ry = V.f * 0.2;
            w.save(); w.translate(c[0], yS); w.scale(1, ry / rx);
            const g2 = w.createRadialGradient(0, 0, 0, 0, 0, rx);
            g2.addColorStop(0, 'rgba(240,110,130,0.42)'); g2.addColorStop(0.3, 'rgba(200,60,130,0.24)'); g2.addColorStop(1, 'rgba(120,40,120,0)');
            w.fillStyle = g2; w.fillRect(-rx, 0, 2 * rx, rx); w.restore();
        }
        // 2 · the city mirrored, rows rippling sideways (calmer in the hold)
        const Hs = S.bandH, B0 = S.bandY0;
        if (Hs > 2) {
            const rows = 72, stretch = 1.35, amp = 3.4 * k * (1 - 0.75 * calm);
            for (const [ctx, band, al, op] of [[w, S.band, 0.6, 'source-over'], [wl, S.bandL, 0.4, 'lighter']]) {
                ctx.setTransform(0.5, 0, 0, 0.5, M / 2, M / 2); ctx.globalCompositeOperation = op;
                for (let i = 0; i < rows; i++) {
                    const a = i / rows, b = (i + 1) / rows;
                    const dy0 = B0 + Hs * stretch * a * a, dy1 = B0 + Hs * stretch * b * b;
                    const sy = Hs - Hs * b, sh = Math.max(1, Hs * (b - a));
                    const wob = Math.sin(i * 1.7 + T * 2.3) * amp * (0.3 + a * 2) + Math.sin(i * 0.37 - T * 1.1) * amp * 0.6;
                    ctx.globalAlpha = al * (1 - a) ** 1.3;
                    ctx.drawImage(band, 0, Math.max(0, sy), S.OW, sh, wob - M, dy0, S.OW, Math.max(1, dy1 - dy0) + 1);
                }
                ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
            }
        }
        // 3 · the streaks: the profile drawn down the water, sharp under the shore, wider nearer
        st.drawImage(S.prof, 0, 0, hw, 1, 0, Y0, hw, HH);
        if (WORLD.moonAt) {
            const mx = (M + WORLD.moonAt[0] * k) / 2, mw = WORLD.moonR * k * 0.8;
            const gm = st.createLinearGradient(mx - mw, 0, mx + mw, 0); gm.addColorStop(0, 'rgba(220,200,255,0)'); gm.addColorStop(0.5, 'rgba(240,225,255,0.55)'); gm.addColorStop(1, 'rgba(220,200,255,0)');
            st.globalCompositeOperation = 'lighter'; st.fillStyle = gm; st.fillRect(mx - mw, Y0, 2 * mw, HH); st.globalCompositeOperation = 'source-over';
        }
        st.globalCompositeOperation = 'destination-in';
        let g = st.createLinearGradient(0, Y0, 0, hh); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(at(yAt(300)), 'rgba(0,0,0,0.75)'); g.addColorStop(at(yAt(60)), 'rgba(0,0,0,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
        st.fillStyle = g; st.fillRect(0, Y0, hw, HH);
        s2.drawImage(S.profB, 0, 0, hw, 1, 0, Y0, hw, HH);
        s2.globalCompositeOperation = 'destination-in';
        g = s2.createLinearGradient(0, Y0, 0, hh); g.addColorStop(0, 'rgba(0,0,0,0.3)'); g.addColorStop(at(yAt(250)), 'rgba(0,0,0,0.8)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
        s2.fillStyle = g; s2.fillRect(0, Y0, hw, HH);
        for (const [ctx, a] of [[w, 0.22], [wl, 0.06]]) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.drawImage(S.streak2, 0, Y0, hw, HH, 0, Y0, hw, HH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
        st.globalCompositeOperation = 'lighter'; st.globalAlpha = 0.6; st.drawImage(S.streak2, 0, 0); st.globalAlpha = 1;
        // the swell: rows of crests, each broken into dashes (glassier in the hold)
        const f = V.f, yaw = V.yaw, { d0, q } = CREST;
        const Phi = flowPhase(V, T), jF = Math.floor(Phi);
        mk.fillStyle = '#fff';
        const jMax = Math.ceil(Math.log(2400 / d0) / Math.log(q) + Phi);
        for (let j = jMax; j >= jF - 1; j--) {
            const depth = d0 * q ** (j - Phi);
            if (depth < 3) break;
            const y = yAt(depth); if (y < Y0) continue; if (y > hh + 2) break;
            const yn = yAt(depth / q), th = Math.max(0.5, (yn - y) * (0.4 + 0.2 * hash(j * 3.1)) * (1 - calm * 0.3));
            const R = Motion.rng('crest' + j);
            const lw = 2.2 + R() * 3.5, gw = (2 + R() * 7) * (1 - calm * 0.7);
            const Lp = f * lw / depth / 2, G = f * gw / depth / 2;            // half pixels
            const flick = 0.55 + 0.45 * Math.sin(T * (1.3 + R() * 2) + j);
            if (Lp + G < 2.4) { mk.globalAlpha = 0.4 + 0.3 * flick; mk.fillRect(0, y, hw, th); continue; }
            const per = Lp + G, drift = (R() - 0.5) * 8 * (T - 58) * (1 - calm * 0.8) / depth * f / 2;
            const off = ((R() * per + drift + yaw * f / 2) % per + per) % per;
            let i = 0;
            for (let x = -off - per; x < hw + per; x += per, i++) {
                const len = Lp * (0.55 + 0.9 * hash(j * 17.3 + i * 3.7)), a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(T * (2 + hash(i + j) * 3) + i * 1.3 + j));
                mk.globalAlpha = a * (0.7 + 0.3 * flick); mk.fillRect(x + G * hash(i * 7.7 + j), y, len, th);
            }
        }
        mk.globalAlpha = 1;
        st.globalCompositeOperation = 'destination-in'; st.drawImage(S.mask, 0, 0); st.globalCompositeOperation = 'source-over';
        const pulse = 1 + 0.5 * (fx.kick ?? 0) * (fx.trip ?? 0);
        for (const [ctx, a] of [[w, 1.0 * pulse], [wl, 0.5 * pulse]]) {
            ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
            for (let r = a; r > 0.01; r -= 1) { ctx.globalAlpha = Math.min(1, r); ctx.drawImage(S.streak, 0, Y0, hw, HH, 0, Y0, hw, HH); }
            ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        }
        // 4 · the sheen of the sky on the crests, everywhere on the bay
        half(w); swell(w, V, yS, T, fx);
        // 5 · the ship's reflection, rows mirrored under its waterline
        if (box) {
            const X = box.x0 * k, Yb = box.y0 * k, WLp = box.wl * k, Hb = WLp - Yb, rows = 34, cl = 1 - 0.75 * calm;
            for (const [ctx, src, al, op] of [[w, S.ship, 0.6, 'source-over'], [wl, S.shipL, 0.55, 'lighter']]) {
                ctx.setTransform(0.5, 0, 0, 0.5, M / 2, M / 2); ctx.globalCompositeOperation = op;
                for (let i = 0; i < rows; i++) {
                    const a = i / rows, b = (i + 1) / rows, dy0 = WLp + Hb * 1.4 * a, dy1 = WLp + Hb * 1.4 * b;
                    const sy = Hb - Hb * b, wob = (Math.sin(i * 1.9 + T * 2.6) * 2.2 + Math.sin(i * 0.6 - T * 1.3) * 1.4) * k * cl * (0.4 + a);
                    ctx.globalAlpha = al * (1 - a) ** 1.4;
                    ctx.drawImage(src, 0, Math.max(0, sy), box.w, Math.max(1, Hb * (b - a)), X + wob, dy0, box.w, Math.max(1, dy1 - dy0) + 1);
                }
                ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
            }
        }
        // 6 · onto the frame
        for (const [ctx, src, op] of [[S.px, S.W, 'source-over'], [S.lx, S.WL, 'lighter']]) {
            ctx.save(); devR(ctx); ctx.globalCompositeOperation = op; ctx.globalAlpha = 1;
            ctx.drawImage(src, 0, Y0, hw, HH, -M, Y0 * 2 - M, hw * 2, HH * 2);
            ctx.restore();
        }
    }

    // the sheen of the sky on the crests: short coloured strokes (logical units on ctx)
    function swell(ctx, V, yS, T, fx) {
        const calm = fx.hold ?? 0, f = V.f, Phi = flowPhase(V, T) * Math.log(CREST.q), mn = 2 / S.k;
        for (let i = 0; i < 220; i++) {
            const R = Motion.rng('sw' + i);
            const depth = 12 * Math.pow(160, fract(R() - Phi / Math.log(160)));
            const y = V.rowAt(depth); if (y < yS + 1 || y > V.H + S.m) continue;
            const n = 3 + Math.floor(R() * 4);
            const col = depth > 500 ? ['#ff9ac0', '#ffb08a', '#e070b0'] : depth > 120 ? ['#c070d0', '#ff7ab8', '#8a7aff'] : ['#7a8aff', '#b070e0', '#4ad8ff'];
            for (let j = 0; j < n; j++) {
                const ang = (R() - 0.5) * 2.8, x = V.cx + f * Math.tan(clamp(ang - V.yaw, -1.4, 1.4)) + Math.sin(T * 0.7 + i + j) * 2;
                const len = f * (2 + R() * 7) / depth * (1 + calm), th = Math.max(mn * 0.5, f * 0.12 / depth);
                ctx.fillStyle = rgba(col[j % 3], (0.12 + 0.2 * R()) * (1 - calm * 0.5));
                ctx.fillRect(x, y + Math.sin(T * 1.3 + i * 2.1 + j) * th, len, th);
            }
        }
    }

    // ---- the port ---------------------------------------------------------------------------
    const SHIP = { x0: 255, x1: 540, z0: 1168, z1: 1150 };   // stern and bow
    function shipPt(u, y, d = 0) {   // u: 0 stern → 1 bow; y over the water; d: inboard (m)
        const x = SHIP.x0 + (SHIP.x1 - SHIP.x0) * u, z = SHIP.z0 + (SHIP.z1 - SHIP.z0) * u + d;
        return [x, WL + y, z];
    }
    // paint the ship (picture and light) with project function pr; returns nothing
    function paintShip(pc, lc, pr, s, T, fx) {
        const L = SHIP.x1 - SHIP.x0;
        const poly = (ctx, pts) => { ctx.beginPath(); pts.forEach((p, i) => { const q = pr(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); };
        const lineU = (ctx, u0, u1, y, d = 0) => { const a = pr(shipPt(u0, y, d)), b = pr(shipPt(u1, y, d)); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); };
        // the hull: a raked bow, a rounded cruiser stern, the sheer rising to the bow
        const hull = [shipPt(0.015, 0), shipPt(0.955, 0), shipPt(1.0, 15.5), shipPt(0.99, 16), shipPt(0.5, 14), shipPt(0.0, 14.2), shipPt(-0.01, 9)];
        poly(pc, hull);
        const a0 = pr(shipPt(0.5, 16)), a1 = pr(shipPt(0.5, 0));
        let gr = pc.createLinearGradient(0, a0[1], 0, a1[1]);
        gr.addColorStop(0, '#e8e2f6'); gr.addColorStop(0.55, '#b8acd8'); gr.addColorStop(0.8, '#7a6aa8'); gr.addColorStop(0.81, '#263064'); gr.addColorStop(1, '#1a1a48');
        pc.fillStyle = gr; pc.fill();
        // the hull's sheen: the city's glow on the white plates, warm toward the bow
        const b0 = pr(shipPt(0, 8)), b1 = pr(shipPt(1, 8));
        gr = pc.createLinearGradient(b0[0], 0, b1[0], 0); gr.addColorStop(0, 'rgba(120,180,255,0.12)'); gr.addColorStop(0.7, 'rgba(255,150,200,0)'); gr.addColorStop(1, 'rgba(255,150,170,0.25)');
        pc.fillStyle = gr; poly(pc, hull); pc.fill();
        // portholes: two rows of warm dots
        for (const [y, n] of [[8.4, 70], [10.8, 76]]) for (let i = 0; i < n; i++) {
            const u = 0.06 + 0.86 * (i + 0.5) / n; if (hash(i * 3.3 + y) < 0.35) continue;
            const q = pr(shipPt(u, y));
            const c = hash(i + y * 9) < 0.85 ? '#ffd9a0' : '#bfe8ff';
            pc.fillStyle = c; pc.fillRect(q[0] - 0.5 * s, q[1] - 0.45 * s, Math.max(0.8, 0.9 * s), Math.max(0.7, 0.8 * s));
            lc.fillStyle = rgba(c, 0.75); lc.fillRect(q[0] - 0.5 * s, q[1] - 0.45 * s, Math.max(0.8, 0.9 * s), Math.max(0.7, 0.8 * s));
        }
        // the superstructure: decks stepping back fore and aft, each a band of cabins
        const decks = 8;
        for (let dk = 0; dk < decks; dk++) {
            const y0 = 14 + dk * 3.0, y1 = y0 + 3.0;
            const ua = 0.06 + dk * 0.012 + (dk > 5 ? (dk - 5) * 0.05 : 0), ub = 0.86 - dk * 0.03 - (dk > 4 ? (dk - 4) * 0.035 : 0);
            const q = [shipPt(ua, y0, 2), shipPt(ub, y0, 2), shipPt(ub - 0.006, y1, 2), shipPt(ua + 0.004, y1, 2)];
            poly(pc, q);
            const t0 = pr(shipPt(0.5, y1)), t1 = pr(shipPt(0.5, y0));
            gr = pc.createLinearGradient(0, t0[1], 0, t1[1]); gr.addColorStop(0, dk % 2 ? '#f2eefc' : '#dcd4f0'); gr.addColorStop(1, '#a89cc8');
            pc.fillStyle = gr; pc.fill();
            // the balcony shadow line, then the lit windows
            pc.strokeStyle = 'rgba(40,30,80,0.55)'; pc.lineWidth = Math.max(0.5, 0.7 * s); lineU(pc, ua, ub, y0 + 0.9, 2); pc.stroke();
            const n = Math.floor((ub - ua) * L / 3.2);
            for (let i = 0; i < n; i++) {
                const u = ua + (ub - ua) * (i + 0.5) / n, hv = hash(i * 1.7 + dk * 31);
                if (hv < 0.3) continue;
                const qq = pr(shipPt(u, y0 + 1.5, 2));
                const c = hv > 0.93 ? P.cyan : hv > 0.87 ? '#ffb0d8' : WARM[Math.floor(hv * 50) % 5];
                pc.fillStyle = c; pc.fillRect(qq[0] - 0.9 * s, qq[1] - 0.5 * s, Math.max(0.8, 1.8 * s), Math.max(0.6, 1.0 * s));
                lc.fillStyle = rgba(c, 0.8); lc.fillRect(qq[0] - 0.9 * s, qq[1] - 0.5 * s, Math.max(0.8, 1.8 * s), Math.max(0.6, 1.0 * s));
            }
            // the bridge: a dark band of windows across the front of the top decks
            if (dk === 6) { pc.fillStyle = '#20204a'; poly(pc, [shipPt(ub - 0.05, y0 + 0.8, 2), shipPt(ub - 0.006, y0 + 0.8, 2), shipPt(ub - 0.006, y0 + 2.2, 2), shipPt(ub - 0.05, y0 + 2.2, 2)]); pc.fill(); }
        }
        // lifeboats: orange, in a row under their davits
        for (let i = 0; i < 12; i++) {
            const u = 0.2 + i * 0.045, q0 = pr(shipPt(u, 17.2, -1)), q1 = pr(shipPt(u + 0.034, 19.2, -1));
            pc.fillStyle = '#ff8a3d'; pc.beginPath(); pc.roundRect(q0[0], q1[1], q1[0] - q0[0], q0[1] - q1[1], 1.2 * s); pc.fill();
            pc.fillStyle = 'rgba(255,240,200,0.6)'; pc.fillRect(q0[0], q1[1], q1[0] - q0[0], Math.max(0.5, 0.5 * s));
        }
        // the funnel: raked, banded in the film's colours (no emblem), floodlit
        const fq = [shipPt(0.26, 38, 6), shipPt(0.36, 38, 6), shipPt(0.345, 52, 6), shipPt(0.285, 52, 6)];
        poly(pc, fq);
        const f0 = pr(fq[3]), f1 = pr(fq[0]);
        gr = pc.createLinearGradient(0, f0[1], 0, f1[1]); gr.addColorStop(0, '#2a1840'); gr.addColorStop(0.12, '#2a1840'); gr.addColorStop(0.13, '#ff3fa4'); gr.addColorStop(0.3, '#ff3fa4'); gr.addColorStop(0.31, '#f4f0ff'); gr.addColorStop(0.42, '#f4f0ff'); gr.addColorStop(0.43, '#2ec8d8'); gr.addColorStop(0.55, '#2ec8d8'); gr.addColorStop(0.56, '#f4f0ff'); gr.addColorStop(1, '#d8d0f0');
        pc.fillStyle = gr; pc.fill();
        lc.save(); poly(lc, fq); lc.clip(); lc.fillStyle = 'rgba(255,90,170,0.35)'; lc.fillRect(f0[0] - 50, f0[1], 100, (f1[1] - f0[1]) * 0.35); lc.restore();
        // the pool deck aft: a cyan glow and pink tubes
        const pool = pr(shipPt(0.17, 38.5, 4));
        glow(lc, pool[0], pool[1], Math.max(3, 6 * s), P.cyan, 0.6);
        pc.fillStyle = '#7ef6ff'; pc.fillRect(pool[0] - 4 * s, pool[1] - 0.5 * s, 8 * s, Math.max(0.6, s));
        tubeM(lc, 1, [pr(shipPt(0.12, 39.5, 2)), pr(shipPt(0.24, 39.5, 2))].map((q) => [q[0], q[1]]), P.pink, 0.5 * s, false, 0.9);
        // the mast over the bridge, its lights
        const m0 = pr(shipPt(0.7, 38, 6)), m1 = pr(shipPt(0.7, 50, 6));
        pc.strokeStyle = '#3a3060'; pc.lineWidth = Math.max(0.6, 0.7 * s); pc.beginPath(); pc.moveTo(m0[0], m0[1]); pc.lineTo(m1[0], m1[1]); pc.stroke();
        glow(lc, m1[0], m1[1], Math.max(2.5, 2.4 * s), '#fff6e8', 0.9);
        // dressing lights: strings of bulbs from bow to mast to funnel to stern
        const bow = shipPt(1.0, 16), stern = shipPt(-0.005, 15), mast = shipPt(0.7, 50, 6), fun = shipPt(0.32, 52, 6);
        const strings = [[bow, mast], [mast, fun], [fun, stern]];
        let bi = 0;
        for (const [A, B] of strings) for (let i = 0; i <= 22; i++, bi++) {
            const u = i / 22, Q = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u - Math.sin(u * Math.PI) * 2.5, A[2] + (B[2] - A[2]) * u];
            const q = pr(Q), c = [P.yellow, P.pink, P.cyan, '#ffffff'][bi % 4];
            const tw = 0.7 + 0.3 * Math.sin(T * 5 + bi);
            pc.fillStyle = c; pc.fillRect(q[0] - 0.4, q[1] - 0.4, Math.max(0.8, 0.5 * s), Math.max(0.8, 0.5 * s));
            lc.globalAlpha = tw; lc.drawImage(glowSprite(c), q[0] - Math.max(1.5, 1.2 * s), q[1] - Math.max(1.5, 1.2 * s), 2 * Math.max(1.5, 1.2 * s), 2 * Math.max(1.5, 1.2 * s)); lc.globalAlpha = 1;
        }
        // running lights
        const sb = pr(shipPt(0.82, 37, -1));
        glow(lc, sb[0], sb[1], Math.max(2, 2 * s), '#4aff8a', 0.9);
    }

    // cranes, containers, light masts and the quay of the port, behind the ship
    function port(V, T, fx) {
        const px = S.px, lx = S.lx;
        const P3 = (x, y, z) => V.p([x, WL + y, z]);
        // the quay: a lit edge on the water
        const q0 = P3(150, 2, 1230), q1 = P3(1500, 2, 1340);
        if (q0[2] < 50) return;
        px.fillStyle = '#2a1c3c'; px.beginPath(); px.moveTo(q0[0], q0[1] - 1); px.lineTo(q1[0], q1[1] - 1); px.lineTo(q1[0], q1[1] + 2); px.lineTo(q0[0], q0[1] + 2); px.fill();
        for (let i = 0; i <= 40; i++) { const u = i / 40, x = 150 + 1350 * u, z = 1230 + 110 * u, q = P3(x, 2.2, z); lx.fillStyle = rgba(P.sodium, 0.8); lx.fillRect(q[0] - 0.6, q[1] - 0.6, 1.2, 1.2); }
        // container stacks: muted colours under sodium floodlights
        const R = Motion.rng('boxes');
        for (let i = 0; i < 70; i++) {
            const x = 640 + R() * 820, z = 1300 + R() * 140, h = 2.6 * (1 + Math.floor(R() * 4)), w = 12 + R() * 14;
            const a = P3(x, 2, z), b = P3(x + w, 2 + h, z); if (a[2] < 50) continue;
            const c = ['#7a2a3a', '#2a4a6a', '#3a6a6a', '#8a5a2a', '#5a2a5a', '#6a6a7a'][Math.floor(R() * 6)];
            px.fillStyle = c; px.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
            px.fillStyle = 'rgba(255,180,110,0.25)'; px.fillRect(a[0], b[1], b[0] - a[0], Math.max(0.5, (a[1] - b[1]) * 0.25));
        }
        // light masts: clusters of sodium lamps on tall poles
        for (const [x, z] of [[700, 1320], [900, 1360], [1100, 1380], [1300, 1400], [520, 1300]]) {
            const a = P3(x, 2, z), b = P3(x, 34, z); if (a[2] < 50) continue;
            const s = V.f / a[2];
            px.strokeStyle = '#2a2040'; px.lineWidth = Math.max(0.6, 0.8 * s); px.beginPath(); px.moveTo(a[0], a[1]); px.lineTo(b[0], b[1]); px.stroke();
            for (const dx of [-1.6, 0, 1.6]) glow(lx, b[0] + dx * s, b[1], Math.max(2.5, 3 * s), P.sodium, 0.85);
            px.fillStyle = '#ffe0b0'; px.fillRect(b[0] - 2 * s, b[1] - 0.5, 4 * s, Math.max(1, 0.8 * s));
        }
        // gantry cranes: a portal on four legs, a boom out over the water, a machinery house
        for (const [x, z, up] of [[700, 1290, 0], [830, 1300, 1], [960, 1310, 0], [1090, 1320, 0]]) {
            const leg = 48, span = 26, a = P3(x, 2, z), s = V.f / Math.max(1, a[2]);
            if (a[2] < 50) continue;
            px.strokeStyle = '#3a2a58'; px.lineCap = 'butt';
            const L2 = (pts, w) => { px.lineWidth = Math.max(0.7, w * s); px.beginPath(); pts.forEach((p, i) => { const q = P3(...p); i ? px.lineTo(q[0], q[1]) : px.moveTo(q[0], q[1]); }); px.stroke(); };
            L2([[x, 2, z], [x, leg, z]], 1.6); L2([[x + span, 2, z], [x + span, leg, z]], 1.6);
            L2([[x, leg * 0.45, z], [x + span, leg * 0.45, z]], 1.0);
            L2([[x - 4, leg, z], [x + span + 4, leg, z]], 1.6);
            L2([[x, 2, z], [x + span, leg * 0.45, z]], 0.5); L2([[x + span, 2, z], [x, leg * 0.45, z]], 0.5);
            // the boom: out toward the water, or raised
            if (up) { L2([[x + span * 0.5, leg, z], [x + span * 0.5 + 8, leg + 46, z - 30]], 1.4); L2([[x + span * 0.5, leg + 16, z], [x + span * 0.5 + 8, leg + 46, z - 30]], 0.5); }
            else { L2([[x + span * 0.5, leg + 1, z + 30], [x + span * 0.5, leg + 1, z - 55]], 1.4); L2([[x + span * 0.5, leg + 14, z], [x + span * 0.5, leg + 1, z - 55]], 0.4); L2([[x + span * 0.5, leg + 14, z], [x + span * 0.5, leg + 1, z + 30]], 0.4); }
            const mh = P3(x + span * 0.3, leg + 6, z), mh1 = P3(x + span * 0.75, leg + 1, z);
            px.fillStyle = '#4a3a6a'; px.fillRect(mh[0], mh[1], mh1[0] - mh[0], mh1[1] - mh[1]);
            // the red lights on top, white work lights under the boom
            const top = up ? P3(x + span * 0.5 + 8, leg + 46, z - 30) : P3(x + span * 0.5, leg + 15, z);
            const b = 0.5 + 0.5 * Math.sin(T * 2.1 + x);
            glow(lx, top[0], top[1], Math.max(2.5, 3 * s) * (0.8 + 0.4 * b), P.red, 0.5 + 0.5 * b);
            px.fillStyle = P.red; px.fillRect(top[0] - 0.6, top[1] - 0.6, 1.2, 1.2);
            for (const zz of up ? [z] : [z - 20, z - 45]) { const w0 = P3(x + span * 0.5, leg, zz); glow(lx, w0[0], w0[1], Math.max(2, 2 * s), '#fff2dc', 0.8); }
        }
    }

    // the ship: painted into its own canvases, laid on the bay, mirrored under its waterline
    function shipBox(V) {
        const pts = [shipPt(-0.02, 0), shipPt(1.02, 0), shipPt(1.02, 56, 6), shipPt(-0.02, 56, 6)].map(V.p);
        if (pts.some((q) => q[2] < 50)) return null;
        const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
        const k = S.k, snap = (v) => Math.floor(v * k) / k;
        const x0 = snap(Math.min(...xs) - 6), x1 = Math.max(...xs) + 6, y0 = snap(Math.min(...ys) - 6), y1 = Math.max(...ys) + 2;
        if (x1 < -S.m || x0 > V.W + S.m) return null;
        const wl = V.p(shipPt(0.5, 0))[1];
        return { x0, y0, x1, y1, wl };
    }
    function ship(V, T, fx) {
        const box = shipBox(V); if (!box) return null;
        const k = S.k, w = Math.ceil((box.x1 - box.x0) * k), h = Math.ceil((box.y1 - box.y0) * k);
        if (S.ship.width < w || S.ship.height < h) { for (const c of [S.ship, S.shipL]) { c.width = Math.max(c.width, w); c.height = Math.max(c.height, h); } }
        const sc = S.ship.getContext('2d'), sl = S.shipL.getContext('2d');
        for (const c of [sc, sl]) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, S.ship.width, S.ship.height); c.setTransform(k, 0, 0, k, -box.x0 * k, -box.y0 * k); }
        sl.globalCompositeOperation = 'lighter';
        const s = V.f / V.p(shipPt(0.5, 0))[2];
        paintShip(sc, sl, V.p, s, T, fx);
        box.w = w; box.h = h;
        return box;
    }
    function layShip(box) {
        const k = S.k, X = box.x0 * k, Y = box.y0 * k;
        for (const [ctx, src, op] of [[S.px, S.ship, 'source-over'], [S.lx, S.ship, 'destination-out'], [S.lx, S.shipL, 'lighter']]) {
            ctx.save(); devR(ctx); ctx.globalCompositeOperation = op; ctx.drawImage(src, 0, 0, box.w, box.h, X, Y, box.w, box.h); ctx.restore();
        }
    }

    // small boats on the bay: hulls, cabins, running lights, wakes, their reflections
    const BOATS = [
        { x: 60, z: 430, v: 15, kind: 'speed' }, { x: -260, z: 720, v: 3, kind: 'sail' }, { x: 120, z: 900, v: 2.5, kind: 'party' },
        { x: -520, z: 1350, v: 4, kind: 'tour' }, { x: -1250, z: 1550, v: -2, kind: 'fish' }, { x: -70, z: 1050, v: -18, kind: 'speed' },
        { x: 1500, z: 1250, v: -3, kind: 'tour' }, { x: 260, z: 640, v: 6, kind: 'sail' },
    ];
    function boats(V, T, fx) {
        const px = S.px, lx = S.lx, t = T - 58.9, calm = fx.hold ?? 0;
        for (const b of BOATS) {
            const x = b.x + b.v * t, z = b.z, dir = Math.sign(b.v) || 1;
            if (Math.abs(x) < 40 && z < 1900) continue;                   // never on the causeway
            const c = V.p([x, WL, z]); if (c[2] < 30) continue;
            const s = V.f / c[2];
            if (c[0] < -60 || c[0] > V.W + 60 || c[1] < V.yh) continue;
            const len = b.kind === 'tour' ? 28 : b.kind === 'party' ? 22 : b.kind === 'speed' ? 9 : b.kind === 'fish' ? 14 : 11;
            const bow = V.p([x + dir * len / 2, WL, z]), stern = V.p([x - dir * len / 2, WL, z]);
            // the wake: two arms spreading behind, and the churned trail
            const sp = Math.abs(b.v), wl = Math.min(260, sp * 9) * (1 - calm * 0.3);
            if (sp > 1.5) {
                for (const side of [-1, 1]) {
                    px.strokeStyle = `rgba(230,210,255,${0.22 + 0.12 * Math.min(1, sp / 10)})`; px.lineWidth = Math.max(0.6, 0.25 * s);
                    px.beginPath();
                    for (let i = 0; i <= 16; i++) { const u = i / 16, wx = x - dir * (len / 2 + u * wl), wz = z + side * u * wl * 0.35, q = V.p([wx, WL, wz]); i ? px.lineTo(q[0], q[1] + Math.sin(i + T * 3) * 0.3 * s) : px.moveTo(q[0], q[1]); }
                    px.stroke();
                }
                const t0 = V.p([x - dir * len / 2, WL, z]), t1 = V.p([x - dir * (len / 2 + wl * 0.6), WL, z]);
                const gr = px.createLinearGradient(t0[0], 0, t1[0], 0); gr.addColorStop(0, 'rgba(240,230,255,0.45)'); gr.addColorStop(1, 'rgba(240,230,255,0)');
                px.fillStyle = gr; px.fillRect(Math.min(t0[0], t1[0]), t0[1] - Math.max(0.6, 0.5 * s), Math.abs(t1[0] - t0[0]), Math.max(1.2, 1.0 * s));
            }
            // the hull and cabin
            const hh = (b.kind === 'tour' ? 3 : 1.6) * s, ch = (b.kind === 'tour' ? 3 : b.kind === 'party' ? 3.2 : 1.6) * s;
            px.fillStyle = b.kind === 'fish' ? '#3a3050' : '#e6e0f6';
            px.beginPath(); px.moveTo(stern[0], stern[1] - hh); px.lineTo(bow[0] + dir * 0.6 * s, bow[1] - hh * 1.15); px.lineTo(bow[0] - dir * 1.5 * s, bow[1]); px.lineTo(stern[0], stern[1]); px.fill();
            px.fillStyle = 'rgba(40,30,90,0.5)'; px.fillRect(Math.min(stern[0], bow[0]), c[1] - hh * 0.35, Math.abs(bow[0] - stern[0]), Math.max(0.5, hh * 0.18));
            const cab0 = V.p([x - dir * len * 0.3, WL, z]), cab1 = V.p([x + dir * len * 0.15, WL, z]);
            px.fillStyle = '#cfc6ea'; px.fillRect(Math.min(cab0[0], cab1[0]), c[1] - hh - ch, Math.abs(cab1[0] - cab0[0]), ch);
            if (b.kind === 'tour' || b.kind === 'party') {
                const n = b.kind === 'tour' ? 9 : 6;
                for (let i = 0; i < n; i++) { const qx = Math.min(cab0[0], cab1[0]) + (i + 0.3) / n * Math.abs(cab1[0] - cab0[0]); px.fillStyle = '#ffd9a0'; px.fillRect(qx, c[1] - hh - ch * 0.75, Math.max(0.8, 1.2 * s), Math.max(0.6, 0.9 * s)); lx.fillStyle = rgba('#ffcf8a', 0.8); lx.fillRect(qx, c[1] - hh - ch * 0.75, Math.max(0.8, 1.2 * s), Math.max(0.6, 0.9 * s)); }
            }
            if (b.kind === 'party') {
                // strings of pink and cyan bulbs over the deck, a glow on the water
                const top = c[1] - hh - ch - 4 * s;
                for (let i = 0; i <= 14; i++) { const u = i / 14, qx = stern[0] + (bow[0] - stern[0]) * u, qy = top + Math.sin(u * Math.PI) * 2.5 * s + (1 - Math.sin(u * Math.PI)) * 3 * s; const col = [P.pink, P.cyan, P.violet][i % 3]; glow(lx, qx, qy, Math.max(1.8, 0.9 * s), col, 0.6 + 0.4 * Math.sin(T * 6 + i)); }
                glow(lx, c[0], c[1] + 1, Math.max(6, 6 * s), P.pink, 0.25);
            }
            if (b.kind === 'sail') {
                const m0 = V.p([x, WL + 1.6, z]), m1 = V.p([x, WL + 13, z]);
                px.strokeStyle = '#c8c0e0'; px.lineWidth = Math.max(0.5, 0.15 * s); px.beginPath(); px.moveTo(m0[0], m0[1]); px.lineTo(m1[0], m1[1]); px.stroke();
                glow(lx, m1[0], m1[1], Math.max(2, 1.2 * s), '#f0f6ff', 0.9);
            }
            if (b.kind === 'fish') { const w0 = V.p([x, WL + 5, z]); glow(lx, w0[0], w0[1], Math.max(3, 2.5 * s), '#e8f4ff', 0.9); }
            // running lights: white at the masthead or stern, red/green at the bow
            const ml = V.p([x - dir * len * 0.1, WL + (b.kind === 'tour' ? 9 : 4.2), z]), bl = V.p([x + dir * len * 0.42, WL + 1.8, z]);
            glow(lx, ml[0], ml[1], Math.max(2, 1.2 * s), '#fff6e8', 0.9);
            glow(lx, bl[0], bl[1], Math.max(1.8, 1.0 * s), dir > 0 ? '#4aff8a' : P.red, 0.9);
            // the reflection of its lights: short broken streaks under it
            for (const [q, colr] of [[ml, '#fff0d8'], [bl, dir > 0 ? '#4aff8a' : '#ff4a5a']]) {
                const ln = Math.min(140, (q[1] < c[1] ? (c[1] - q[1]) * 3.2 : 6) + 10);
                for (let i = 0; i < 7; i++) { const u = (i + 0.5) / 7, yy = c[1] + ln * u, wob = Math.sin(i * 2.1 + T * 4 + x) * 1.2 * Math.max(1, s * 0.3) * (1 - calm); lx.fillStyle = rgba(colr, 0.45 * (1 - u)); lx.fillRect(q[0] + wob - Math.max(0.8, 0.4 * s), yy, Math.max(1.6, 0.8 * s), Math.max(0.8, ln / 14)); }
            }
        }
    }

    // two searchlights sweeping from downtown
    function searchlights(V, T, fx) {
        const px = S.px, lx = S.lx, ht = T - 58.9 - 1.6 * (fx.holdT ?? 0);
        for (const b of WORLD.beams) {
            const az = b.az + b.amp * Math.sin(ht * b.w + b.ph), el = 1.02 + 0.12 * Math.sin(ht * b.w * 0.7 + b.ph * 2);
            const D = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
            const O = [b.x, b.y, b.z], E = [b.x + D[0] * 3200, b.y + D[1] * 3200, b.z + D[2] * 3200];
            const o = V.p(O), e = V.p(E); if (o[2] < 50 || e[2] < 50) continue;
            const w0 = V.f * 2.5 / o[2], w1 = V.f * 90 / e[2];
            const dx = e[0] - o[0], dy = e[1] - o[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
            const col = fx.hue ? css(Neon.shift(b.col, fx.hue * 1.5)) : null;
            const C = col ? Neon.shift(b.col, fx.hue * 1.5) : hex(b.col);
            const amp = 1 + 0.6 * (fx.kick ?? 0) * (fx.trip ?? 0);
            for (const [ctx, a, wm] of [[px, 0.10, 2.6], [px, 0.16, 1], [lx, 0.10, 1]]) {
                const gr = ctx.createLinearGradient(o[0], o[1], e[0], e[1]);
                gr.addColorStop(0, css(C, a * amp)); gr.addColorStop(0.35, css(C, a * 0.55 * amp)); gr.addColorStop(1, css(C, 0));
                ctx.fillStyle = gr; ctx.globalCompositeOperation = 'lighter';
                ctx.beginPath(); ctx.moveTo(o[0] + nx * w0 * wm, o[1] + ny * w0 * wm); ctx.lineTo(e[0] + nx * w1 * wm, e[1] + ny * w1 * wm); ctx.lineTo(e[0] - nx * w1 * wm, e[1] - ny * w1 * wm); ctx.lineTo(o[0] - nx * w0 * wm, o[1] - ny * w0 * wm); ctx.closePath(); ctx.fill();
                ctx.globalCompositeOperation = ctx === lx ? 'lighter' : 'source-over';
            }
            glow(lx, o[0], o[1], Math.max(3, 4 * V.f / o[2]), '#f0e8ff', 0.9);
        }
    }

    // ======================================================================================
    // world(): everything beyond the causeway onto g (picture) and L (light)
    // fx: { hold, trip, kick, hue, breathe, halo, star }. Returns { horizon } (screen y at
    // the frame's centre column).
    // ======================================================================================
    function world(g, L, N, cam, T, fx, env) {
        WL = Causeway.WATER;
        if (!WORLD) WORLD = build();
        surfaces(env);
        const V = unroll(cam);
        turn(V.roll);
        fx = { ...fx, holdT: holdTime(T) };
        const TM = (window.__skyT = {}); let tm = performance.now();
        const lap = (n) => { if (window.__skyFlush) { g.getImageData(0, 0, 1, 1); L.getImageData(0, 0, 1, 1); } const t2 = performance.now(); TM[n] = (TM[n] || 0) + (t2 - tm); tm = t2; };
        g.save(); L.save();
        S.px = g; S.lx = L;
        const px = g, lx = L, nx = S.nx;
        px.globalCompositeOperation = 'source-over'; lx.globalCompositeOperation = 'lighter';
        logical(px); logical(lx);
        // 1 · the sky
        sky(V, T, fx); lap('sky');
        logical(px); logical(lx);
        // 2 · the land under the city (a dark strip down to the shore), then the city
        const yShore = V.p([DOWNTOWN[0], WL, zs(DOWNTOWN[0])])[1];
        px.fillStyle = '#1e1232'; px.fillRect(-S.m, V.yh - 1, V.W + 2 * S.m, yShore - V.yh + 2);
        const sep = Math.abs(fx.hue ?? 0) > 0.5 || (fx.trip ?? 0) > 0;
        if (sep) { nx.setTransform(1, 0, 0, 1, 0, 0); nx.globalCompositeOperation = 'source-over'; nx.globalAlpha = 1; nx.clearRect(0, 0, S.OW, S.OH); }
        const neonTo = sep ? { x: nx, sep: true } : { x: lx, sep: false };
        let top = city(V, T, fx, neonTo); lap('city');
        top = Math.max(-S.m, Math.min(top, V.yh - 4));
        logical(px); logical(lx);
        if (sep) {
            // the trip turns the neon round the colour wheel: the light takes the turned colour,
            // the tubes' glass on the picture keeps a dimmer copy
            const Y1 = clamp(Math.floor(S.M + top * S.k) - 4, 0, S.OH), Y0 = clamp(Math.ceil(S.M + yShore * S.k) + 30, 0, S.OH);
            for (const [ctx, a, op, filt] of [[px, 0.55, 'source-over', 'none'], [lx, 1, 'lighter', `hue-rotate(${(fx.hue ?? 0).toFixed(1)}deg)`]]) {
                ctx.save(); devR(ctx); ctx.globalCompositeOperation = op; ctx.globalAlpha = a; ctx.filter = filt;
                ctx.drawImage(S.neon, 0, Y1, S.OW, Y0 - Y1, -S.M, Y1 - S.M, S.OW, Y0 - Y1); ctx.restore();
            }
        }
        lap('hue');
        // 3 · the bay: what lies on it lights it first (the marina, the port, the ship)
        copyBand(yShore, top);
        S.px = SINK; drawItem(WORLD.marina, V); logical(lx); port(V, T, fx); S.px = g;
        logical(px); logical(lx);
        const box = ship(V, T, fx);
        lap('port');
        profile(top, Math.max(yShore + 2, box ? box.wl : 0), box); lap('profile');
        water(V, yShore, T, fx, box); lap('water');
        logical(px); logical(lx);
        // then their pictures over the water, the ship last
        S.lx = SINK; drawItem(WORLD.marina, V); logical(px); port(V, T, fx); S.lx = L;
        if (box) layShip(box);
        logical(px); logical(lx);
        boats(V, T, fx); lap('boats');
        // 4 · searchlights over everything in the sky
        searchlights(V, T, fx); lap('beams');
        g.restore(); L.restore();
        S.px = S.lx = null;
        return { horizon: V.cy + (V.yh - V.cy) / Math.cos(V.roll) };
    }

    // a flat item (the marina) drawn whole, picture and light
    function drawItem(it, V) {
        const F = frameOf(it, V); if (!F || !visible(it, F, V)) return;
        const sp = sprite(it, bucket(S.k * Math.hypot(F.a, F.b)));
        place(S.px, F); S.px.drawImage(sp.pic, sp.ox, -sp.oy, sp.mw, sp.mh);
        place(S.lx, F); S.lx.drawImage(sp.lit, sp.ox, -sp.oy, sp.mw, sp.mh);
    }

    // how many seconds the hold has stopped the sky's clock by song time T
    function holdTime(T) {
        const a = Song.B(29) + 4.0334, b = Song.B(29) + 6.0501;
        return T <= a ? 0 : (Math.min(T, b) - a) * 0.85;
    }

    return { world, crownColour };
})();
