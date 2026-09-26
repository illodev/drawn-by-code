// The three felt kittens: a rig in JS (pose → joint frames, forward kinematics) and their
// shapes in GLSL (Felt3D). One cat is 1 unit tall to the ear tips; it stands at the origin
// of its own frame, y up, facing +z (the camera). Cat 0: a cream-orange fold with folded
// ears; cat 1: white, a black cowboy hat with a silver band; cat 2: white with a black
// helmet and back patches, a black tail and round wire glasses.
//
//   Cats.pack(poses) → floats for Felt3D's uP (Cats.STRIDE per cat)
//   pose: { x, z, bob, yaw, pitch, roll, twist, bend, head: [yaw, pitch, roll],
//           armL/armR: [forward, out, elbow, inward], legL/legR: [lift, out],
//           tail: [swing, lift, curl], mouth }   angles in radians
const Cats = (() => {
    const { V } = Felt3D;
    const STRIDE = 96;
    const REST = {
        x: 0, z: 0, bob: 0, yaw: 0, pitch: 0, roll: 0, twist: 0, bend: 0, head: [0, 0, 0],
        armL: [0.35, 0.15, 1.2, 0.3], armR: [0.35, 0.15, 1.2, 0.3], legL: [0, 0.08], legR: [0, 0.08],
        tail: [0.6, 0, 0.5], mouth: 0,
    };
    function joints(ps, c) {
        const P = { ...REST, ...ps };
        const R = V.mm(V.ry(P.yaw), V.mm(V.rz(P.roll), V.rx(P.pitch)));
        let pel = [P.x, 0.16, P.z];
        const Rc = V.mm(R, V.mm(V.ry(P.twist), V.rx(P.bend)));
        const chest = V.add(pel, V.app(Rc, [0, 0.19, 0.005]));
        const [hy, hp, hr] = P.head;
        const Rh = V.mm(Rc, V.mm(V.ry(hy), V.mm(V.rx(hp), V.rz(hr))));
        const neck = V.add(chest, V.app(Rc, [0, 0.075, 0.02]));
        const head = V.add(neck, V.app(Rh, [0, 0.13, 0.0]));
        const arm = (sgn, [fw, out, el, inw]) => {
            const sh = V.add(chest, V.app(Rc, [sgn * 0.085, 0.0, 0.045]));
            const Ra = V.mm(Rc, V.mm(V.rz(sgn * out), V.rx(-fw)));
            const el3 = V.add(sh, V.app(Ra, [0, -0.085, 0]));
            const fore = V.app(V.ry(-sgn * inw), [0, -Math.cos(el), Math.sin(el)]);
            const paw = V.add(el3, V.app(Ra, V.mul(fore, 0.08)));
            return [sh, el3, paw];
        };
        const leg = (sgn, [lift, out]) => {
            const hip = V.add(pel, V.app(R, [sgn * 0.072, -0.03, 0.0]));
            const Rl = V.mm(R, V.mm(V.rz(sgn * out), V.rx(-lift)));
            const knee = V.add(hip, V.app(Rl, [0, -0.07, 0]));
            // the shin hangs back towards vertical as the knee comes up
            const Rs = V.mm(R, V.mm(V.rz(sgn * out * 0.4), V.rx(-lift * 0.25)));
            const foot = V.add(knee, V.app(Rs, [0, -0.065, 0.015]));
            return [hip, knee, foot];
        };
        const aL = arm(1, P.armL), aR = arm(-1, P.armR);
        const lL = leg(1, P.legL), lR = leg(-1, P.legR);
        // ground the lower foot (feet are 0.028 thick), then the bob lifts the whole cat
        const dy = 0.03 - Math.min(lL[2][1], lR[2][1]) + P.bob;
        const up = (v) => [v[0], v[1] + dy, v[2]];
        pel = up(pel);
        // tail: five points from the rump, curving out along the floor
        const tail = [];
        let tp = V.add(pel, V.app(R, [0, -0.1, -0.1]));
        const [sw, tl, cu] = P.tail;
        for (let i = 0; i < 5; i++) {
            tail.push(tp);
            const yaw = sw * (0.3 + 0.35 * i) * (1 + cu * i * 0.3), pit = -0.55 + tl + cu * 0.25 * i;
            const dl = V.app(R, [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), -Math.cos(yaw) * Math.cos(pit)]);
            tp = V.add(tp, V.mul(dl, 0.075));
            tp[1] = Math.max(tp[1], 0.028);
        }
        const out = [];
        out.push(...pel, ...R, ...up(chest), ...Rc, ...up(head), ...Rh);
        for (const j of [...aL, ...aR, ...lL, ...lR]) out.push(...up(j));
        for (const j of tail) out.push(...j);
        out.push(P.mouth);
        while (out.length < STRIDE) out.push(0);
        return out;
    }
    // poses of the three cats, then the puddle: up to 6 blobs [x, z, r] on the floor
    const pack = (poses, puddle = []) => {
        const out = poses.flatMap((p, c) => joints(p, c));
        for (let k = 0; k < 6; k++) out.push(...(puddle[k] ?? [0, 0, 0]));
        return out;
    };
    const PARAMS = 3 * STRIDE + 18;

    const GLSL = `
#define ST 96
// joints of cat c: offsets inside its block
#define PEL 0
#define CHE 12
#define HEA 24
#define ARL 36
#define ARR 45
#define LGL 54
#define LGR 63
#define TAI 72
#define MOU 87
#define HS 1.14
float ear(vec3 q, float side, int c) {
    // an ear: a flattened cone; the fold (cat 0) bends the tip forward and down
    if (c != 1) {
        // a fold: a short root, the flap bent forward and down over the ear hole (Scottish
        // folds; both side cats have them in the reference)
        vec3 e = q - vec3(side * 0.098, 0.074, -0.004);
        e.xy = rot(side * 0.55) * e.xy;
        float d1 = sdRoundCone(vec3(e.x, e.y, e.z * 1.8), vec3(0.0), vec3(0.0, 0.032, 0.012), 0.04, 0.03);
        float d2 = sdRoundCone(vec3(e.x, e.y * 1.6, e.z), vec3(0.0, 0.05, 0.02), vec3(side * 0.004, 0.028, 0.068), 0.03, 0.01);
        return min(d1 / 1.8, d2 / 1.6);
    }
    vec3 b = vec3(side * 0.088, 0.08, -0.005);
    vec3 e = q - b;
    e.xy = rot(side * 0.35) * e.xy;
    return sdRoundCone(vec3(e.x, e.y, e.z * 2.0), vec3(0.0), vec3(side * 0.016, 0.1, 0.0), 0.052, 0.01) / 2.0;
}
vec2 headSDF(vec3 q, int c, int o, float base) {
    float mo = uP[o + MOU];
    float d = sdEllipsoid(q, vec3(0.15, 0.128, 0.132));
    // cheeks and muzzle: kittens are wide at the cheeks, a small muzzle between
    d = smin(d, sdEllipsoid(vec3(abs(q.x), q.y, q.z) - vec3(0.062, -0.045, 0.06), vec3(0.078, 0.066, 0.075)), 0.03);
    d = smin(d, sdEllipsoid(vec3(abs(q.x), q.y, q.z) - vec3(0.022, -0.05, 0.118), vec3(0.03, 0.026, 0.024)), 0.012);
    d = smin(d, sdEllipsoid(q - vec3(0.0, -0.082, 0.098 - mo * 0.01), vec3(0.03, 0.02, 0.022)), 0.012); // chin
    d = smin(d, ear(q, 1.0, c), 0.012);
    d = smin(d, ear(q, -1.0, c), 0.012);
    // eye sockets: a soft dent where the beads sit
    d = smax(d, -sdSphere(vec3(abs(q.x), q.y, q.z) - vec3(0.054, -0.01, 0.132), 0.024), 0.012);
    // open mouth: a dark notch under the nose
    d = smax(d, -sdEllipsoid(q - vec3(0.0, -0.066, 0.118), vec3(0.016, 0.004 + mo * 0.012, 0.016)), 0.004);
    d += lumps(q, 0.0035);
    vec2 r = vec2(d, base + 7.0);
    if (c == 2) {
        // the bald crown: bare pink skin between the two black side patches, a hole left in
        // the wool on purpose, and three long strands combed over it
        vec2 bz = vec2(q.x / 0.072, (q.z + 0.01) / 0.1);
        if (q.y > 0.03 && dot(bz, bz) < 1.0) r.y = base + 10.0;
        // the strands follow the scalp (the skull's top curve) a hair above it
        float cs = 1e9;
        for (int k = 0; k < 3; k++) {
            float z = -0.035 + 0.032 * float(k);
            vec3 prev = vec3(0.0);
            for (int j = 0; j < 5; j++) {
                float x = -0.085 + 0.04 * float(j) - 0.006 * float(k);
                float y = 0.128 * sqrt(max(0.0, 1.0 - (x / 0.15) * (x / 0.15) - (z / 0.132) * (z / 0.132))) + 0.003;
                vec3 pt = vec3(x, y, z + 0.012 * sin(float(j) * 1.3 + float(k)));
                if (j > 0) cs = min(cs, sdCapsule(q, prev, pt, 0.0019));
                prev = pt;
            }
        }
        r = opU(r, vec2(cs, base + 11.0));
    }
    // mouth inside (dark felt)
    if (mo > 0.02) r = opU(r, vec2(sdEllipsoid(q - vec3(0.0, -0.066, 0.108), vec3(0.014, 0.004 + mo * 0.011, 0.012)), base + 6.0));
    // glass bead eyes
    r = opU(r, vec2(sdSphere(vec3(abs(q.x), q.y, q.z) - vec3(0.054, -0.008, 0.122), 0.024), base + 1.0));
    // nose: a small pink felt triangle
    vec3 nq = q - vec3(0.0, -0.036, 0.142);
    float nd = sdEllipsoid(nq, vec3(0.014, 0.009, 0.009)) - 0.002;
    nd = smax(nd, nq.y * 0.8 - 0.004 - abs(nq.x) * 0.6, 0.004);
    r = opU(r, vec2(nd, base + 2.0));
    // inner ears: pink pads pressed in
    for (int s = 0; s < 2; s++) {
        float side = s == 0 ? 1.0 : -1.0;
        vec3 e = q - vec3(side * 0.088, 0.1, 0.012);
        e.xy = rot(side * 0.35) * e.xy;
        float id = c == 0 ? sdEllipsoid(e - vec3(0.0, 0.02, 0.04), vec3(0.022, 0.016, 0.008))
                          : sdEllipsoid(e - vec3(side * 0.006, 0.036, 0.0), vec3(0.027, 0.05, 0.009));
        if (c == 1) r = opU(r, vec2(id, base + 3.0));
    }
    if (c == 1) {
        // the cowboy hat: felt crown with a pinched top, a brim curled up at the sides
        vec3 h = q - vec3(0.0, 0.125, -0.01);
        h.yz = rot(0.14) * h.yz;
        // cattleman crown: an oval dome, a lengthwise crease on top, two pinches at the front
        float crown = sdEllipsoid(h - vec3(0.0, 0.065, 0.0), vec3(0.112, 0.105, 0.118));
        crown = smax(crown, h.y - 0.145 + 0.028 * exp(-h.x * h.x / 0.0012), 0.025);
        crown = smax(crown, -sdEllipsoid(vec3(abs(h.x) - 0.1, h.y - 0.12, h.z - 0.085), vec3(0.03, 0.055, 0.045)), 0.02);
        crown = max(crown, -h.y);
        // brim: a flat oval whose two halves tilt up from beside the crown (mirrored, so the
        // distance stays exact: a bent-space curl made shadows noisy)
        vec3 bq = vec3(abs(h.x) - 0.07, h.y, h.z);
        bq.xy = rot(0.36 * smoothstep(0.0, 0.12, bq.x)) * bq.xy;
        float brim = sdEllipsoid(bq + vec3(0.07, 0.0, 0.0), vec3(0.265, 0.011, 0.235));
        float hat = min(crown, brim) + lumps(h, 0.002);
        r = opU(r, vec2(hat, base + 4.0));
        float band = max(abs(sdEllipsoid(h - vec3(0.0, 0.07, 0.0), vec3(0.127, 0.102, 0.117))) - 0.003, abs(h.y - 0.028) - 0.011);
        band = min(band, sdCappedCylinder(h, vec3(0.0, 0.028, 0.112), vec3(0.0, 0.028, 0.123), 0.017));
        r = opU(r, vec2(band, base + 5.0));
    }
    if (c == 2) {
        // round wire glasses on the nose
        float g = 1e9;
        for (int s = 0; s < 2; s++) {
            float side = s == 0 ? 1.0 : -1.0;
            vec3 e = q - vec3(side * 0.053, -0.004, 0.152);
            g = min(g, sdTorus(vec3(e.x, e.z, e.y), vec2(0.037, 0.0026)));
            g = min(g, sdCapsule(q, vec3(side * 0.091, 0.0, 0.147), vec3(side * 0.14, 0.012, 0.03), 0.0022));
        }
        g = min(g, sdCapsule(q, vec3(-0.018, 0.002, 0.158), vec3(0.018, 0.002, 0.158), 0.0024));
        r = opU(r, vec2(g, base + 9.0));
    }
    return r;
}
vec2 catSDF(vec3 p, int c) {
    int o = c * ST;
    float base = 20.0 * float(c + 1);
    // bound: a capsule from below the pelvis to above the head (arms, hat brim and tail fit
    // in 0.36), material 0; inside a 0.25 shell the real cat is evaluated, so the soft
    // shadow's penumbra is not cut off where the bound starts
    float bd = sdCapsule(p, P3(o + PEL) - vec3(0.0, 0.2, 0.0), P3(o + HEA) + vec3(0.0, 0.12, 0.0), 0.36);
    if (bd > 0.25) return vec2(bd - 0.23, 0.0);
    vec3 pel = P3(o + PEL), che = P3(o + CHE);
    vec3 bq = local(p, o + PEL);
    // body: a pear from the pelvis to the chest, a round belly
    float d = sdRoundCone(p, pel, che, 0.12, 0.092);
    d = smin(d, sdEllipsoid(bq - vec3(0.0, 0.04, 0.015), vec3(0.13, 0.125, 0.115)), 0.05);
    d = smin(d, sdSphere(p - (che + (P3(o + HEA) - che) * 0.35), 0.075), 0.05); // neck
    // arms: upper arm, forearm, paw
    for (int s = 0; s < 2; s++) {
        int a = o + (s == 0 ? ARL : ARR);
        vec3 sh = P3(a), el = P3(a + 3), pw = P3(a + 6);
        float ad = sdRoundCone(p, sh, el, 0.043, 0.034);
        ad = smin(ad, sdRoundCone(p, el, pw, 0.034, 0.031), 0.02);
        ad = smin(ad, sdSphere(p - pw - normalize(pw - el) * 0.012, 0.036), 0.02);
        d = smin(d, ad, 0.035);
    }
    // legs: chubby thighs into the belly, short shins, oval feet facing forward
    mat3 R = M3(o + PEL + 3);
    for (int s = 0; s < 2; s++) {
        int l = o + (s == 0 ? LGL : LGR);
        vec3 hp = P3(l), kn = P3(l + 3), ft = P3(l + 6);
        float ld = sdRoundCone(p, hp, kn, 0.062, 0.042);
        ld = smin(ld, sdRoundCone(p, kn, ft, 0.042, 0.034), 0.02);
        vec3 fq = transpose(R) * (p - ft) - vec3(0.0, 0.0, 0.03);
        ld = smin(ld, sdEllipsoid(fq, vec3(0.04, 0.03, 0.058)), 0.025);
        d = smin(d, ld, 0.04);
    }
    d += lumps(bq, 0.004);
    vec2 r = vec2(d, base);
    // tail
    float td = 1e9;
    for (int i = 0; i < 4; i++) {
        float f = float(i) / 4.0;
        td = min(td, sdRoundCone(p, P3(o + TAI + i * 3), P3(o + TAI + i * 3 + 3), 0.034 - f * 0.006, 0.028 - f * 0.006));
    }
    r = opSU(r, vec2(td + lumps(p, 0.002), base + 8.0), 0.03);
    // head
    vec3 hq = local(p, o + HEA) / HS;
    vec2 hr = headSDF(hq, c, o, base);
    r = opSU(r, vec2(hr.x * HS, hr.y), 0.035);
    return r;
}
// the pee puddle of cat 2: up to 6 blobs on the floor (x, z, r) after the three cats,
// glossy yellow resin as in felt dioramas
#define FLOOR_DECAL
vec4 floorDecal(vec3 p, vec3 rd, vec3 L) {
    float f = 1e9;
    for (int k = 0; k < 6; k++) {
        int i = 3 * ST + k * 3;
        float r = uP[i + 2];
        if (r <= 0.0) continue;
        vec2 q = p.xz - vec2(uP[i], uP[i + 1]);
        float wob = 1.0 + 0.12 * sin(atan(q.y, q.x) * 3.0 + float(k) * 1.7) + 0.06 * sin(atan(q.y, q.x) * 7.0 + float(k));
        f = smin(f, length(q) - r * wob, 0.04);
    }
    if (f > 0.004) return vec4(0.0);
    float a = smoothstep(0.004, -0.004, f);
    float depth = smoothstep(0.0, -0.06, f);
    vec3 n = normalize(vec3(-0.25 * (1.0 - depth), 1.0, 0.0) * 0.0 + vec3(0.0, 1.0, 0.0));
    vec3 col = mix(vec3(1.0, 0.8, 0.12), vec3(0.9, 0.62, 0.02), depth);
    vec3 h = normalize(L - rd);
    float spec = pow(max(dot(n, h), 0.0), 80.0) * 1.5 + smoothstep(-0.006, 0.0, f) * 0.35; // the rim catches light
    float fres = 0.1 + 0.5 * pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
    col = col * (0.8 + 0.2 * depth) + vec3(1.0, 0.97, 0.85) * (spec + fres * 0.12);
    float al = a * (0.85 + 0.15 * depth);
    return vec4(col * al, al);
}
vec2 map(vec3 p) {
    vec2 r = catSDF(p, 0);
    r = opU(r, catSDF(p, 1));
    r = opU(r, catSDF(p, 2));
    return r;
}
// heathered wool: two or three shades of fibre mixed, as a felter mixes batts
vec3 heather(vec3 base, vec3 p, float amt) {
    float f = noise(p * vec3(300.0, 110.0, 300.0));
    float g = noise(p.zxy * vec3(250.0, 90.0, 250.0) + 3.0);
    float blot = fbm(p * 18.0);
    vec3 c = base * (1.0 + amt * ((f - 0.5) * 0.35 + (g - 0.5) * 0.25 + (blot - 0.5) * 0.3));
    return c;
}
// embroidered thread lines (felters stitch the mouth and the toes): 1 on the thread
float stitchMouth(vec3 hq) {
    if (hq.z < 0.09) return 0.0;
    vec2 q = hq.xy;
    // a line down from the nose, then the two lower curls of a «w»
    float d = (q.y < -0.042 && q.y > -0.062) ? abs(q.x) : 1.0;
    vec2 c = vec2(abs(q.x) - 0.013, q.y + 0.062);
    if (c.y < 0.002) d = min(d, abs(length(c) - 0.013));
    return smoothstep(0.0028, 0.0012, d);
}
float stitchToes(vec3 p, int o) {
    mat3 R = M3(o + PEL + 3);
    float s = 0.0;
    for (int k = 0; k < 2; k++) {
        vec3 fq = transpose(R) * (p - P3(o + (k == 0 ? LGL : LGR) + 6)) - vec3(0.0, 0.0, 0.03);
        if (fq.z > 0.02 && fq.y > -0.02 && fq.y < 0.03 && length(fq) < 0.075) {
            float d = min(abs(abs(fq.x) - 0.013), 1.0);
            s = max(s, smoothstep(0.0025, 0.001, d) * smoothstep(0.035, 0.05, fq.z + fq.y * 0.3));
        }
    }
    return s;
}
vec3 albedoFelt(float m, vec3 p, vec3 n, int c, int o, vec3 hq, vec3 bq, bool head, bool tail);
vec3 albedo(float m, vec3 p, vec3 n) {
    int c = int(m / 20.0) - 1;
    float part = m - 20.0 * float(c + 1);
    int o = c * ST;
    if (part == 1.0) return vec3(0.02, 0.018, 0.02);      // bead
    if (part == 2.0) return c == 0 ? vec3(0.8, 0.5, 0.45) : vec3(0.86, 0.52, 0.55); // nose
    if (part == 10.0) { // bald skin: pale pink, a little blotchy, a few pale hairs left
        vec3 hq = local(p, c * ST + HEA) / HS;
        return heather(vec3(0.97, 0.78, 0.74), p, 0.3) * (0.95 + 0.1 * fbm(hq * 30.0));
    }
    if (part == 11.0) return vec3(0.06, 0.055, 0.06);     // combed-over strands
    if (part == 3.0) return vec3(0.93, 0.66, 0.66);       // inner ear
    if (part == 4.0) return heather(vec3(0.05, 0.045, 0.045), p, 1.2); // hat felt
    if (part == 5.0) return vec3(0.75, 0.75, 0.74);       // metal
    if (part == 6.0) return vec3(0.35, 0.12, 0.13);       // mouth
    if (part == 9.0) return vec3(0.06, 0.055, 0.05);      // dark wire (glasses)
    vec3 hq = local(p, o + HEA) / HS, bq = local(p, o + PEL);
    bool head = part == 7.0, tail = part == 8.0;
    float stitch = head ? stitchMouth(hq) : part == 0.0 ? stitchToes(p, o) : 0.0;
    if (stitch > 0.0 && !(c == 2 && head && hq.y > 0.02)) {
        vec3 thread = c == 0 ? vec3(0.45, 0.25, 0.18) : vec3(0.5, 0.4, 0.4);
        return mix(albedoFelt(m, p, n, c, o, hq, bq, head, tail), thread, stitch);
    }
    return albedoFelt(m, p, n, c, o, hq, bq, head, tail);
}
vec3 albedoFelt(float m, vec3 p, vec3 n, int c, int o, vec3 hq, vec3 bq, bool head, bool tail) {
    if (c == 0) {
        // ginger-cream fold (from the reference): cream whisker pads, chin, chest and belly;
        // brown-ginger tabby stripes running up the forehead and over the crown, bands on the
        // back, the flanks and the arms
        vec3 ginger = vec3(0.88, 0.66, 0.46), cream = vec3(0.97, 0.9, 0.8), dark = vec3(0.66, 0.42, 0.26);
        float pale, stripes;
        if (head) {
            float pads = smoothstep(0.0, -0.03, hq.y + 0.012) * smoothstep(0.07, 0.11, hq.z);
            float chin = smoothstep(-0.06, -0.085, hq.y);
            pale = max(pads, chin) + 0.35 * smoothstep(0.02, -0.02, hq.y) * smoothstep(0.03, 0.09, hq.z);
            float fore = smoothstep(0.02, 0.05, hq.y) * smoothstep(0.08, 0.05, abs(hq.x)) * step(0.0, hq.z);
            float crown = smoothstep(0.08, 0.11, hq.y + max(-hq.z, 0.0) * 0.6);
            float lines = sin(hq.x * 120.0 + fbm(hq * 14.0) * 2.5);
            float bands = sin(hq.z * 70.0 + hq.y * 20.0 + fbm(hq * 14.0) * 2.5);
            stripes = max(smoothstep(0.35, 0.85, lines) * fore, smoothstep(0.35, 0.85, bands) * crown * (1.0 - fore));
            stripes = max(stripes, smoothstep(0.4, 0.85, sin((hq.y - abs(hq.x) * 0.4) * 110.0)) * smoothstep(0.1, 0.13, abs(hq.x)) * 0.8);
        } else {
            pale = smoothstep(0.02, 0.08, bq.z) * smoothstep(0.4, 0.2, bq.y) * smoothstep(0.1, 0.05, abs(bq.x));
            stripes = smoothstep(0.3, 0.85, sin(bq.y * 60.0 + bq.x * 10.0 + fbm(bq * 9.0) * 3.0)) * (1.0 - smoothstep(0.0, 0.07, bq.z) * 0.7);
            if (tail) stripes = smoothstep(0.2, 0.8, sin(length(p - P3(o + TAI)) * 75.0));
        }
        pale = clamp(pale, 0.0, 1.0);
        vec3 col = mix(ginger, cream, pale * 0.9);
        col = mix(col, dark, stripes * 0.6 * (1.0 - pale));
        return heather(col, p, 0.9);
    }
    vec3 white = vec3(0.95, 0.94, 0.91), black = vec3(0.07, 0.065, 0.07);
    if (c == 1) return heather(white, p, 0.7);
    // cat 2: a black helmet over the head and ears with a white blaze, black patches on the
    // back, a black tail
    float blk = 0.0;
    if (head) {
        // two black side patches over the folded ears and temples, the cat's left one (image
        // right) reaching down past the outer eye; the crown between them white (the bald
        // skin is its own material); the back of the head black; grey brow smudges
        float e = (fbm(hq * 22.0) - 0.5) * 0.03;
        float left = smoothstep(0.0, 0.008, hq.x - 0.052 + e) * smoothstep(-0.05, -0.035, hq.y - 0.3 * max(hq.z - 0.08, 0.0));
        float right = smoothstep(0.0, 0.008, -hq.x - 0.064 + e) * smoothstep(-0.005, 0.01, hq.y);
        float back = smoothstep(0.0, 0.015, -hq.z - 0.035 + e) * smoothstep(0.015, 0.03, abs(hq.x)) * smoothstep(-0.07, -0.04, hq.y);
        blk = max(max(left, right), back);
        vec2 br = vec2(abs(hq.x) - 0.045, hq.y - 0.043);
        float brow = smoothstep(1.0, 0.6, length(br / vec2(0.014, 0.005))) * step(0.08, hq.z);
        return heather(mix(mix(white, vec3(0.6, 0.58, 0.58), brow * 0.8), black, blk), p, 0.8);
    } else if (tail) {
        blk = 1.0;
    } else {
        float n = fbm(bq * 5.0 + vec3(1.3, 0.2, 4.1));
        float back = smoothstep(0.03, -0.07, bq.z);
        blk = smoothstep(0.47, 0.5, n + back * 0.16) * smoothstep(0.07, 0.0, bq.z);
    }
    return heather(mix(white, black, blk), p, 0.8);
}
vec4 material(float m) {
    int c = int(m / 20.0) - 1;
    float part = m - 20.0 * float(c + 1);
    if (part == 1.0) return vec4(1.2, 90.0, 0.0, 0.0);   // glass bead
    if (part == 5.0 || part == 9.0) return vec4(0.9, 40.0, 0.0, 0.0);   // wire, band
    if (part == 6.0) return vec4(0.0, 4.0, 0.3, 0.0);
    if (part == 10.0) return vec4(0.08, 10.0, 0.6, 0.004); // bald skin: smoother, a slight sheen
    if (part == 11.0) return vec4(0.05, 8.0, 0.2, 0.0);
    if (part == 4.0) return vec4(0.02, 4.0, 0.3, 0.008);
    return vec4(0.02, 4.0, 0.55, 0.013);                 // felt: deep wrap, stray fibres
}
`;
    return { GLSL, pack, joints, REST, STRIDE, PARAMS };
})();
