// lightfield-test · shot 1 · Limb: the sun breaks over the edge of the Earth, seen from
// orbit. Built on the user's reference still (private/limb169.png, not committed); every
// number below was measured on it: the circle of the limb, the colour of the air at each
// height (PROF, one sample every 4 px across the band), how the band thins and dims along
// the arc (TAU, BETA), where the sun sits.
window.LFT = window.LFT ?? {};
LFT.limb = {
    // the instant that reproduces the reference still
    MATCH: 3.5,
    glsl: `
#define C vec2(uA[0], uA[1])
#define RAD uA[2]
#define SUN_ANG uA[3]
#define SUN_H uA[4]
#define SUN_POW uA[5]
#define DAY uA[6]
#define STARS uA[7]
#define LOW uA[8]
#define AUR uA[9]
#define SUN_K uA[10]
#define TURN uA[11]
#define SUN_FLAT uA[12]
// the air's colour by height above the solid edge (sRGB as measured, every 4 px of 1063 from −16 px)
const float STEP = 4.0 / 1063.0, H0 = -16.0 / 1063.0;
const vec3 PROF[33] = vec3[33](
    vec3(0.005, 0.000, 0.000), vec3(0.007, 0.001, 0.002), vec3(0.031, 0.001, 0.004), vec3(0.083, 0.001, 0.003), vec3(0.167, 0.000, 0.007), vec3(0.288, 0.004, 0.000),
    vec3(0.455, 0.071, 0.008), vec3(0.600, 0.226, 0.080), vec3(0.696, 0.410, 0.224), vec3(0.777, 0.576, 0.420), vec3(0.812, 0.675, 0.578), vec3(0.836, 0.730, 0.685),
    vec3(0.825, 0.745, 0.747), vec3(0.774, 0.717, 0.770), vec3(0.718, 0.690, 0.802), vec3(0.682, 0.694, 0.849), vec3(0.656, 0.672, 0.858), vec3(0.602, 0.599, 0.838),
    vec3(0.503, 0.482, 0.782), vec3(0.391, 0.351, 0.702), vec3(0.305, 0.246, 0.641), vec3(0.241, 0.164, 0.574), vec3(0.200, 0.099, 0.503), vec3(0.151, 0.045, 0.422),
    vec3(0.103, 0.013, 0.342), vec3(0.060, 0.006, 0.274), vec3(0.026, 0.004, 0.199), vec3(0.013, 0.001, 0.137), vec3(0.005, 0.001, 0.071), vec3(0.001, 0.001, 0.024),
    vec3(0.000, 0.000, 0.003), vec3(0.000, 0.000, 0.000), vec3(0.000, 0.000, 0.000));
vec3 air(float h) {
    float x = clamp((h - H0) / STEP, 0.0, 31.999);
    int i = int(floor(x));
    return emit(mix(PROF[i], PROF[i + 1], x - float(i)));
}
// stars: three magnitudes, the faint ones many and the bright ones few, a touch of colour
vec3 stars(vec2 p) {
    vec3 s = vec3(0.0);
    for (int l = 0; l < 3; l++) {
        float cell = l == 0 ? 0.027 : (l == 1 ? 0.066 : 0.19);
        vec2 g = p / cell + float(l) * 13.7, i = floor(g);
        vec3 k = hash3(i + 5.0), k2 = hash3(i + 71.0);
        vec2 d = (fract(g) - (0.12 + 0.76 * k.xy)) * cell;
        float r = 0.0009 + 0.0007 * float(l);
        float m = step(l == 0 ? 0.45 : 0.3, k2.x) * pow(k.z, l == 0 ? 5.0 : 2.5) * (l == 0 ? 0.45 : (l == 1 ? 1.5 : 5.0));
        s += mix(vec3(1.0, 0.85, 0.7), vec3(0.75, 0.85, 1.0), k2.y) * m * exp(-dot(d, d) / (r * r));
    }
    return s;
}
// the night side: cities as clusters of sodium lights on the sphere, foreshortened towards
// the limb and carried round with the planet
vec3 cities(vec2 q, float r) {
    float u = asin(clamp(r / RAD, 0.0, 1.0));              // 0 under the camera, π/2 at the limb
    vec2 s = vec2(atan(q.x, q.y) * 3.0 * sin(u) + TURN * 0.35, (1.5708 - u) * 3.0 - TURN) * RAD / 3.313;
    // people live in a few places: most of the night side is dark
    float pop = smoothstep(0.80, 0.98, fbm(s * 3.1 + 2.0) * 0.8 + 0.55 * fbm(s * 13.0 + 40.0));
    vec2 g = s * 230.0, i = floor(g);
    vec3 k = hash3(i + 9.0);
    vec2 d = fract(g) - (0.2 + 0.6 * k.xy);
    float lamp = exp(-dot(d, d) * 34.0) * step(1.0 - pop * 0.8, k.z) * (0.25 + 0.75 * k.x * k.x);
    return emit(vec3(0.95, 0.66, 0.36)) * (0.9 * lamp + 0.05 * pop * pop * pop) * smoothstep(0.0, -0.02, r - RAD);
}
vec3 radiance(vec2 p) {
    vec2 q = p - C;
    float r = length(q), ang = atan(q.x, q.y), h = r - RAD;
    // along the arc the band thins and dims towards the frame's edges (fitted on the reference)
    float a = clamp(ang, -0.27, 0.25);
    float tau = (((129.759 * a + 2.131) * a - 11.403) * a - 0.304) * a + 0.990;
    float beta = (((-76.292 * a + 3.440) * a - 3.438) * a - 0.622) * a + 1.034;
    float da = abs(ang - SUN_ANG);
    // daylight spreads along the limb from where the sun is about to rise, and reaches the
    // high blue air before the low red air
    float lit = smoothstep(DAY * 0.75 + 0.02, DAY * 0.25, da);
    float hn = h / tau;
    vec3 L = air(hn) * beta * lit * mix(LOW, 1.0, smoothstep(0.028, 0.058, hn));
    L *= 1.0 + AUR * exp(-da * da / (0.028 * 0.028));
    // the sun rises BEHIND the planet: the ground and the dense air just over it hide it, so
    // it is only ever seen through the band (never on the dark disc below it), squashed by
    // refraction while it is low, and round once it clears
    vec2 rd = vec2(sin(SUN_ANG), cos(SUN_ANG)), td = vec2(rd.y, -rd.x);
    vec2 d = p - (C + (RAD + SUN_H) * rd);
    float e = length(vec2(dot(d, td), dot(d, rd) / SUN_FLAT));
    vec3 sun = blackbody(SUN_K) * SUN_POW * smoothstep(0.0062 + uPx, 0.0062 - uPx, e) * smoothstep(0.008, 0.021, h);
    vec3 st = stars(p) * STARS * smoothstep(0.075, 0.11, h);
    return L + sun + st + cities(q, r) * (0.35 + 0.65 * STARS);
}
`,
    frame(t) {
        const M = this.MATCH, z = 1 + 0.01 * (t - M);
        // the sun climbs straight up through the air at a constant rate
        const sunH = 0.0273 + (t - M) * 0.0205;
        // the air it shines through: red and weak at the ground, white above
        const clear = Ease.seg(sunH, 0.0, 0.03);
        // before it shows, its light already pools in the air over the place it will rise
        const pre = Ease.inOut(Ease.seg(sunH, -0.04, 0.0));
        const a = [
            0.015 * z, -3.283 * z + 0.0015 * (t - M), 3.313 * z,
            -0.1738, sunH,
            2000 * Math.pow(clear, 5) * (1 + 0.9 * Ease.seg(t, M, M + 2)),
            Motion.keys([[0, 0.1], [M - 0.4, 1.95]], t, Ease.inOut),
            1 - Ease.inOut(Ease.seg(t, 1.2, M - 0.5)),
            Ease.inOut(Ease.seg(t, 1.0, M - 0.6)),
            1.3 * pre * (1 - clear) + 5.1 * clear,
            1500 + 4200 * clear * clear,
            0.012 * t,
            0.35 + 0.45 * clear,
        ];
        const optics = {
            exposure: 1, toe: 0.05, bloom: 0.12, bloomWeights: [0.5, 0.7, 0.9, 1.2, 2.0, 0.9, 0.2], halation: [1, 0.12, 0.01], halationFrom: 5,
            streaks: { gain: 0.19, threshold: 90, length: 0.22, falloff: 6.5, rays: 15, level: 4, seed: 7, irregular: 0.8, rot: 0.2, tint: [1, 0.11, 0.008] },
            ca: 0.0012, vignette: 0, soften: 0.6,
            grain: { amount: 0.075, size: 2.6, chroma: 0.3, floor: 0 },
        };
        return { a, optics };
    },
};
