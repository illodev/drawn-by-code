// clay3d-test · the set and Laura as signed distance functions (GLSL for styles/clay3d).
// Global: SET_GLSL. Units ≈ metres of a puppet set: the table top at y = 1, Laura behind it
// facing the camera (+z). Animation comes in uA[] (see scene.js: A.* indices).
const SET_GLSL = `
// ---- animation inputs
#define LOOK vec2(uA[0], uA[1])
#define BLINK uA[2]
#define GRIN uA[3]
#define TILT uA[4]
#define YAW uA[5]
#define MUG vec3(uA[6], uA[7], uA[8])
#define ELR vec3(uA[9], uA[10], uA[11])
#define ELL vec3(uA[12], uA[13], uA[14])
#define BREATH uA[15]

const vec3 HC = vec3(0.0, 2.02, -0.3);   // head centre
const float MR = 0.15;                   // mug radius

// materials
#define M_SKIN 1.0
#define M_EYE 2.0
#define M_PUPIL 3.0
#define M_GLASS 4.0
#define M_HAIR 5.0
#define M_KNIT 6.0
#define M_SHIRT 7.0
#define M_CORAL 8.0
#define M_CUFF 9.0
#define M_CLOTH 10.0
#define M_WALL 11.0
#define M_WOOD 12.0
#define M_MOUTH 13.0
#define M_TEETH 14.0
#define M_COFFEE 15.0
#define M_MUG 16.0
#define M_DOOR 17.0

vec3 toHead(vec3 p) {
    vec3 q = p - HC;
    q.xz = rot(YAW) * q.xz;
    q.xy = rot(TILT) * q.xy;
    return q;
}

// ---- Laura's head
vec2 head(vec3 p) {
    vec3 q = toHead(p);
    float d = sdEllipsoid(q, vec3(0.40, 0.45, 0.38));
    d = smin(d, sdEllipsoid(q - vec3(0.0, -0.13, 0.07), vec3(0.35, 0.3, 0.31)), 0.08);   // cheeks and jaw
    d = smin(d, sdEllipsoid(q - vec3(0.0, -0.04, 0.37), vec3(0.075, 0.07, 0.085)), 0.05); // nose
    vec3 qe = vec3(abs(q.x), q.yz);
    d = smin(d, sdEllipsoid(qe - vec3(0.39, -0.03, 0.0), vec3(0.05, 0.1, 0.075)), 0.03);  // ears
    // the mouth: a bent slot carved in (a smile), opening into a grin
    vec3 qm = q - vec3(0.0, -0.215, 0.33);
    qm.y -= 2.2 * qm.x * qm.x;
    float mouth = sdEllipsoid(qm, vec3(0.11 + 0.03 * GRIN, 0.012 + 0.05 * GRIN, 0.09));
    d = smax(d, -mouth, 0.012);
    vec2 r = vec2(d, M_SKIN);
    r = opU(r, vec2(sdEllipsoid(q - vec3(0.0, -0.215 - 0.02 * GRIN, 0.25), vec3(0.12, 0.05 + 0.03 * GRIN, 0.06)), M_MOUTH));
    if (GRIN > 0.2) r = opU(r, vec2(sdRoundBox(q - vec3(0.0, -0.195, 0.31), vec3(0.085, 0.018 * GRIN, 0.03), 0.012), M_TEETH));
    // eyes: white balls, pupils on them, lids that close down over them
    for (int i = 0; i < 2; i++) {
        float s = i == 0 ? -1.0 : 1.0;
        vec3 ec = vec3(0.145 * s, 0.05, 0.29);
        vec3 qe2 = q - ec;
        r = opU(r, vec2(sdSphere(qe2, 0.1), M_EYE));
        vec3 pd = normalize(vec3(LOOK.x * 0.55, LOOK.y * 0.45, 1.0));
        r = opU(r, vec2(sdSphere(qe2 - pd * 0.083, 0.04), M_PUPIL));
        float h = mix(0.12, -0.02, BLINK);
        r = opU(r, vec2(smax(sdSphere(qe2, 0.106), h - qe2.y, 0.01), M_SKIN));
        // glasses: a rolled black ring round each eye, arms to the ears
        vec3 qg = qe2 - vec3(0.0, 0.0, 0.07);
        r = opU(r, vec2(sdTorus(vec3(qg.x, qg.z, qg.y), vec2(0.112, 0.013)), M_GLASS));
        r = opU(r, vec2(sdCapsule(q, vec3(0.25 * s, 0.07, 0.33), vec3(0.385 * s, 0.06, 0.05), 0.012), M_GLASS));
    }
    r = opU(r, vec2(sdCapsule(q, vec3(-0.035, 0.08, 0.385), vec3(0.035, 0.08, 0.385), 0.012), M_GLASS));
    // hair: a helmet over the top and back, a fringe, a bun
    float hair = sdEllipsoid(q - vec3(0.0, 0.05, -0.03), vec3(0.435, 0.48, 0.42));
    hair = smax(hair, -sdRoundBox(q - vec3(0.0, -0.2, 0.36), vec3(0.5, 0.36, 0.3), 0.08), 0.05);
    hair = smin(hair, sdEllipsoid(q - vec3(-0.06, 0.27, 0.25), vec3(0.3, 0.08, 0.12)), 0.06);
    hair = smin(hair, sdSphere(q - vec3(0.0, 0.5, -0.14), 0.15), 0.05);
    r = opU(r, vec2(hair, M_HAIR));
    return r;
}

// ---- a hand wrapped round the mug's body (s = -1: her right hand, on the mug's -x side)
vec2 hand(vec3 p, float s) {
    vec3 q = p - MUG;
    q.x *= s;                     // both hands built on the +x side, mirrored
    float d = sdEllipsoid(q - vec3(MR + 0.055, 0.0, -0.01), vec3(0.055, 0.1, 0.085)); // palm
    // four fingers round the front: two segments on a circle, the tips towards the middle
    for (int i = 0; i < 4; i++) {
        float fi = float(i), y = 0.075 - fi * 0.05, rr = MR + 0.035;
        float a0 = -0.15, a1 = 0.65 - fi * 0.05, a2 = 1.05 - fi * 0.1;
        vec3 k0 = vec3(cos(a0) * rr, y, sin(a0) * rr), k1 = vec3(cos(a1) * rr, y, sin(a1) * rr), k2 = vec3(cos(a2) * (rr - 0.005), y - 0.005, sin(a2) * (rr - 0.005));
        float fr = 0.03 - fi * 0.002;
        d = smin(d, min(sdCapsule(q, k0, k1, fr), sdCapsule(q, k1, k2, fr * 0.92)), 0.012);
    }
    // the thumb along the top, over the rim towards the back
    d = smin(d, sdCapsule(q, vec3(MR + 0.06, 0.08, -0.05), vec3(MR - 0.01, 0.17, -0.1), 0.03), 0.02);
    return vec2(d, M_SKIN);
}

// ---- body, arms, hands
vec2 body(vec3 p) {
    vec3 q = p - vec3(0.0, BREATH, 0.0);
    vec3 qb = q; qb.x *= 0.82;
    float torso = sdRoundCone(qb, vec3(0.0, 0.85, -0.38), vec3(0.0, 1.5, -0.32), 0.42, 0.3);
    torso = smin(torso, sdEllipsoid(q - vec3(0.0, 1.5, -0.32), vec3(0.47, 0.16, 0.26)), 0.1); // shoulders
    vec2 r = vec2(torso, M_KNIT);
    // the shirt's V and collar, buttons down the front
    r = opU(r, vec2(sdEllipsoid(q - vec3(0.0, 1.5, -0.05), vec3(0.09, 0.11, 0.03)), M_SHIRT));
    for (int i = 0; i < 2; i++) {
        float s = i == 0 ? -1.0 : 1.0;
        vec3 qc = q - vec3(0.08 * s, 1.6, -0.08);
        qc.xy = rot(0.5 * s) * qc.xy;
        r = opU(r, vec2(sdEllipsoid(qc, vec3(0.1, 0.035, 0.03)), M_SHIRT));
    }
    for (int i = 0; i < 3; i++) r = opU(r, vec2(sdSphere(q - vec3(0.0, 1.36 - float(i) * 0.12, -0.02 + float(i) * 0.005), 0.025), M_CORAL));
    r = opU(r, vec2(sdCapsule(q, vec3(0.0, 1.55, -0.3), vec3(0.0, 1.78, -0.3), 0.1), M_SKIN)); // neck
    // arms: shoulder → elbow → wrist (the wrist at the palm, outside the mug)
    for (int i = 0; i < 2; i++) {
        float s = i == 0 ? -1.0 : 1.0;
        vec3 sh = vec3(0.4 * s, 1.52, -0.32), el = i == 0 ? ELR : ELL;
        vec3 wr = MUG + vec3(s * (MR + 0.16), -0.01, -0.02);
        float arm = min(sdCapsule(q, sh, el, 0.105), sdRoundCone(q, el, wr, 0.095, 0.075));
        r = opSU(r, vec2(arm, M_KNIT), 0.03);
        vec3 cd = normalize(wr - el);
        r = opU(r, vec2(sdCapsule(q, wr - cd * 0.05, wr + cd * 0.005, 0.078), M_CUFF)); // cuff
        r = opU(r, hand(p, s));
    }
    return r;
}

// ---- the mug: a clay cup, coral with cream dots; coffee inside; the handle at the back
vec2 mug(vec3 p) {
    vec3 q = p - MUG;
    float outer = sdCylinder(q, 0.12, MR) - 0.012;
    float inner = sdCylinder(q - vec3(0.0, 0.05, 0.0), 0.12, MR - 0.025);
    float d = smax(outer, -inner, 0.01);
    d = min(d, sdTorus((q - vec3(0.0, 0.0, -MR - 0.03)).yxz * vec3(1.0, 1.0, 1.0), vec2(0.06, 0.018)));
    vec2 r = vec2(d, M_MUG);
    r = opU(r, vec2(sdCylinder(q - vec3(0.0, 0.07, 0.0), 0.005, MR - 0.024), M_COFFEE));
    return r;
}

// ---- the brand figurine: the logo's cloud (lobes from its SVG) and bar, puffy clay
vec2 cloud(vec3 p) {
    vec3 q = (p - vec3(0.95, 1.08, 0.45)) / 0.0058; // logo units (the SVG's), on the plaque
    q.xz = rot(-0.35) * q.xz;
    float by = 69.52;
    vec3 c = vec3(q.x + 46.35, by - q.y, q.z);     // back to SVG coordinates (y down)
    float d = 1e5;
    d = smin(d, length(c - vec3(13.6, 43.1, 0.0)) - 13.6, 3.0);
    d = smin(d, length(c - vec3(20.6, 24.8, 0.0)) - 13.2, 3.0);
    d = smin(d, length(c - vec3(55.4, 24.0, 0.0)) - 24.0, 3.0);
    d = smin(d, length(c - vec3(79.4, 43.1, 0.0)) - 13.3, 3.0);
    d = smin(d, sdRoundBox(c - vec3(47.0, 42.0, 0.0), vec3(38.0, 10.0, 11.0), 6.0), 4.0);
    d = smax(d, c.y - 52.9, 1.5);                  // the flat bottom
    d = smax(d, abs(c.z - 4.0) - 5.0, 2.0);        // relief: 1 cm proud of the plaque
    float bar = sdRoundBox(c - vec3(46.3, 66.2, 4.0), vec3(43.0, 3.3, 5.0), 2.0);
    vec2 r = vec2(min(d, bar) * 0.0058, M_CORAL);
    // the plaque: a cream slab standing on its foot, the logo pressed onto it
    float plaque = sdRoundBox(c - vec3(46.3, 35.0, -3.0), vec3(58.0, 48.0, 3.0), 5.0);
    plaque = min(plaque, sdRoundBox(c - vec3(46.3, 84.0, -8.0), vec3(50.0, 3.5, 12.0), 3.0));
    return opU(r, vec2(plaque * 0.0058, M_CUFF));
}

// ---- the set: table with cloth, chair back, wall with wallpaper, door
vec2 set(vec3 p) {
    // the tablecloth: a slab on the table, hanging at the front in soft folds
    float top = sdRoundBox(p - vec3(0.0, 0.97, 0.25), vec3(2.4, 0.03, 0.95), 0.025);
    vec3 qf = p - vec3(0.0, 0.6, 1.2);
    qf.z += 0.018 * sin(p.x * 11.0) + 0.01 * sin(p.x * 23.0 + 1.3);
    float front = sdRoundBox(qf, vec3(2.4, 0.4, 0.012), 0.012);
    vec2 r = vec2(smin(top, front, 0.05), M_CLOTH);
    // chair back behind her: two posts and a rail
    for (int i = 0; i < 2; i++) {
        float s = i == 0 ? -1.0 : 1.0;
        r = opU(r, vec2(sdCapsule(p, vec3(0.62 * s, 1.0, -0.72), vec3(0.6 * s, 2.05, -0.75), 0.05), M_WOOD));
    }
    r = opU(r, vec2(sdRoundBox(p - vec3(0.0, 2.02, -0.76), vec3(0.62, 0.07, 0.035), 0.03), M_WOOD));
    // wall, door (green, left) and a picture frame (right)
    r = opU(r, vec2(p.z + 1.9, M_WALL));
    float door = sdRoundBox(p - vec3(-1.75, 1.6, -1.88), vec3(0.55, 1.2, 0.06), 0.03);
    for (int i = 0; i < 2; i++) door = smax(door, -sdRoundBox(p - vec3(-1.75, 1.05 + float(i) * 1.0, -1.82), vec3(0.38, 0.38, 0.02), 0.02), 0.02);
    r = opU(r, vec2(door, M_DOOR));
    r = opU(r, vec2(sdRoundBox(p - vec3(-1.4, 1.5, -1.8), vec3(0.03, 0.03, 0.05), 0.02), M_CORAL)); // knob
    r = opU(r, vec2(smax(sdRoundBox(p - vec3(1.65, 2.35, -1.87), vec3(0.3, 0.24, 0.05), 0.02), -sdRoundBox(p - vec3(1.65, 2.35, -1.8), vec3(0.24, 0.18, 0.03), 0.01), 0.01), M_WOOD));
    r = opU(r, vec2(sdRoundBox(p - vec3(1.65, 2.35, -1.86), vec3(0.25, 0.19, 0.01), 0.005), M_DOOR + 1.0));
    return r;
}

vec2 map(vec3 p) {
    vec2 r = set(p);
    // bounding spheres skip whole characters, but only with a wide margin (BOUND): a bound
    // is a surface to the soft shadows, and a near one casts a ghost penumbra (rings)
    const float BOUND = 0.5;
    float bLaura = length(p - vec3(0.0, 1.55, -0.2)) - 1.25;
    if (bLaura > BOUND) r = opU(r, vec2(bLaura, 0.0));
    else {
        float bHead = length(p - HC) - 0.75;
        r = opU(r, bHead > BOUND ? vec2(bHead, 0.0) : head(p));
        r = opU(r, body(p));
    }
    float bMug = length(p - MUG) - 0.5;
    r = opU(r, bMug > BOUND ? vec2(bMug, 0.0) : mug(p));
    float bCloud = length(p - vec3(0.95, 1.3, 0.45)) - 0.5;
    r = opU(r, bCloud > BOUND ? vec2(bCloud, 0.0) : cloud(p));
    return r;
}

vec3 albedo(float m, vec3 p, vec3 n) {
    if (m == M_SKIN) {
        vec3 q = toHead(p);
        vec3 c = vec3(0.93, 0.72, 0.58);
        float blush = smoothstep(0.13, 0.0, length(vec3(abs(q.x), q.yz) - vec3(0.22, -0.11, 0.27)));
        return mix(c, vec3(0.95, 0.55, 0.5), blush * 0.55);
    }
    if (m == M_EYE) return vec3(0.97, 0.95, 0.92);
    if (m == M_PUPIL) return vec3(0.05, 0.04, 0.05);
    if (m == M_GLASS) return vec3(0.09, 0.08, 0.1);
    if (m == M_HAIR) {
        vec3 q = toHead(p);
        float strands = 0.5 + 0.5 * sin(atan(q.x, q.y + 0.3) * 38.0 + noise(q * 12.0) * 3.0);
        return mix(vec3(0.3, 0.17, 0.11), vec3(0.4, 0.24, 0.15), strands);
    }
    if (m == M_KNIT) {
        // stocking stitch: columns of little Vs
        float col = fract(p.x * 26.0);
        float v = fract(p.y * 30.0 + abs(col - 0.5) * 0.9);
        float k = smoothstep(0.0, 0.25, v) * smoothstep(1.0, 0.7, v) * smoothstep(0.0, 0.15, abs(col - 0.5) * 2.0);
        return mix(vec3(0.12, 0.2, 0.42), vec3(0.19, 0.3, 0.58), k);
    }
    if (m == M_SHIRT) return vec3(0.94, 0.92, 0.87);
    if (m == M_CORAL) return vec3(0.82, 0.34, 0.25);
    if (m == M_CUFF) return vec3(0.93, 0.9, 0.82);
    if (m == M_CLOTH) {
        float w = 0.5 + 0.25 * sin(p.x * 180.0) + 0.25 * sin(p.z * 180.0 + p.y * 180.0);
        return mix(vec3(0.72, 0.76, 0.68), vec3(0.8, 0.83, 0.76), w);
    }
    if (m == M_WALL) {
        // wallpaper: cream with faded stripes and little diamonds
        float st = smoothstep(0.02, 0.0, abs(fract(p.x * 1.6) - 0.5) - 0.012);
        vec2 dg = vec2(fract(p.x * 1.6 + 0.5) - 0.5, fract(p.y * 1.2) - 0.5);
        float dia = smoothstep(0.02, 0.0, abs(abs(dg.x) + abs(dg.y) * 0.7 - 0.12) - 0.012);
        vec3 c = vec3(0.86, 0.79, 0.65);
        c = mix(c, vec3(0.62, 0.72, 0.62), st * 0.6);
        return mix(c, vec3(0.8, 0.45, 0.35), dia * 0.7);
    }
    if (m == M_WOOD) return mix(vec3(0.55, 0.36, 0.22), vec3(0.66, 0.46, 0.3), 0.5 + 0.5 * sin(p.y * 40.0 + noise(p * 6.0) * 4.0));
    if (m == M_MOUTH) return vec3(0.35, 0.09, 0.08);
    if (m == M_TEETH) return vec3(0.96, 0.94, 0.88);
    if (m == M_COFFEE) return vec3(0.28, 0.16, 0.09);
    if (m == M_MUG) {
        vec3 q = p - MUG;
        float a = atan(q.z, q.x);
        vec2 g = vec2(a * MR * 9.0, q.y * 9.0);
        g.x += 0.5 * floor(g.y);
        float dot_ = smoothstep(0.24, 0.2, length(fract(g) - 0.5));
        return mix(vec3(0.82, 0.34, 0.25), vec3(0.96, 0.92, 0.84), dot_ * step(abs(q.y), 0.105));
    }
    if (m == M_DOOR) return vec3(0.38, 0.5, 0.33);
    if (m == M_DOOR + 1.0) return p.y > 2.3 + 0.05 * sin(p.x * 9.0) ? vec3(0.6, 0.75, 0.85) : vec3(0.45, 0.6, 0.35); // a little landscape
    return vec3(0.5);
}
vec4 material(float m) {
    if (m == M_SKIN) return vec4(0.22, 18.0, 0.45, 1.0);
    if (m == M_EYE) return vec4(0.9, 90.0, 0.15, 0.0);
    if (m == M_PUPIL) return vec4(1.4, 140.0, 0.0, 0.0);
    if (m == M_GLASS) return vec4(1.0, 80.0, 0.0, 0.2);
    if (m == M_HAIR) return vec4(0.18, 14.0, 0.2, 2.0);
    if (m == M_KNIT) return vec4(0.08, 8.0, 0.15, 1.2);
    if (m == M_SHIRT) return vec4(0.2, 16.0, 0.3, 1.0);
    if (m == M_CORAL) return vec4(0.3, 22.0, 0.35, 1.0);
    if (m == M_CUFF) return vec4(0.15, 12.0, 0.3, 1.2);
    if (m == M_CLOTH) return vec4(0.04, 6.0, 0.15, 0.4);
    if (m == M_WALL) return vec4(0.03, 6.0, 0.0, 0.3);
    if (m == M_WOOD) return vec4(0.25, 18.0, 0.05, 0.6);
    if (m == M_MOUTH) return vec4(0.2, 20.0, 0.3, 0.0);
    if (m == M_TEETH) return vec4(0.5, 40.0, 0.2, 0.0);
    if (m == M_COFFEE) return vec4(0.9, 70.0, 0.0, 0.0);
    if (m == M_MUG) return vec4(0.35, 30.0, 0.2, 0.7);
    if (m == M_DOOR) return vec4(0.1, 10.0, 0.0, 0.4);
    return vec4(0.1, 10.0, 0.0, 0.0);
}
vec3 background(vec3 rd) { return vec3(0.3, 0.26, 0.22); }
`;
