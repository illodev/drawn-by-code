// The car: an invented 1980s wedge convertible, white, red leather inside, pop-up headlights
// raised, a full-width ribbed tail-light bar, a pink-and-teal pinstripe. A 3D model in metres
// (x right, y up, z forward, origin on the ground under the middle of the car), so every shot
// sees the same car. Faces are painted far to near, each lit by the night: the sky on what
// faces up, the lamps' warmth as the car passes under them (lamp: 0..1), the city's cyan on
// the edges that face forward.
// Global: Car.
//   Car.draw(g, L, N, cam, { x, y, z, pitch }, { lamp, hue, power }, people)
//   people(g, L, part): called between the interior and the seat backs ('torso')
const Car = (() => {
    const P = Neon.PAL;
    const L2 = 2.15, W2 = 0.91;
    // body outline in profile (z, y) along the belt line and the sill
    const belt = (z) => z < -1.15 ? 0.86 + (z + 2.12) * 0.06 : z < 0.78 ? 0.92 - (z + 1.15) * 0.03 : 0.86 - (z - 0.78) * 0.15;

    function faces() {
        const F = [];
        const q = (pts, role, o = {}) => F.push({ pts, role, ...o });
        // tail panel and bumper
        q([[-W2, 0.34, -L2 + 0.04], [W2, 0.34, -L2 + 0.04], [W2 - 0.03, 0.86, -L2 + 0.03], [-W2 + 0.03, 0.86, -L2 + 0.03]], 'rear');
        q([[-W2 - 0.01, 0.24, -L2 + 0.08], [W2 + 0.01, 0.24, -L2 + 0.08], [W2 + 0.01, 0.40, -L2 - 0.02], [-W2 - 0.01, 0.40, -L2 - 0.02]], 'bumper');
        // rear deck up to the cockpit
        q([[-W2 + 0.03, 0.86, -L2 + 0.03], [W2 - 0.03, 0.86, -L2 + 0.03], [W2 - 0.05, 0.92, -1.15], [-W2 + 0.05, 0.92, -1.15]], 'deck');
        // sides (left, right): sill to belt in four lengthwise pieces
        const zs = [-L2 + 0.03, -1.15, 0.78, 1.6, L2 - 0.05];
        for (const sx of [-1, 1]) for (let i = 0; i < zs.length - 1; i++) {
            const a = zs[i], b = zs[i + 1];
            q([[sx * W2, 0.28, a], [sx * W2, 0.28, b], [sx * (W2 - 0.03), belt(b), b], [sx * (W2 - 0.03), belt(a), a]], 'side', { sx });
        }
        // hood and nose
        q([[-0.86, belt(0.78), 0.78], [0.86, belt(0.78), 0.78], [0.84, 0.64, L2 - 0.05], [-0.84, 0.64, L2 - 0.05]], 'hood');
        q([[-0.86, 0.32, L2], [0.86, 0.32, L2], [0.84, 0.64, L2 - 0.05], [-0.84, 0.64, L2 - 0.05]], 'nose');
        // the cockpit: floor and the inner walls (dark), with the dashboard
        q([[-0.8, 0.5, -1.15], [0.8, 0.5, -1.15], [0.8, 0.5, 0.78], [-0.8, 0.5, 0.78]], 'floor');
        q([[-0.8, 0.62, 0.55], [0.8, 0.62, 0.55], [0.8, 0.86, 0.78], [-0.8, 0.86, 0.78]], 'dash');
        return F;
    }
    const FACES = faces();
    const SEATS = [-0.42, 0.42].map((x) => ({ x, z: -0.62 }));

    // world point of a local point, for a car at pose (x, y, z, pitch)
    function W(pose, [x, y, z]) {
        const c = Math.cos(pose.pitch ?? 0), s = Math.sin(pose.pitch ?? 0);
        return [pose.x + x, pose.y + y * c + z * s, pose.z + z * c - y * s];
    }

    function shade(role, light, sx, camX) {
        const lamp = light.lamp ?? 0;
        const warm = Neon.hex('#ffb08a'), sky = Neon.hex('#b9a8ea'), paint = Neon.hex('#e9e4f6');
        switch (role) {
            case 'deck': case 'hood': return Neon.mix(Neon.mix(paint, sky, 0.55), warm, lamp * 0.45);
            case 'rear': return Neon.mix(Neon.mix(paint, '#7a6aa8', 0.45), warm, lamp * 0.3);
            case 'nose': return Neon.mix(paint, '#8a7ab8', 0.4);
            case 'side': return Neon.mix(Neon.mix(paint, '#6d5f9c', 0.5), warm, lamp * 0.5);
            case 'bumper': return Neon.hex('#1c1530');
            case 'floor': return Neon.hex('#3a0f22');
            case 'dash': return Neon.hex('#1a1226');
        }
        return paint;
    }

    function draw(g, L, N, cam, pose, light = {}, people = null) {
        const proj = (p) => cam.p(W(pose, p));
        // wheels first (they sit under the body), far ones before near ones
        const wheels = [[-0.80, -1.35], [0.80, -1.35], [-0.80, 1.30], [0.80, 1.30]]
            .map(([x, z]) => ({ x, z, d: cam.view(W(pose, [x, 0.31, z]))[2] })).sort((a, b) => b.d - a.d);
        for (const w of wheels) wheel(g, cam, pose, w.x, w.z, light);
        // body faces sorted by depth
        const list = FACES.map((f) => ({ f, d: f.pts.reduce((s, p) => s + cam.view(W(pose, p))[2], 0) / f.pts.length }));
        list.sort((a, b) => b.d - a.d);
        let peopleDone = false;
        const drawPeople = () => {
            if (peopleDone) return; peopleDone = true;
            seats(g, cam, pose, light, 'cushion');
            if (people) people(g, L);
            seats(g, cam, pose, light, 'back');
            windshield(g, L, cam, pose, light);
        };
        for (const { f } of list) {
            // the people and the seats go in before the faces nearer than the cockpit
            const facing = faceVisible(cam, pose, f.pts);
            if (!peopleDone && (f.role === 'deck' || f.role === 'rear' || f.role === 'bumper') && camBehind(cam, pose)) drawPeople();
            if (!facing && f.role !== 'floor' && f.role !== 'dash') continue;
            const pts = Neon.poly(cam, f.pts.map((p) => W(pose, p)));
            if (!pts) continue;
            g.fillStyle = Neon.css(shade(f.role, light, f.sx));
            Neon.path(g, pts); g.fill();
            detail(g, L, N, cam, pose, f, pts, light);
        }
        drawPeople();
        // the city's light on the top edges (a thin cyan rim) and the belt line's chrome
        const rimCol = light.hue ? Neon.shift(P.cyan, light.hue) : Neon.hex(P.cyan);
        const edge = (a, b, col, w, alpha) => { const A = proj(a), B = proj(b); if (A[2] < 0.3 || B[2] < 0.3) return; for (const c of [g, L]) { c.save(); c.strokeStyle = Neon.css(col, alpha); c.lineWidth = w; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); c.restore(); } };
        const s = cam.f / Math.max(1, cam.view(W(pose, [0, 0.9, 0]))[2]);
        edge([-W2 + 0.03, 0.865, -L2 + 0.03], [W2 - 0.03, 0.865, -L2 + 0.03], rimCol, Math.max(1, 0.025 * s), 0.85);
        for (const sx of [-1, 1]) {
            edge([sx * (W2 - 0.03), belt(-L2 + 0.03), -L2 + 0.03], [sx * (W2 - 0.03), belt(-1.15), -1.15], rimCol, Math.max(1, 0.02 * s), 0.7);
            edge([sx * (W2 - 0.03), belt(0.78), 0.78], [sx * (W2 - 0.03), belt(L2 - 0.05), L2 - 0.05], rimCol, Math.max(1, 0.02 * s), 0.6);
        }
    }

    const camBehind = (cam, pose) => cam.pos[2] < pose.z - 1;
    function faceVisible(cam, pose, pts) {
        const A = W(pose, pts[0]), B = W(pose, pts[1]), C = W(pose, pts[2]);
        const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
        const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
        const e = [cam.pos[0] - A[0], cam.pos[1] - A[1], cam.pos[2] - A[2]];
        // the faces are wound so that the visible side's normal points at the eye for either sign: test both
        const d = n[0] * e[0] + n[1] * e[1] + n[2] * e[2];
        return Math.abs(d) > 1e-6;
    }

    // the details painted on each face once it is down
    function detail(g, L, N, cam, pose, f, pts, light) {
        const proj = (p) => cam.p(W(pose, p));
        const s = cam.f / Math.max(1, cam.view(W(pose, [0, 0.6, 0]))[2]);
        if (f.role === 'rear') {
            // the tail-light bar: ribbed red glass across the whole back, plate in the middle
            const tl = [[-0.86, 0.58, -L2 + 0.035], [0.86, 0.58, -L2 + 0.035], [0.86, 0.77, -L2 + 0.03], [-0.86, 0.77, -L2 + 0.03]];
            const q = Neon.poly(cam, tl.map((p) => W(pose, p))); if (!q) return;
            const red = light.hue ? Neon.shift(P.red, light.hue * 0.3) : Neon.hex(P.red);
            const pw = light.power ?? 1;
            for (const c of [g, L]) { c.save(); c.fillStyle = Neon.css(Neon.mix(red, [255, 255, 255], 0.15), c === L ? 0.85 * pw : 1); Neon.path(c, q); c.fill(); c.restore(); }
            // ribs
            g.save(); g.strokeStyle = 'rgba(80,0,20,0.55)'; g.lineWidth = Math.max(0.6, 0.012 * s);
            for (let i = 1; i < 18; i++) { const u = -0.86 + (1.72 * i) / 18; const a = proj([u, 0.585, -L2 + 0.035]), b = proj([u, 0.765, -L2 + 0.03]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
            g.restore();
            // reversing lights and the plate recess
            for (const x of [-0.1, 0.1]) { const p = proj([x, 0.675, -L2 + 0.03]); g.fillStyle = '#e8e0ff'; g.fillRect(p[0] - 0.05 * s, p[1] - 0.06 * s, 0.1 * s, 0.12 * s); }
            const plate = Neon.poly(cam, [[-0.26, 0.42, -L2 + 0.04], [0.26, 0.42, -L2 + 0.04], [0.26, 0.55, -L2 + 0.035], [-0.26, 0.55, -L2 + 0.035]].map((p) => W(pose, p)));
            if (plate) { g.fillStyle = '#f3efe2'; Neon.path(g, plate); g.fill(); g.strokeStyle = '#2a1d40'; g.lineWidth = Math.max(0.5, 0.01 * s); g.stroke();
                const c = proj([0, 0.485, -L2 + 0.04]); g.fillStyle = '#e0407a'; g.font = `${Math.max(4, 0.07 * s)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; if (s > 120) g.fillText('Sunshine State', c[0], c[1] - 0.035 * s); g.fillStyle = '#1b2a6a'; g.font = `bold ${Math.max(4, 0.075 * s)}px sans-serif`; if (s > 60) g.fillText('RUN 85', c[0], c[1] + 0.02 * s); }
        }
        if (f.role === 'side') {
            // the pinstripe: pink over teal, along the body below the belt
            const a = f.pts[0][2], b = f.pts[1][2], sx = f.sx;
            for (const [yy, col] of [[0.62, P.pink], [0.595, '#2fc7c0']]) {
                const A = proj([sx * W2 * 1.001, yy, a]), B = proj([sx * W2 * 1.001, yy - (b - a) * 0.01, b]);
                g.strokeStyle = col; g.lineWidth = Math.max(0.7, 0.018 * s); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke();
            }
            if (a < -1 && a > -2.2) { const p = proj([sx * W2 * 1.002, 0.66, -1.95]); for (const c of [g, L]) { c.fillStyle = P.red; c.fillRect(p[0] - 0.04 * s, p[1] - 0.02 * s, 0.08 * s, 0.04 * s); } }
            if (a > 1.5) { const p = proj([sx * W2 * 1.002, 0.55, 1.95]); for (const c of [g, L]) { c.fillStyle = P.orange; c.fillRect(p[0] - 0.04 * s, p[1] - 0.02 * s, 0.08 * s, 0.04 * s); } }
            // the door's cut line
            if (a === -1.15) { const A = proj([sx * W2 * 1.001, 0.3, -0.2]), B = proj([sx * (W2 - 0.03) * 1.001, belt(-0.2), -0.2]); g.strokeStyle = 'rgba(40,24,70,0.6)'; g.lineWidth = Math.max(0.6, 0.01 * s); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); }
        }
        if (f.role === 'hood') {
            // pop-up headlights, raised: two small blocks near the nose
            for (const x of [-0.6, 0.6]) {
                const blk = [[x - 0.2, 0.66, 1.75], [x + 0.2, 0.66, 1.75], [x + 0.2, 0.86, 1.8], [x - 0.2, 0.86, 1.8]];
                const q = Neon.poly(cam, blk.map((p) => W(pose, p))); if (q) { g.fillStyle = '#d6cfee'; Neon.path(g, q); g.fill(); }
            }
        }
        if (f.role === 'dash') {
            for (const x of [-0.5, -0.36, 0.3]) { const p = proj([x, 0.8, 0.7]); for (const c of [g, L]) { c.fillStyle = Neon.css(Neon.hex('#5dffc8'), 0.8); c.beginPath(); c.arc(p[0], p[1], Math.max(0.8, 0.035 * s), 0, Math.PI * 2); c.fill(); } }
        }
    }

    function seats(g, cam, pose, light, part) {
        const proj = (p) => cam.p(W(pose, p));
        for (const st of SEATS) {
            const s = cam.f / Math.max(1, cam.view(W(pose, [st.x, 0.9, st.z]))[2]);
            if (part === 'cushion') continue;
            // seat back (a rounded slab) and the headrest above it, deep red leather
            const back = [[st.x - 0.26, 0.55, st.z - 0.12], [st.x + 0.26, 0.55, st.z - 0.12], [st.x + 0.24, 1.08, st.z - 0.22], [st.x - 0.24, 1.08, st.z - 0.22]];
            const q = Neon.poly(cam, back.map((p) => W(pose, p))); if (!q) continue;
            g.fillStyle = Neon.css(Neon.mix('#5a1430', '#c0506a', (light.lamp ?? 0) * 0.35)); Neon.path(g, q); g.fill();
            // stitched panels
            g.strokeStyle = 'rgba(20,4,12,0.5)'; g.lineWidth = Math.max(0.5, 0.008 * s);
            for (const dx of [-0.08, 0.08]) { const a = proj([st.x + dx, 0.6, st.z - 0.13]), b = proj([st.x + dx, 1.04, st.z - 0.21]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
            const hr = proj([st.x, 1.2, st.z - 0.24]);
            g.fillStyle = Neon.css(Neon.mix('#4a1028', '#c0506a', (light.lamp ?? 0) * 0.3));
            g.beginPath(); g.ellipse(hr[0], hr[1], 0.13 * s, 0.1 * s, 0, 0, Math.PI * 2); g.fill();
            const st0 = proj([st.x, 1.08, st.z - 0.22]); g.fillRect(st0[0] - 0.02 * s, hr[1], 0.04 * s, st0[1] - hr[1]);
        }
    }

    function windshield(g, L, cam, pose, light) {
        const proj = (p) => cam.p(W(pose, p));
        const fr = [[-0.78, 0.88, 0.8], [0.78, 0.88, 0.8], [0.66, 1.24, 0.4], [-0.66, 1.24, 0.4]];
        const q = Neon.poly(cam, fr.map((p) => W(pose, p))); if (!q) return;
        g.save(); Neon.path(g, q);
        const gr = g.createLinearGradient(q[0][0], q[2][1], q[0][0], q[0][1]);
        gr.addColorStop(0, 'rgba(120,200,255,0.18)'); gr.addColorStop(1, 'rgba(255,120,200,0.12)');
        g.fillStyle = gr; g.fill();
        const s = cam.f / Math.max(1, cam.view(W(pose, [0, 1, 0.6]))[2]);
        g.strokeStyle = '#d8d0ee'; g.lineWidth = Math.max(1, 0.035 * s); g.stroke();
        g.restore();
        // the rear-view mirror
        const m = proj([0, 1.16, 0.5]); g.fillStyle = '#1b1430'; g.fillRect(m[0] - 0.1 * s, m[1] - 0.03 * s, 0.2 * s, 0.06 * s);
    }

    function wheel(g, cam, pose, x, z, light) {
        const r = 0.31, pts = [];
        for (const xx of [x * 1.02 + Math.sign(x) * 0.12, x * 1.02 - Math.sign(x) * 0.12])
            for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; pts.push(cam.p(W(pose, [xx, 0.31 + Math.sin(a) * r, z + Math.cos(a) * r]))); }
        if (pts.some((p) => p[2] < 0.3)) return;
        const hull = convex(pts.map((p) => [p[0], p[1]]));
        g.fillStyle = '#0d0a18'; Neon.path(g, hull); g.fill();
    }
    function convex(P0) {
        const P = P0.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lo = [], up = [];
        for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
        for (const p of P.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
        return lo.slice(0, -1).concat(up.slice(0, -1));
    }

    return { draw, W, SEATS };
})();
