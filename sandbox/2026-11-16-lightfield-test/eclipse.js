// lightfield-test · shot 2 · Eclipse: the Moon closes over the Sun and the corona opens.
// No reference still for this one: it is built from what a total eclipse looks like,
// trait by trait (see brief.md): a crescent that breaks into beads on the Moon's mountains,
// the diamond ring, a corona that is not round (streamers over the Sun's equator drawn out
// to points, fine plumes fanned over its poles, all combed along the field lines), pink
// prominences and a hair of chromosphere at the contacts, stars and earthshine once the
// camera can open up. The camera's exposure is part of the animation: 1/70 for the
// crescent, 1 for the corona.
window.LFT = window.LFT ?? {};
LFT.eclipse = {
    glsl: `
#define MOON vec2(uA[0], uA[1])   // the Moon's centre from the Sun's
#define ZOOM uA[2]
const float RS = 0.175, RM = 0.175 * 1.036;
const vec2 SUN = vec2(-0.015, 0.02);
const float AXIS = 0.42;           // the Sun's magnetic axis, off the vertical
vec3 stars(vec2 p) {
    vec3 s = vec3(0.0);
    for (int l = 0; l < 3; l++) {
        float cell = l == 0 ? 0.031 : (l == 1 ? 0.074 : 0.21);
        vec2 g = p / cell + float(l) * 19.3, i = floor(g);
        vec3 k = hash3(i + 15.0), k2 = hash3(i + 81.0);
        vec2 d = (fract(g) - (0.12 + 0.76 * k.xy)) * cell;
        float r = 0.0010 + 0.0007 * float(l);
        float m = step(l == 0 ? 0.72 : 0.6, k2.x) * pow(k.z, l == 0 ? 6.0 : 3.0) * (l == 0 ? 0.22 : (l == 1 ? 0.7 : 2.4));
        s += mix(vec3(1.0, 0.85, 0.7), vec3(0.75, 0.85, 1.0), k2.y) * m * exp(-dot(d, d) / (r * r));
    }
    return s;
}
// one streamer: a tongue over angle a, w wide at the limb and drawn to a point, falling as rho^-p
float tongue(float th, float rho, float a, float w, float p) {
    float d = abs(mod(th - a + PI, 2.0 * PI) - PI);
    float ww = w / (1.0 + 0.85 * (rho - 1.0));
    return exp(-d * d / (ww * ww)) * pow(rho, -p);
}
vec3 corona(vec2 q) {
    float r = length(q), rho = max(r / RS, 1.0), lr = log(rho);
    float th = atan(q.x, q.y) - AXIS;                 // 0 over the north magnetic pole
    float pole = pow(abs(cos(th)), 5.0);
    // the comb: lines of force, straight over the poles, leaning to the equator in between
    float psi = th + 0.34 * sin(2.0 * th) * lr;
    float comb = (0.55 + 0.80 * noise(vec2(psi * 17.0, lr * 1.6 + 3.0))) * mix(0.90 + 0.2 * noise(vec2(psi * 58.0, lr * 1.1 + 7.0)), 0.6 + 0.8 * noise(vec2(psi * 58.0, lr * 1.1 + 7.0)), pole);
    // the inner corona: a ring so bright it burns, even all round
    float inner = 7.0 * pow(rho, -11.0) + 1.3 * pow(rho, -5.4);
    // streamers: two pairs over the equator, of different lengths, and a short one in between
    float e = 1.5708;
    float st = 1.9 * tongue(th, rho, e - 0.16, 0.36, 3.1) + 1.2 * tongue(th, rho, e + 0.46, 0.20, 3.9)
             + 1.7 * tongue(th, rho, -e + 0.10, 0.31, 3.4) + 1.3 * tongue(th, rho, -e - 0.50, 0.17, 3.8)
             + 0.8 * tongue(th, rho, 2.45, 0.15, 4.6);
    // plumes: thin rays fanned over both poles, short
    float pl = pole * pow(0.15 + 1.2 * noise(vec2(psi * 95.0, lr * 0.7 + 9.0)), 2.0) * 0.9 * pow(rho, -5.0);
    float k = inner * (0.75 + 0.25 * comb) + (st * 0.62 + pl) * comb;
    // pearl white, a touch cooler far out
    return mix(vec3(1.0, 0.97, 0.93), vec3(0.84, 0.90, 1.0), sat(lr * 0.9)) * k * smoothstep(0.985, 1.0, r / RS);
}
// prominences: flames of hydrogen standing on the limb, and one loop
vec3 prominences(vec2 q) {
    float r = length(q) / RS, th = atan(q.x, q.y);
    float f = 0.0;
    for (int i = 0; i < 4; i++) {
        float a = i == 0 ? 1.92 : (i == 1 ? -1.22 : (i == 2 ? -2.35 : 0.71));
        float w = i == 0 ? 0.050 : (i == 1 ? 0.030 : (i == 2 ? 0.042 : 0.022));
        float h = i == 0 ? 0.105 : (i == 1 ? 0.080 : (i == 2 ? 0.066 : 0.090));
        float d = mod(th - a + PI, 2.0 * PI) - PI;
        // a tongue of gas, leaning, lumpy: bright at its foot, thinning to its tip
        float lean = d - 0.35 * w * (r - 1.0) / h * (i == 1 ? -1.0 : 1.0);
        float top = 1.0 + h * exp(-lean * lean / (w * w)) * (0.6 + 0.6 * noise(vec2(th * 34.0, float(i) * 7.0)));
        float body = smoothstep(top, top - 0.02, r) * step(0.99, r);
        f += body * (0.45 + 0.75 * noise(q * 70.0 + float(i) * 13.0)) * (0.35 + 0.65 * sat((top - r) / h));
    }
    // a loop: gas hung on an arch of field
    vec2 lc = RS * 1.005 * vec2(sin(-0.55), cos(-0.55));
    float loop = abs(length((q - lc) * vec2(1.0, 1.25)) - RS * 0.052);
    f += 0.8 * smoothstep(RS * 0.016, RS * 0.004, loop) * step(1.0, r);
    // the chromosphere: a hair of the same pink all round, seen only at the contacts
    f += 2.0 * smoothstep(1.014, 1.006, r) * step(0.995, r);
    return vec3(1.0, 0.13, 0.30) * 16.0 * f;
}
vec3 radiance(vec2 p) {
    vec2 q = (p - SUN) / ZOOM;
    float r = length(q);
    vec3 pr = prominences(q);
    // (hydrogen is opaque in its own light: a prominence hides the corona behind it)
    vec3 c = stars(q * 1.0 + 3.0) * smoothstep(1.0, 1.6, r / RS) + corona(q) * (1.0 - sat(pr.r / 6.0)) + pr;
    // the photosphere, darker towards its limb
    float mu = sqrt(max(1.0 - r * r / (RS * RS), 0.0));
    c = mix(c, blackbody(5800.0) * 5200.0 * (0.38 + 0.62 * mu), smoothstep(RS + uPx, RS - uPx, r));
    // a planet near the Sun, out of the glare only now
    vec2 v = q - vec2(-0.47, -0.17);
    c += vec3(1.0, 0.96, 0.85) * 60.0 * smoothstep(0.0022, 0.0012, length(v));
    // the Moon: a black disc with a ragged edge (its mountains and valleys make the beads),
    // and on its face, when the camera opens up, the grey of the seas lit by the Earth
    vec2 qm = q - MOON;
    float rm = length(qm), tm = atan(qm.x, qm.y);
    float limb = RM * (1.0 + 0.005 * (noise(vec2(tm * 7.0, 1.0)) - 0.5) + 0.006 * (noise(vec2(tm * 31.0, 4.0)) - 0.5) + 0.004 * (noise(vec2(tm * 110.0, 8.0)) - 0.5));
    float moon = smoothstep(limb + uPx, limb - uPx, rm);
    vec2 mq = qm / RM;
    float seas = smoothstep(0.42, 0.62, fbm(mq * 2.3 + 5.0)) * 0.6 + 0.4 * fbm(mq * 9.0);
    vec3 face = emit(vec3(0.013, 0.016, 0.023)) * (0.35 + 0.9 * (1.0 - seas)) * (0.8 + 0.4 * noise(mq * 40.0));
    return mix(c, face, moon);
}
`,
    rays() {
        if (!this._rays) {
            const r = Motion.rng('eclipse-iris'), n = 17;
            this._rays = Array.from({ length: n }, (_, i) => ({
                angle: ((i + (r() - 0.5) * 0.6) / n) * Math.PI * 2 + 0.3,
                len: 0.14 + 0.12 * r(),
                gain: 0.4 + 0.6 * r(),
            }));
        }
        return this._rays;
    },
    // The Moon's offset in solar radii at time t: a time-lapse that slows through totality
    // (a cubic through the two contacts, at 2.5 s and 5.3 s). Positive = to the right.
    offset(t) {
        const u = t - 3.9;
        return -(0.0117 * u + 0.00496 * u * u * u);
    },
    frame(t) {
        const d = this.offset(t), RS = 0.175;
        // exposure follows what is left of the photosphere: stopped right down for the
        // crescent, opening as the last bead dies, wide for the corona, and overrun when
        // the first bead comes back (the film burns out: the cut)
        const exposure = Motion.keys([[0, 0.014], [1.5, 0.018], [2.1, 0.05], [2.5, 0.3], [2.95, 1], [5.35, 1], [5.85, 2], [6.5, 60]], t, Ease.inOut);
        const a = [d * RS * 0.978, d * RS * 0.21 + 0.0012, 1 + 0.014 * (t - 3.9)];
        const optics = {
            exposure, toe: 0.012, bloom: 0.15, bloomWeights: [0.6, 0.9, 1.2, 1.6, 2.2, 1.4, 0.5], halation: [1, 0.82, 0.68], halationFrom: 5,
            streaks: { gain: 0.05, threshold: 120, falloff: 6, rays: this.rays(), level: 4, tint: [1, 0.82, 0.62] },
            ca: 0.0008, vignette: 0.1, soften: 0.3,
            grain: { amount: 0.04, size: 1.9, chroma: 0.3, floor: 0.05 },
        };
        return { a, optics };
    },
};
