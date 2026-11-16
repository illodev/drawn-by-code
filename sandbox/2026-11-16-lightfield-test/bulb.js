// lightfield-test · shot 2 · Bulb: a filament heats up inside a dusty amber bulb in front of
// a blue wall, and the title lights with it. Built on the user's reference still
// (private/bulb169.png, not committed). The numbers are in that still's pixels (1272 × 716,
// y down): the glass outline (a sphere over a measured neck profile), the filament, the
// wires, the stem, the cap and its thread, the wall's blues and the pink haze were all read
// off it. Nothing here is a 3D render: the glass is a surface of revolution shaded
// analytically (normal from the profile, reflections of three soft lights looked up by
// direction), which is exact for a long lens and costs one evaluation per pixel.
window.LFT = window.LFT ?? {};
LFT.bulb = {
    // the instant that reproduces the reference still (title aside)
    MATCH: 4.5,
    glsl: `
#define HEAT uA[0]      // 0 cold … 1 at working temperature (overshoots a little)
#define ZOOM uA[1]
#define TITLE uA[2]
#define KEYL uA[3]      // the studio lights
#define SWEEP uA[4]     // a glint travelling along the title, in frame x
const vec2 AXIS = vec2(658.0, 274.0);   // the bulb's axis and the centre of its sphere
const float RS = 203.0;                 // the sphere's radius
const vec2 FIL_A = vec2(595.0, 257.0), FIL_B = vec2(737.0, 255.0);
// the neck: radius every 20 px down from y = 275
const float NECK[17] = float[17](203.0, 202.0, 200.0, 196.0, 191.0, 183.0, 173.0, 162.0, 149.0, 138.0, 131.5, 128.0, 126.5, 125.5, 125.0, 119.0, 86.0);
float neck(float y) {
    float x = clamp((y - 275.0) / 20.0, 0.0, 15.999);
    int i = int(floor(x)); float f = x - float(i);
    float a = NECK[max(i - 1, 0)], b = NECK[i], c = NECK[i + 1], d = NECK[min(i + 2, 16)];
    return b + 0.5 * f * (c - a + f * (2.0 * a - 5.0 * b + 4.0 * c - d + f * (3.0 * (b - c) + d - a)));
}
float prof(float y) { float d = 274.0 - y; return y < 274.0 ? sqrt(max(RS * RS - d * d, 0.0)) : neck(y); }
float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
float bez(vec2 p, vec2 a, vec2 b, vec2 c) {
    float d = 1e9; vec2 q = a;
    for (int i = 1; i <= 8; i++) { float t = float(i) / 8.0; vec2 n = mix(mix(a, b, t), mix(b, c, t), t); d = min(d, seg(p, q, n)); q = n; }
    return d;
}
// the filament's line: a shallow scallop between its supports
float filY(float x) { return 256.0 + 1.1 * cos((x - 595.0) * 0.106) - 0.012 * (x - 666.0); }
// a soft light somewhere around the bulb, seen in a reflection: direction, half angle, softness
float lamp(vec3 r, vec3 d, float ang, float soft) { return smoothstep(cos(ang + soft), cos(ang), dot(r, normalize(d))); }
// the wall: a dark blue backdrop, mottled, brighter behind the bulb, with a pink haze up right
vec3 wall(vec2 P) {
    vec2 q = P / 716.0;
    float cl = fbm(q * 2.3 + 4.0), cl2 = fbm(q * 7.0 + 11.0);
    vec3 base = mix(vec3(0.004, 0.115, 0.235), vec3(0.008, 0.20, 0.42), sat(cl * 1.9 - 0.4));
    float pool = exp(-dot((P - vec2(800.0, 360.0)) / vec2(400.0, 300.0), (P - vec2(800.0, 360.0)) / vec2(400.0, 300.0)));
    base = mix(base, vec3(0.13, 0.32, 0.50), 0.8 * pool * (0.55 + 0.9 * cl2));
    vec2 e = (P - vec2(636.0, 330.0)) / vec2(760.0, 480.0);
    base *= 1.0 - 0.48 * smoothstep(0.35, 1.25, dot(e, e));
    base *= 1.0 - 0.10 * smoothstep(520.0, 716.0, P.y);
    vec3 c = emit(base * (0.82 + 0.36 * cl2));
    // scuffs and specks on the wall
    vec2 g = P / 46.0, i = floor(g); vec3 h = hash3(i + 3.0);
    vec2 f = (fract(g) - 0.2 - 0.6 * h.xy) * 46.0; float an = h.z * 6.283;
    float dash = seg(f, vec2(0.0), vec2(cos(an), sin(an)) * (2.0 + 9.0 * h.x));
    c += emit(vec3(0.09, 0.19, 0.32)) * step(0.82, h.y) * smoothstep(1.2, 0.3, dash) * (0.25 + 0.6 * h.z);
    return c;
}
vec3 haze(vec2 P) {
    vec2 d = (P - vec2(890.0, 150.0)) / vec2(165.0, 135.0);
    vec2 d2 = (P - vec2(735.0, 52.0)) / vec2(150.0, 60.0);
    vec2 d3 = (P - vec2(850.0, 185.0)) / vec2(75.0, 95.0);
    float n = 0.45 + 1.1 * fbm(P / 95.0 + vec2(uT * 0.02, 7.0));
    return (emit(vec3(0.76, 0.60, 0.60)) * 1.15 * exp(-dot(d, d) * 1.5) + emit(vec3(0.60, 0.55, 0.64)) * 0.75 * exp(-dot(d2, d2) * 1.4)) * n
         + emit(vec3(0.80, 0.72, 0.72)) * 0.55 * exp(-dot(d3, d3) * 1.4);
}
// flecks of dust caught in a beam: short dashes, each drifting slowly in its own cell
float flecks(vec2 P, float cell, float seed) {
    vec2 g = P / cell, i = floor(g);
    vec3 h = hash3(i + seed), k = hash3(i + seed + 51.0);
    vec2 c = 0.5 + 0.3 * vec2(sin(uT * (0.2 + 0.4 * k.x) + h.x * 6.283), cos(uT * (0.15 + 0.4 * k.y) + h.y * 6.283));
    float an = 0.9 + 1.6 * (k.z - 0.5);
    // most are points, a few are streaks; most are faint, a few catch the light
    vec2 f = (fract(g) - c) * cell, dir = vec2(cos(an), sin(an)) * cell * 0.15 * pow(h.z, 3.0);
    float w = 0.35 + 0.5 * k.x * k.x;
    return step(0.25, h.y) * (0.08 + 0.92 * pow(k.y, 4.0)) * smoothstep(w + 0.9, w - 0.5, seg(f, -dir, dir));
}
// the light of the filament at a point of the glass, a wire, the stem
float glow(vec2 P) { float d = seg(P, FIL_A, FIL_B); return 1.0 / (1.0 + d * d / 3000.0); }
vec3 radiance(vec2 p) {
    vec2 fc = vec2((666.0 - 636.0) / 716.0, (358.0 - 256.0) / 716.0);
    vec2 pf = (p - fc) / ZOOM + fc, pw = (p - fc) / mix(1.0, ZOOM, 0.45) + fc;
    vec2 P = vec2(pf.x * 716.0 + 636.0, 358.0 - pf.y * 716.0);   // the subject, in the still's pixels
    vec2 PW = vec2(pw.x * 716.0 + 636.0, 358.0 - pw.y * 716.0);  // the wall behind, further away
    float aa = 716.0 * uPx / ZOOM;
    vec3 hot = blackbody(1000.0 + 1750.0 * min(HEAT, 1.1)) * HEAT * HEAT * HEAT;
    vec3 hz = haze(PW);
    vec3 c = wall(PW) + (hz * 0.62 + (hz + emit(vec3(0.5, 0.5, 0.55)) * dot(hz, vec3(0.6))) * 1.25 * (flecks(PW, 10.0, 1.0) + flecks(PW + 40.0, 21.0, 2.0))) * (0.55 + 0.45 * sat(HEAT));

    // ---- the cap: black metal, far out of focus; its thread only shows as blobs of light
    {
        float dx = P.x - 654.0, hw = 86.0 - 3.0 * smoothstep(585.0, 600.0, P.y);
        float cov = smoothstep(hw + 6.0, hw - 6.0, abs(dx)) * smoothstep(571.0, 583.0, P.y);
        vec3 m = emit(vec3(0.060, 0.085, 0.125)) * (0.75 + 0.4 * exp(-dx * dx / 2500.0));
        float k = (P.y - 590.0) / 14.3;
        float ridge = 0.5 + 0.5 * cos(k * 6.283);
        m += emit(vec3(0.07, 0.085, 0.115)) * ridge * 0.12 * smoothstep(70.0, 20.0, abs(dx));
        for (int s = 0; s < 2; s++) {
            float sx = s == 0 ? -80.0 : 82.0, ko = k - (s == 0 ? 0.0 : 0.45);
            for (int j = -1; j <= 1; j++) {
                float ki = floor(ko + 0.5) + float(j);
                vec3 hh = hash3(vec2(ki, float(s) * 7.0 + 2.0));
                vec2 d = vec2(dx - sx - 9.0 * (hh.y - 0.5), (ko - ki) * 14.3 - 4.0 * (hh.z - 0.5));
                // an out-of-focus glint on one turn of the thread: a soft dash, slanted with the helix
                float b = (0.10 + 1.5 * hh.x * hh.x + 0.3 * hh.y) * step(-0.5, ki);
                vec2 dd = rot((s == 0 ? 0.42 : -0.42) + 0.5 * (hh.z - 0.5)) * d / vec2(6.0 + 5.0 * hh.z, 3.2 + 1.8 * hh.y);
                m += KEYL * emit(vec3(0.80, 0.87, 0.95)) * 1.5 * b * exp(-dot(dd, dd) * 1.1) * (s == 0 ? 0.9 : 1.0);
            }
        }
        // warm glints: the filament in the thread
        m += hot * vec3(1.0, 1.0, 0.5) * 5.0 * smoothstep(5.0, 3.4, length(P - vec2(682.0, 635.0)));
        m += hot * 0.10 * smoothstep(9.0, 3.0, length((P - vec2(668.0, 617.0)) * vec2(0.5, 1.2))) + hot * vec3(1.0, 0.9, 0.5) * 0.5 * smoothstep(3.6, 2.0, length(P - vec2(678.0, 664.0)));
        // the brass rim, blurred into a band
        float rim = exp(-(P.y - 578.0) * (P.y - 578.0) / 13.0) * smoothstep(92.0, 62.0, abs(dx));
        m += (KEYL * emit(vec3(0.55, 0.45, 0.25)) * 0.9 + emit(vec3(0.90, 0.76, 0.44)) * sat(HEAT) * 2.2 * (0.3 + exp(-dx * dx / 1800.0))) * rim * (0.55 + 0.9 * noise(vec2(P.x * 0.11, 3.0)));
        c = mix(c, m, cov);
    }

    // ---- the glass
    float dx = P.x - AXIS.x, r = prof(P.y);
    float top = step(71.0, P.y) * step(P.y, 592.0);
    float cov = smoothstep(r + aa, r - aa, abs(dx)) * top;
    if (cov > 0.0) {
        float nxr = clamp(dx / max(r, 1.0), -1.0, 1.0);
        float rdr = P.y < 274.0 ? (274.0 - P.y) : r * 0.5 * (prof(P.y + 1.0) - prof(P.y - 1.0));
        vec3 N = normalize(vec3(dx, rdr, sqrt(max(r * r - dx * dx, 0.0)) + 1.0));
        vec3 R = vec3(2.0 * N.z * N.x, 2.0 * N.z * N.y, 2.0 * N.z * N.z - 1.0);
        float fres = 0.04 + 0.96 * pow(1.0 - N.z, 5.0);
        float gl = glow(P);
        // the dust on the glass: a fine tooth and sparse bright specks
        // (a grain of sand a pixel across, in clumps; one grain in seventy catches the light)
        float tooth = (0.76 + 0.48 * hash(floor(P * 1.15))) * (0.78 + 0.44 * noise(P * 0.31));
        float speck = step(0.986, hash(floor(P / 1.6) + 5.0)) * (0.4 + 1.6 * hash(floor(P / 1.6) + 9.0));
        float dust = tooth + 0.9 * speck;
        // the body: smoky amber glass, lit from above right by the studio and from inside
        float up = sat((300.0 - P.y) / 230.0);
        vec3 body = emit(mix(vec3(0.15, 0.135, 0.15), vec3(0.50, 0.37, 0.25), up * up * sqrt(up)) * (0.75 + 0.25 * sat(0.6 + 0.6 * N.x + 0.5 * N.y))) * KEYL;
        // the filament in the glass. Measured on the still (red channel, as radiance): 0.9 at
        // 28 px off the filament's end, but 1.7 at 55 px above its middle and still 0.8 at 85:
        // the dome above the wire is the screen its light falls on. So: a tight falloff round
        // the wire plus a lobe over it. Amber glass keeps the red: the glow is redder than
        // the filament.
        vec2 lobe = (P - vec2(662.0, 205.0)) / vec2(72.0, 44.0);
        vec3 lit = hot * vec3(1.0, 0.38, 0.27) * (0.9 * gl * sqrt(gl) + 1.45 * exp(-dot(lobe, lobe)) + 0.30 * exp(-dot(lobe, lobe) * 0.3));
        float cloud = 0.30 + 1.45 * fbm(P / 44.0 + 9.0);
        vec3 g = (body * dust + lit * cloud * (tooth + 0.9 * speck) + (hot * 0.3 + KEYL * 0.03) * speck * gl * 1.3) * mix(1.0, 0.28, smoothstep(0.42, 0.80, N.x));
        // what shows through from the wall behind: little, and less in the amber dome
        g += c * mix(0.05, 0.16, smoothstep(380.0, 520.0, P.y));
        // the back light soaking through the dusty dome, up right
        g += haze(P) * dust * 0.12 * up;

        // -- inside: the filament's reflection on the far wall, a pale blob above it
        { vec2 d = (P - vec2(655.0, 228.0)) / vec2(25.0, 12.0); g += hot * vec3(0.8, 1.0, 0.42) * 5.0 * smoothstep(1.25, 0.5, dot(d, d) + 0.7 * (noise(P * 0.16) - 0.5)) * (0.5 + 1.0 * noise(P * 0.23 + 3.0)) * dust; }
        // -- the wires: two leads and two supports, gilded by the filament
        {
            float w = 1e9;
            w = min(w, bez(P, vec2(595.0, 259.0), vec2(603.0, 318.0), vec2(634.0, 414.0)));
            w = min(w, bez(P, vec2(737.0, 255.0), vec2(729.0, 318.0), vec2(690.0, 414.0)));
            w = min(w, bez(P, vec2(653.0, 258.0), vec2(650.0, 310.0), vec2(657.0, 398.0)));
            w = min(w, bez(P, vec2(712.0, 257.0), vec2(708.0, 320.0), vec2(668.0, 398.0)));
            w = min(w, bez(P, vec2(701.0, 257.0), vec2(700.0, 300.0), vec2(696.0, 332.0)) + 0.3);
            float wl = smoothstep(1.25 + aa, 1.25 - aa, w);
            float wg = glow(P);
            g = mix(g, emit(vec3(0.06, 0.05, 0.05)) * KEYL + hot * vec3(1.0, 0.8, 0.35) * (9.0 * wg * wg + 0.25 * wg), wl);
        }
        // -- the stem: a lump of pinched glass with the wires sealed in it, on a glass tube.
        // Glass shows as what it reflects, so both are a height field (a lens-shaped lump
        // with ripples; a cylinder with a slight wobble) whose normal picks up the filament
        // above (gold) and the studio light (white).
        {
            vec2 sp = P - vec2(658.0, 446.0);
            // the press: a shield, wider at the shoulders, pinched at the waist
            float ph = 31.0 + 4.0 * cos(sp.y * 0.075) + 3.0 * smoothstep(20.0, 40.0, sp.y) + 2.0 * noise(vec2(sp.y * 0.09, 3.0 + sign(sp.x)));
            float pc = smoothstep(ph + aa, ph - aa, abs(sp.x)) * smoothstep(-43.0, -37.0, sp.y + 4.0 * abs(sp.x) / ph) * step(sp.y, 41.0);
            // its relief, and the normal from it (three taps)
            #define PRESS(q) (20.0 * sqrt(max(1.0 - (q).x * (q).x / (ph * ph), 0.0)) + 16.0 * fbm((q) * vec2(0.06, 0.045) + 3.0))
            float h0 = PRESS(sp), hx = PRESS(sp + vec2(1.5, 0.0)), hy = PRESS(sp + vec2(0.0, 1.5));
            vec3 pn = normalize(vec3(-(hx - h0) / 1.5, (hy - h0) / 1.5, 1.0));
            vec3 toFil = normalize(vec3(0.0, 1.0, 0.45)), toKey = normalize(vec3(0.75, 0.2, 0.62));
            float gold = pow(sat(dot(pn, toFil)), 7.0), white = pow(sat(dot(pn, toKey)), 40.0);
            float edge = smoothstep(ph - 9.0, ph - 1.0, abs(sp.x));
            vec3 press = emit(vec3(0.19, 0.16, 0.16)) * KEYL * (0.35 + 1.3 * fbm(sp * 0.07 + 8.0));
            press += hot * vec3(1.0, 0.76, 0.26) * (2.6 * gold + 1.1 * edge * (0.3 + noise(vec2(sp.y * 0.16, 5.0 + sign(sp.x)))) + 0.10);
            press += KEYL * vec3(0.95, 0.97, 1.0) * 3.0 * white;
            // the wires sealed in the glass: dark where they block the light, gold where they catch it
            float w1 = seg(P, vec2(680.0, 404.0), vec2(679.0, 492.0)), w2 = seg(P, vec2(641.0, 404.0), vec2(644.0, 492.0));
            press = mix(press, emit(vec3(0.04, 0.035, 0.035)), 0.85 * smoothstep(1.7, 0.7, min(w1, w2)));
            float loop = min(abs(length((P - vec2(651.0, 450.0)) * vec2(1.0, 0.82)) - 10.5), bez(P, vec2(660.0, 446.0), vec2(668.0, 455.0), vec2(664.0, 472.0)));
            press += hot * vec3(1.0, 0.8, 0.35) * 2.2 * smoothstep(1.5, 0.3, loop) * (0.4 + 0.9 * noise(P * 0.3));
            g = mix(g, press, pc);
            // wire ends bent out at the shoulders, gilded
            float hook = min(seg(P, vec2(627.0, 414.0), vec2(628.5, 441.0)), min(seg(P, vec2(684.0, 428.0), vec2(711.0, 426.5)), seg(P, vec2(628.0, 414.0), vec2(637.0, 409.0))));
            g += hot * vec3(1.0, 0.8, 0.3) * 3.2 * smoothstep(2.8, 1.0, hook) * (0.55 + 0.6 * noise(P * 0.4 + 3.0));
            // where the press meets the tube: a meniscus of glass, the brightest gold of the stem
            float men = P.y - (485.0 + 3.0 * cos(sp.x * 0.075) + 1.5 * sin(sp.x * 0.31));
            g += hot * vec3(1.0, 0.8, 0.25) * 2.4 * exp(-men * men / 9.0) * smoothstep(42.0, 34.0, abs(sp.x)) * (0.3 + 1.3 * noise(vec2(P.x * 0.17, 1.0)));
            // the tube
            float th = 41.0 + 5.0 * smoothstep(490.0, 577.0, P.y);
            float shoulder = 487.0 + 9.0 * (1.0 - sqrt(max(1.0 - sp.x * sp.x / (th * th), 0.0)));
            float tc = smoothstep(th + aa, th - aa, abs(sp.x)) * smoothstep(shoulder - 1.0, shoulder + 1.5, P.y) * step(P.y, 579.0);
            float u = sp.x / th + 0.035 * (fbm(vec2(P.x * 0.03, P.y * 0.045) + 4.0) - 0.5);
            // strip lights in the cylinder: where each sits across the tube was read off the still
            float hl = 0.55 * exp(-(u + 0.91) * (u + 0.91) / 0.006) + 1.0 * exp(-(u + 0.325) * (u + 0.325) / 0.0007) + 0.75 * exp(-(u + 0.20) * (u + 0.20) / 0.0005)
                     + 1.0 * exp(-(u - 0.21) * (u - 0.21) / 0.0011) + 0.35 * exp(-(u - 0.52) * (u - 0.52) / 0.0006) + 0.8 * exp(-(u - 0.84) * (u - 0.84) / 0.008);
            float brk = (0.45 + 0.75 * noise(vec2(u * 7.0, P.y * 0.035) + 2.0)) * (0.8 + 0.3 * noise(vec2(u * 30.0, P.y * 0.2)));
            vec3 tube = emit(vec3(0.17, 0.15, 0.17)) * KEYL * (0.55 + 1.0 * u * u) + emit(vec3(0.30, 0.31, 0.34)) * KEYL * 0.35 * smoothstep(0.55, 1.0, abs(u));
            tube += KEYL * emit(vec3(0.90, 0.92, 0.95)) * 1.25 * hl * brk * smoothstep(shoulder, shoulder + 12.0, P.y);
            tube += hot * vec3(1.0, 0.75, 0.3) * 0.5 * hl * brk * smoothstep(545.0, 495.0, P.y);
            g = mix(g, tube, tc * 0.94);
        }
        // -- the filament itself: a coil, seen as a fine zigzag until it burns out the film
        {
            float inx = smoothstep(594.0, 597.0, P.x) * smoothstep(738.0, 735.0, P.x);
            float d = abs(P.y - filY(P.x));
            float thick = 5.2 * (0.62 + 0.75 * noise(vec2(P.x * 0.21, 2.0)));
            float coil = smoothstep(thick + aa, thick - aa, d) * inx;
            float turns = 0.45 + 0.55 * abs(sin(P.x * 0.9 + 1.4 * (P.y - filY(P.x)) / 4.2));
            g = mix(g, emit(vec3(0.10, 0.09, 0.09)) * KEYL * turns, coil * 0.9);
            g += hot * 480.0 * coil * turns;
            // the wire flares where it is clamped to its leads, and dust burns around it
            vec2 e1 = P - vec2(594.0, 258.0), e2 = P - vec2(738.0, 255.0);
            g += hot * 260.0 * (smoothstep(4.5, 2.0, length(e1 * vec2(1.0, 0.7))) + smoothstep(4.5, 2.0, length(e2 * vec2(1.0, 0.7))));
            float fd = seg(P, FIL_A, FIL_B);
            g += hot * 55.0 * step(0.975, hash(floor(P / 1.4) + 3.0)) * hash(floor(P / 1.4) + 8.0) * exp(-fd / 11.0) * step(P.y, 330.0);
        }

        // -- reflections on the near side of the glass
        // the key: a tall soft box behind and to the right. On the still it is a blown strip
        // just inside the right edge (4 to 40 px in, from y = 120 to 335, wider low down),
        // feathered inward through the dust and notched at the bottom by the box's frame,
        // under a soft creamy cloud where the dome's dust scatters it
        float edgeD = r - abs(dx);
        float kw = mix(56.0, 26.0, smoothstep(238.0, 318.0, P.y)) + 13.0 * (noise(P * 0.045 + 5.0) - 0.5);
        float key = step(0.0, dx) * smoothstep(4.0, 9.0, edgeD) * smoothstep(kw * 1.15, kw * 0.45, edgeD) * mix(0.13, 1.0, smoothstep(95.0, 185.0, P.y)) * smoothstep(74.0, 92.0, P.y) * smoothstep(338.0, 318.0, P.y);
        key *= 1.0 - 0.9 * smoothstep(284.0, 296.0, P.y) * smoothstep(0.42, 0.56, noise(vec2(P.x * 0.07 + P.y * 0.05, P.y * 0.11)));
        key *= 0.75 + 0.5 * tooth;
        vec2 kc = (P - vec2(776.0, 152.0)) / vec2(58.0, 46.0);
        float kcloud = 0.35 * exp(-dot(kc, kc) * 1.3) * step(0.0, edgeD);
        vec3 refl = KEYL * vec3(1.0, 0.95, 0.88) * (3.3 * key * key + emit(vec3(0.86, 0.76, 0.68)) * 0.95 * kcloud * dust);
        // a weak fill from the left, and the room in the rim
        refl += KEYL * emit(vec3(0.62, 0.63, 0.52)) * 1.5 * lamp(R, vec3(-0.5, 0.0, -0.86), 0.26, 0.14) * fres * 2.0;
        refl += KEYL * emit(vec3(0.30, 0.36, 0.44)) * 1.0 * smoothstep(0.6, 1.0, fres);
        // a top light on the dome
        refl += KEYL * emit(vec3(0.66, 0.50, 0.39)) * 0.6 * smoothstep(0.35, 0.9, N.y) * smoothstep(0.85, 0.25, N.z) * smoothstep(0.75, 0.1, N.x) * dust;
        refl += KEYL * emit(vec3(0.50, 0.42, 0.33)) * 0.55 * smoothstep(0.62, 0.05, N.z) * smoothstep(-0.25, 0.55, N.y - 0.6 * N.x) * step(dx, 60.0) * (0.6 + 0.4 * dust);
        // the neck: the lights run down its sides as two pale strips, and pool at the bottom corners
        float sl = exp(-(P.x - 545.0 - 0.10 * (P.y - 500.0)) * (P.x - 545.0 - 0.10 * (P.y - 500.0)) / 420.0) * smoothstep(436.0, 462.0, P.y) * smoothstep(556.0, 540.0, P.y);
        vec2 sq = P - vec2(757.5 - 0.10 * (P.y - 500.0), 514.0);
        vec2 sd = abs(sq) - vec2(10.5, 35.0) + 7.0;
        float sr = smoothstep(1.2, -1.2, length(max(sd, 0.0)) + min(max(sd.x, sd.y), 0.0) - 7.0) * (0.75 + 0.25 * smoothstep(8.0, 10.5, abs(sq.x)));
        float nb = (0.6 + 0.8 * noise(P * vec2(0.22, 0.03) + 20.0)) * (0.55 + 0.9 * tooth);
        refl += KEYL * (emit(vec3(0.48, 0.50, 0.55)) * sl + emit(vec3(0.70, 0.78, 0.82)) * sr) * nb;
        // the thick glass of the bulb's floor, seen edge on
        refl += KEYL * emit(vec3(0.30, 0.32, 0.36)) * exp(-(P.y - 561.0) * (P.y - 561.0) / 90.0) * (0.35 + 1.1 * noise(vec2(P.x * 0.09, 6.0))) * smoothstep(1.0, 0.8, abs(nxr));
        vec2 b1 = (P - vec2(574.0, 556.0)) / vec2(12.0, 15.0), b2 = (P - vec2(752.0, 568.0)) / vec2(15.0, 5.0), b3 = (P - vec2(566.0, 574.0)) / vec2(12.0, 6.0);
        float jag = 0.25 + 0.95 * smoothstep(0.30, 0.75, noise(P * vec2(0.13, 0.18) + 31.0));
        refl += KEYL * vec3(1.0, 0.98, 0.95) * 1.5 * jag * (exp(-dot(b1, b1) * 1.6) + 0.8 * exp(-dot(b2, b2) * 1.6) + 0.7 * exp(-dot(b3, b3) * 1.6));
        // the glass seen edge on: a dark line at the silhouette, a thin bright one just inside
        // (up left it is a band 10 to 13 px thick on the still, dark: the unlit room in the glass)
        float rimW = mix(3.2, 12.5, smoothstep(0.1, -0.5, N.x) * smoothstep(0.0, 0.5, N.y));
        float rimK = smoothstep(rimW * 0.5, rimW * 1.2, edgeD);
        g = mix(emit(vec3(0.27, 0.25, 0.27)) * KEYL * (0.9 + 0.1 * tooth), g, rimK);
        refl *= mix(0.25, 1.0, rimK);
        refl += KEYL * emit(vec3(0.62, 0.60, 0.58)) * 0.3 * exp(-(edgeD - 4.2) * (edgeD - 4.2) / 2.5) * smoothstep(-0.3, 0.5, N.y) * step(P.y, 330.0);
        g += refl;
        c = mix(c, g, cov);
    }
    // ---- the air in front: haze from the back light spilling over the dome, and dust
    c += haze(P) * 0.07 * (0.55 + 0.45 * sat(HEAT));
    {
        vec2 q = pf * 1.0;
        vec2 hd = (P - vec2(880.0, 170.0)) / vec2(330.0, 260.0);
        float where = 0.07 + 1.0 * exp(-dot(hd, hd) * 1.2) + 0.5 * glow(P) * sat(HEAT);
        float m = motes(q, 0.043, uT, 3.0, 0.0008, 0.0024, 0.25) * step(0.5, hash(floor(q / 0.043) + 77.0)) + 0.8 * motes(q * 1.07 + 0.3, 0.083, uT * 0.8, 4.0, 0.002, 0.0045, 0.6) + 0.35 * motes(q * 1.15 + 0.7, 0.16, uT * 0.6, 5.0, 0.006, 0.013, 1.0);
        c += (emit(vec3(0.80, 0.74, 0.80)) * KEYL + hot * 0.5 * glow(P)) * m * where;
    }
    // ---- the title: light, in front of everything
    vec4 t = plate(p);
    float glint = 1.0 + 2.5 * exp(-(p.x - SWEEP) * (p.x - SWEEP) / 0.004);
    c += lin(t.rgb) * t.a * 7.0 * TITLE * glint;
    return c;
}
`,
    frame(t) {
        const M = this.MATCH;
        // a filament does not switch on: a dull red ember that climbs, overshoots, settles and trembles
        const heat = Motion.keys([[0, 0], [0.55, 0], [0.9, 0.2], [1.25, 0.34], [1.9, 1.09], [2.5, 1]], t, Ease.inOut) * (1 + 0.012 * Math.sin(t * 37) * Ease.seg(t, 1.5, 2.2));
        const a = [
            heat,
            1 + 0.012 * (t - M),
            Ease.out(Ease.seg(t, 2.3, 3.3)),
            0.82 + 0.18 * Ease.inOut(Ease.seg(t, 0, 2.2)),
            -1.2 + 2.4 * Ease.inOut(Ease.seg(t, 2.5, 4.1)),
        ];
        const optics = {
            exposure: 1, toe: 0.006, bloom: 0.17, bloomWeights: [1.2, 1.8, 1.8, 0.9, 0.35, 0.12, 0.05], halation: [1, 0.5, 0.2], halationFrom: 5,
            ca: 0.0005, vignette: 0.12, soften: 0.12,
            grain: { amount: 0.032, size: 1.7, chroma: 0.3, floor: 0.3 },
        };
        return { a, optics };
    },
    // the title, painted on the plate (logical units)
    plate(pg, env) {
        const x0 = 480, y = 478;
        pg.textBaseline = 'alphabetic';
        pg.font = '500 150px Lora';
        pg.fillStyle = '#ffc94a';
        pg.fillText('light', x0, y);
        const w = pg.measureText('light').width;
        pg.font = '700 150px Poppins';
        pg.fillStyle = '#ffffff';
        pg.fillText('field', x0 + w + 6, y);
        const w2 = pg.measureText('field').width;
        pg.font = '500 40px Lora';
        pg.textAlign = 'right';
        pg.fillText('drawn by code', x0 + w + 6 + w2 - 4, y + 62);
    },
};
