// clay3d-test · round 2: Laura as a plasticine puppet on a seamless studio backdrop (GLSL for
// styles/clay3d). Everything is built like modelling clay: uneven forms (lumps), pieces
// pressed on with visible joins (flat disc eyes, a ball nose, sausage eyebrows, hair in
// clumps, a flat collar strip, flattened buttons, a clay badge of the brand's cloud),
// matte material with speckle and fingerprints. Global: SET_GLSL. The head centre at y 1.62,
// facing the camera (+z). Animation in uA[] (see scene.js).
const SET_GLSL = `
#define LOOK vec2(uA[0], uA[1])
#define BLINK uA[2]
#define GRIN uA[3]
#define TILT uA[4]
#define BROW uA[5]
#define ELR vec3(uA[6], uA[7], uA[8])
#define WRR vec3(uA[9], uA[10], uA[11])
#define ROTR vec3(uA[12], uA[13], uA[14])
#define POSER uA[15]
#define ELL vec3(uA[16], uA[17], uA[18])
#define WRL vec3(uA[19], uA[20], uA[21])
#define ROTL vec3(uA[22], uA[23], uA[24])
#define POSEL uA[25]
#define BREATH uA[26]
#define WINK uA[27]

const vec3 HC = vec3(0.0, 1.62, 0.0);

#define M_SKIN 1.0
#define M_WHITE 2.0
#define M_BLACK 3.0
#define M_NOSE 4.0
#define M_HAIR 5.0
#define M_NAVY 6.0
#define M_CREAM 7.0
#define M_CORAL 8.0
#define M_MOUTH 13.0
#define M_PINK 14.0
#define M_BACK 20.0

vec3 toHead(vec3 p) {
    vec3 q = p - HC - vec3(0.0, BREATH, 0.0);
    q.xy = rot(TILT) * q.xy;
    return q;
}
// a flat disc facing +z (a pressed-on piece): radius r, half thickness h, rounded edge
float disc(vec3 q, float r, float h) { return sdCylinder(q.xzy, h, r - h) - h; }

// ---- head: an egg of clay with pressed-on features
vec2 head(vec3 p) {
    vec3 q = toHead(p);
    float d = sdEllipsoid(q, vec3(0.34, 0.39, 0.31));
    d = smin(d, sdEllipsoid(q - vec3(0.0, -0.14, 0.04), vec3(0.3, 0.24, 0.27)), 0.07);
    d += lumps(q + 1.3, 0.012);
    vec2 r = vec2(d, M_SKIN);
    for (int i = 0; i < 2; i++) {
        float s = i == 0 ? -1.0 : 1.0;
        // ears: flattened discs with a thumb-pressed hollow
        vec3 qe = q - vec3(0.335 * s, -0.02, -0.02);
        qe.xz = rot(1.35 * s) * qe.xz;
        float ear = disc(qe, 0.075, 0.022);
        ear = smax(ear, -sdSphere(qe - vec3(0.0, 0.0, 0.05), 0.045), 0.01);
        r = opU(r, vec2(ear, M_SKIN));
        // cheeks: flat pink dabs
        r = opU(r, vec2(sdEllipsoid(q - vec3(0.2 * s, -0.1, 0.235), vec3(0.055, 0.035, 0.03)), M_PINK));
        // eyes: flat white discs with flat black dots that look; a blink is a black line
        vec3 qo = q - vec3(0.118 * s, 0.075, 0.283);
        qo.xz = rot(-0.38 * s) * qo.xz;
        float closed = max(BLINK, s > 0.0 ? WINK : 0.0);
        if (closed < 0.5) {
            vec3 qs = qo; qs.y /= 1.18;
            r = opU(r, vec2(disc(qs, 0.068, 0.012), M_WHITE));
            r = opU(r, vec2(disc(qo - vec3(LOOK.x * 0.028, LOOK.y * 0.03, 0.016), 0.028, 0.008), M_BLACK));
        } else {
            r = opU(r, vec2(sdCapsule(qo, vec3(-0.05, 0.0, 0.01), vec3(0.05, 0.0, 0.01), 0.012), M_BLACK));
        }
        // glasses: a rolled black snake round each eye, arms to the ears
        r = opU(r, vec2(sdTorus((qo - vec3(0.0, 0.0, 0.035)).xzy, vec2(0.098, 0.014)), M_BLACK));
        r = opU(r, vec2(sdCapsule(q, vec3(0.21 * s, 0.09, 0.24), vec3(0.33 * s, 0.07, 0.02), 0.011), M_BLACK));
        // lashes: two little flicks at the outer corner; earrings: coral balls
        if (closed < 0.5) for (int k = 0; k < 2; k++) {
            vec3 l0 = vec3(0.058 * s, 0.035 - float(k) * 0.02, 0.01);
            r = opU(r, vec2(sdCapsule(qo, l0, l0 + vec3(0.03 * s, 0.018, 0.0), 0.006), M_BLACK));
        }
        r = opU(r, vec2(sdSphere(q - vec3(0.35 * s, -0.12, 0.0), 0.028), M_CORAL));
        // eyebrows: brown sausages above the glasses, raised with BROW
        vec3 qb = q - vec3(0.12 * s, 0.19 + 0.025 * BROW, 0.285);
        qb.xy = rot(-0.12 * s * (1.0 - BROW)) * qb.xy;
        r = opU(r, vec2(sdCapsule(qb, vec3(-0.05, 0.0, 0.0), vec3(0.05, 0.0, 0.0), 0.016), M_HAIR));
    }
    r = opU(r, vec2(sdCapsule(q, vec3(-0.03, 0.09, 0.325), vec3(0.03, 0.09, 0.325), 0.012), M_BLACK)); // bridge
    // nose: a ball pressed on
    r = opU(r, vec2(sdEllipsoid(q - vec3(0.0, -0.02, 0.325), vec3(0.068, 0.058, 0.06)) + lumps(q, 0.004), M_NOSE));
    // mouth: a flat piece pressed on: a curved sausage (smile) or a D (grin) with a teeth strip
    vec3 qm = q - vec3(0.0, -0.175, 0.29);
    qm.y -= 3.2 * qm.x * qm.x;
    if (GRIN < 0.5) r = opU(r, vec2(sdCapsule(qm, vec3(-0.075, 0.0, 0.0), vec3(0.075, 0.0, 0.0), 0.014), M_MOUTH));
    else {
        float m = smax(sdEllipsoid(qm - vec3(0.0, -0.01, 0.0), vec3(0.085, 0.06, 0.03)), qm.y - 0.012, 0.01);
        r = opU(r, vec2(m, M_MOUTH));
        r = opU(r, vec2(sdRoundBox(qm - vec3(0.0, -0.002, 0.022), vec3(0.06, 0.012, 0.01), 0.008), M_WHITE));
    }
    // hair: clumps of clay over the top and back, a bun on top
    // a cap over the crown, a fringe of clumps along the hairline, clumps down the sides, a bun
    float hair = sdEllipsoid(q - vec3(0.0, 0.14, -0.04), vec3(0.355, 0.3, 0.32));
    hair = smax(hair, -(q.y - 0.14 + 0.25 * max(q.z, 0.0)), 0.03); // cut above the forehead
    for (int i = 0; i < 7; i++) {
        float fi = float(i), a = -1.1 + fi * 0.366;
        vec3 c = vec3(sin(a) * 0.26, 0.26 + 0.035 * cos(fi * 2.3), 0.2 * cos(a) + 0.02);
        hair = min(hair, sdEllipsoid(q - c, vec3(0.085, 0.07, 0.07) * (0.9 + 0.2 * hash(vec3(fi, 1.0, 2.0)))));
    }
    for (int i = 0; i < 6; i++) {
        float fi = float(i), s = i < 3 ? -1.0 : 1.0, k = mod(fi, 3.0);
        hair = min(hair, sdEllipsoid(q - vec3(0.31 * s, 0.12 - k * 0.1, -0.06 - k * 0.03), vec3(0.075, 0.085, 0.09)));
    }
    hair = min(hair, sdEllipsoid(q - vec3(0.0, 0.47, -0.1), vec3(0.14, 0.13, 0.14))); // bun
    hair = min(hair, sdTorus((q - vec3(0.0, 0.39, -0.08)), vec2(0.1, 0.022)));          // its band
    hair += lumps(q * 1.3, 0.008);
    r = opU(r, vec2(hair, M_HAIR));
    return r;
}

// ---- a hand in its own frame: wrist at 0, fingers along +y, palm to +z (the camera).
// pose 0: open (a wave), 1: thumbs up. Built as her RIGHT hand (the thumb on +x with the
// palm to the camera); the left hand mirrors x.
mat3 eul(vec3 a) {
    float cx = cos(a.x), sx = sin(a.x), cy = cos(a.y), sy = sin(a.y), cz = cos(a.z), sz = sin(a.z);
    mat3 rx = mat3(1, 0, 0, 0, cx, sx, 0, -sx, cx), ry = mat3(cy, 0, -sy, 0, 1, 0, sy, 0, cy), rz = mat3(cz, sz, 0, -sz, cz, 0, 0, 0, 1);
    return rz * ry * rx;
}
// chunky clay hands, like the references: a thick palm, short fat fingers (sausages rolled
// between the palms), a fat thumb; built at HS× and scaled back, so the proportions stay
const float HS = 1.3;
float handSDF(vec3 q, float pose) {
    q /= HS;
    float d;
    if (pose < 0.5) {
        d = sdEllipsoid(q - vec3(0.0, 0.065, 0.0), vec3(0.06, 0.066, 0.036));
        for (int i = 0; i < 4; i++) {
            float fi = float(i), x = -0.042 + fi * 0.028, a = (fi - 1.5) * 0.16;
            float L = fi == 1.0 ? 0.064 : fi == 3.0 ? 0.044 : 0.056;
            vec3 b = vec3(x, 0.11, 0.0);
            d = smin(d, sdCapsule(q, b, b + vec3(sin(a), cos(a), 0.0) * L, 0.0165 - fi * 0.0012), 0.014);
        }
        d = smin(d, sdCapsule(q, vec3(0.045, 0.045, 0.0), vec3(0.092, 0.092, 0.012), 0.02), 0.014);
    } else {
        d = sdEllipsoid(q - vec3(0.0, 0.06, 0.0), vec3(0.062, 0.062, 0.05));
        for (int i = 0; i < 4; i++) {
            float y = 0.098 - float(i) * 0.031;
            d = smin(d, sdCapsule(q, vec3(-0.046, y, 0.036), vec3(0.028, y, 0.05), 0.019), 0.01);
        }
        d = smin(d, sdCapsule(q, vec3(0.04, 0.1, 0.012), vec3(0.046, 0.175, 0.004), 0.022), 0.012);
    }
    return (d + lumps(q * 2.0, 0.003)) * HS;
}
// the sleeve: upper arm and forearm, thick sausages
float sleeve(vec3 p, float s, vec3 el, vec3 wr) {
    vec3 sh = vec3(0.34 * s, 1.14 + BREATH, -0.02);
    return min(sdCapsule(p, sh, el, 0.1), sdRoundCone(p, el, wr, 0.095, 0.082)) + lumps(p * 1.5, 0.006);
}
// the cuff and the hand, in the hand's frame (s = -1: her right hand, image left)
vec2 handPart(vec3 p, float s, vec3 wr, vec3 rt, float pose) {
    vec3 q = transpose(eul(rt)) * (p - wr);
    if (s > 0.0) q.x = -q.x;
    vec2 r = vec2(sdCylinder(q - vec3(0.0, -0.012, 0.0), 0.03, 0.074) - 0.014 + lumps(q * 3.0, 0.003), M_CREAM);
    return opU(r, vec2(handSDF(q, pose), M_SKIN));
}

// ---- the torso: a cardigan slab with pressed-on pieces
vec2 torso(vec3 p) {
    vec3 q = p - vec3(0.0, BREATH, 0.0);
    // a lump of clay, not a box: a pear of ellipsoids pressed together (flat faces on a box
    // leave lines in the soft shadow where they meet the rounded edges)
    float d = sdEllipsoid(q - vec3(0.0, 0.62, -0.02), vec3(0.37, 0.5, 0.23));
    d = smin(d, sdEllipsoid(q - vec3(0.0, 0.98, -0.02), vec3(0.36, 0.24, 0.21)), 0.12);
    d = smin(d, sdEllipsoid(q - vec3(0.0, 1.12, -0.02), vec3(0.42, 0.13, 0.2)), 0.1);
    d += lumps(q, 0.01);
    vec2 r = vec2(d, M_NAVY);
    r = opU(r, vec2(sdCapsule(q, vec3(0.0, 1.14, -0.02), vec3(0.0, 1.32, -0.02), 0.1) + lumps(q, 0.004), M_SKIN)); // neck
    // the shirt V: a flat cream piece; the collar: two flat strips; the cardigan's front edges
    vec3 qv = q - vec3(0.0, 1.06, 0.19);
    float v = smax(disc(qv, 0.14, 0.012), -qv.y - 0.12 + abs(qv.x) * 1.6, 0.01);
    r = opU(r, vec2(v, M_CREAM));
    for (int i = 0; i < 2; i++) {
        float s = i == 0 ? -1.0 : 1.0;
        vec3 qc = q - vec3(0.075 * s, 1.18, 0.12);
        qc.xy = rot(0.55 * s) * qc.xy;
        qc.yz = rot(-0.4) * qc.yz;
        r = opU(r, vec2(sdRoundBox(qc, vec3(0.08, 0.035, 0.012), 0.012), M_CREAM));
        r = opU(r, vec2(sdCapsule(q, vec3(0.1 * s, 1.1, 0.19), vec3(0.015 * s, 0.84, 0.22), 0.022), M_NAVY));
    }
    for (int i = 0; i < 2; i++) r = opU(r, vec2(disc(q - vec3(0.0, 0.76 - float(i) * 0.14, 0.215), 0.024, 0.008), M_CORAL));
    // the brand badge on her left chest: the logo's cloud and bar (lobes from its SVG), flat
    vec3 c = (q - vec3(0.2, 0.98, 0.215)) / 0.0017;
    vec2 cxy = vec2(c.x + 46.35, 34.76 - c.y);
    float cl = length(cxy - vec2(13.6, 43.1)) - 13.6;
    cl = smin(cl, length(cxy - vec2(20.6, 24.8)) - 13.2, 3.0);
    cl = smin(cl, length(cxy - vec2(55.4, 24.0)) - 24.0, 3.0);
    cl = smin(cl, length(cxy - vec2(79.4, 43.1)) - 13.3, 3.0);
    vec2 bq = abs(cxy - vec2(47.0, 42.0)) - vec2(38.0, 10.0);
    cl = smin(cl, length(max(bq, 0.0)) + min(max(bq.x, bq.y), 0.0), 4.0);
    cl = max(cl, cxy.y - 52.9);
    vec2 bb = abs(cxy - vec2(46.3, 66.2)) - vec2(43.0, 3.3);
    float bar = length(max(bb, 0.0)) + min(max(bb.x, bb.y), 0.0);
    float badge = max(min(cl, bar), abs(c.z) - 6.0);
    r = opU(r, vec2(badge * 0.0017, M_CORAL));
    return r;
}

vec2 map(vec3 p) {
    // the seamless backdrop: floor and wall joined by a big curve (a paper sweep)
    vec2 r = vec2(smin(p.y, p.z + 1.4, 1.2), M_BACK);
    const float BOUND = 0.05; // bounds return material 0: the soft shadows skip them
    float bb = length(p - vec3(0.0, 1.2, 0.0)) - 1.6; // wide: it must hold her penumbra too
    if (bb > BOUND) return opU(r, vec2(bb, 0.0));
    float bh = length(p - HC) - 0.62;
    r = opU(r, bh > BOUND ? vec2(bh, 0.0) : head(p));
    // the sleeves pressed onto the torso: a smooth clay join, same material
    vec2 body = torso(p);
    body = opSU(body, vec2(min(sleeve(p, -1.0, ELR, WRR), sleeve(p, 1.0, ELL, WRL)), M_NAVY), 0.04);
    r = opU(r, body);
    r = opU(r, handPart(p, -1.0, WRR, ROTR, POSER));
    r = opU(r, handPart(p, 1.0, WRL, ROTL, POSEL));
    return r;
}

vec3 albedo(float m, vec3 p, vec3 n) {
    vec3 c = vec3(0.5);
    if (m == M_BACK) return vec3(0.95, 0.7, 0.68) * (0.97 + 0.03 * noise(p * 3.0));
    if (m == M_SKIN) c = vec3(0.93, 0.71, 0.56);
    else if (m == M_NOSE) c = vec3(0.92, 0.62, 0.5);
    else if (m == M_PINK) c = vec3(0.96, 0.55, 0.52);
    else if (m == M_WHITE) c = vec3(0.97, 0.95, 0.9);
    else if (m == M_BLACK) c = vec3(0.1, 0.09, 0.1);
    else if (m == M_HAIR) c = vec3(0.36, 0.2, 0.12);
    else if (m == M_NAVY) {
        // the knit pressed in with a tool: rows of short vertical dashes, as in the references
        c = vec3(0.16, 0.26, 0.55);
        vec2 g = vec2(p.x * 34.0, p.y * 17.0);
        g.x += 0.5 * mod(floor(g.y), 2.0);
        vec2 f = fract(g) - 0.5;
        float dash = smoothstep(0.09, 0.05, abs(f.x)) * smoothstep(0.32, 0.26, abs(f.y));
        c *= 1.0 - 0.28 * dash;
    }
    else if (m == M_CREAM) c = vec3(0.95, 0.9, 0.8);
    else if (m == M_CORAL) c = vec3(0.84, 0.34, 0.24);
    else if (m == M_MOUTH) c = vec3(0.62, 0.2, 0.17);
    // pigment speckle and a little dust
    return c * (1.0 - 0.1 * step(0.95, hash(floor(p * 320.0)))) + 0.025 * step(0.994, hash(floor(p * 200.0) + 7.0));
}
vec4 material(float m) {
    // matte clay: a faint broad sheen, translucency on skin, bump for fingerprints
    if (m == M_BACK) return vec4(0.0, 4.0, 0.0, 0.0);
    if (m == M_BLACK) return vec4(0.12, 12.0, 0.0, 0.6);
    if (m == M_WHITE) return vec4(0.08, 8.0, 0.2, 0.8);
    if (m == M_SKIN || m == M_NOSE) return vec4(0.06, 5.0, 0.4, 1.4);
    return vec4(0.05, 5.0, 0.3, 1.4);
}
vec3 background(vec3 rd) { return vec3(0.95, 0.7, 0.68); }
`;
