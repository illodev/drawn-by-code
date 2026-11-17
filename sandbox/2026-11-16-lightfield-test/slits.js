// lightfield-test · shot 4 · Slits: red light through two slits, one photon at a time,
// until the hits draw the fringes. Our own scene on the same bench as the prism (lab.js).
// The wave is computed, not painted: at every point beyond the barrier the two paths from
// the two slits are added with their phases (the fingers on the table are the real
// hyperbolae of a two-source pattern; the wavelength is scaled up to 1.4 cm of table so
// they can be seen at all), and what the film shows of that intensity is what it has
// collected so far: each cell of the table lights when its first photon lands (a flash,
// then a steady dot), the source is turned up tenfold every 1.2 s, and when a cell has had
// some eight hits the dots give way to the wave itself, speckled as laser light is.
window.LFT = window.LFT ?? {};
LFT.slits = {
    get glsl() { return LFT.lab.glsl + LFT_SLITS_GLSL(); },
    frame(t) {
        const u = Ease.inOut(Ease.seg(t, 0, 6));
        const a = new Array(64).fill(0);
        a.splice(0, 7, -0.10 + 0.14 * u, 0.84 - 0.03 * u, -1.58 + 0.08 * u, -0.02 + 0.12 * u, 0, -0.06, 1.5);
        a[7] = 0.0006 * Math.exp(1.92 * t);     // photons collected so far, per unit of intensity
        a[8] = 0.42;                            // the room
        const optics = {
            exposure: 1, toe: 0.004, bloom: 0.22, bloomWeights: [1.0, 1.5, 1.8, 1.4, 0.8, 0.35, 0.12], halation: [1, 0.5, 0.3], halationFrom: 4,
            ca: 0.0004, vignette: 0.22, soften: 0.15,
            grain: { amount: 0.034, size: 1.7, chroma: 0.3, floor: 0.3 },
        };
        return { a, optics };
    },
};
function LFT_SLITS_GLSL() {
    return `
#define EXPO uA[7]
#define AMB uA[8]
const float XB = -0.46;                // the barrier stands across the table here
const float SEP = 0.070;               // between the slits
const float LAMBDA = 0.014;            // the wavelength, at table scale
const float HB = 0.05;                 // the light is a sheet this high
const float HBAR = 0.19;               // the barrier's height
const vec3 RED = vec3(1.0, 0.055, 0.03);
const vec2 K0 = vec2(0.62, 0.50), KU = vec2(0.208, -0.978);   // the far card
const float KL = 1.05, KH = 0.21;
const float RATE = 1.92;
// the wave beyond the barrier: two paths, added with their phases
float wave(vec2 T) {
    vec2 s1 = vec2(XB, 0.5 * SEP), s2 = vec2(XB, -0.5 * SEP);
    float r1 = length(T - s1), r2 = length(T - s2);
    float a1 = inversesqrt(r1 + 0.02), a2 = inversesqrt(r2 + 0.02);
    float I = a1 * a1 + a2 * a2 + 2.0 * a1 * a2 * cos(6.2832 * (r1 - r2) / LAMBDA);
    // each slit throws most of its light forward
    float ct = (T.x - XB) / (0.5 * (r1 + r2) + 1e-4);
    return 0.25 * I * ct * ct * step(XB, T.x) * 0.5;
}
// the beam on its way to the barrier
float beamIn(vec2 T) { return (1.3 * exp(-T.y * T.y / (0.045 * 0.045)) + 1.2 * exp(-T.y * T.y / (0.014 * 0.014))) * step(T.x, XB); }
// what the film has collected in the cell at g where the intensity is I
float collected(vec2 g, float I) {
    vec2 i = floor(g), f = fract(g);
    vec3 h = hash3(i + 7.0), k = hash3(i + 91.0);
    float n = EXPO * I;                                   // photons expected here so far
    // the waits between photons are exponential: the first three arrivals of this cell
    float t1 = -log(max(h.x, 1e-4)), t2 = t1 - log(max(h.y, 1e-4)), t3 = t2 - log(max(h.z, 1e-4));
    float hits = step(t1, n) + step(t2, n) + step(t3, n);
    // a photon lands with a flash that dies in a twentieth of a second
    float flash = step(t1, n) * exp(-log(max(n / t1, 1.0)) / (RATE * 0.05)) + step(t2, n) * exp(-log(max(n / t2, 1.0)) / (RATE * 0.05)) + step(t3, n) * exp(-log(max(n / t3, 1.0)) / (RATE * 0.05));
    vec2 d = f - (0.25 + 0.5 * k.xy);
    float spot = exp(-dot(d, d) / 0.035);
    float dots = (hits * 0.7 + 5.0 * flash) * spot;
    // with enough of them the grain of single hits gives way to the wave, speckled
    // (laser speckle: bright grains among dark ones, smooth-edged, at the scale of a hit)
    float sp = noise(g * 1.1 + 3.0) * noise(g * 2.3 + 11.0);
    float speckle = 0.12 + 5.5 * sp * sp * (0.6 + 0.8 * noise(g * 0.31));
    float wav = n * speckle * 0.45;
    // (the camera stops down as the source is turned up, so a full exposure stays in range)
    return mix(dots, wav, smoothstep(2.5, 9.0, n)) * 1.9 / (1.0 + EXPO / 1.5);
}
vec3 ambient(vec2 T) { return vec3(0.10, 0.17, 0.28) * AMB * (0.35 + 0.65 * smoothstep(1.4, -1.2, T.x - 0.6 * T.y)); }
vec3 radiance(vec2 p) {
    vec3 rd = viewRay(p);
    float t0, tm;
    vec2 T0 = planeAt(rd, 0.0, t0), Tm = planeAt(rd, HB * 0.6, tm);
    vec3 amb = ambient(T0);
    float I0 = wave(T0) + beamIn(T0);
    // the table: what has landed on it so far
    vec3 c = tableLit(T0, amb) + RED * collected(T0 / 0.0052, I0) * (0.75 + 0.5 * noise(T0 * 300.0));
    // the sheet of light in the air, once there is enough of it to see
    float air = smoothstep(4.0, 40.0, EXPO) * (wave(Tm) + beamIn(Tm));
    float m = motes(p, 0.045, uT, 6.0, 0.0009, 0.0026, 0.2) + 0.7 * motes(p * 1.1 + 0.4, 0.09, uT * 0.8, 7.0, 0.002, 0.005, 0.6);
    c += RED * air * (0.10 * (0.5 + 0.9 * fbm(vec3(Tm * 9.0, uT * 0.12))) + 2.2 * m);
    float depth = t0;

    // ---- the far card: where the fingers end as bars
    {
        vec2 nk = vec2(KU.y, -KU.x);
        float tk = dot(K0 - CAM.xz, nk) / dot(rd.xz, nk);
        vec3 H = CAM + rd * tk;
        float s = dot(H.xz - K0, KU);
        if (tk > 0.0 && tk < depth && s > 0.0 && s < KL && H.y > 0.0 && H.y < KH) {
            float sheet = smoothstep(HB + 0.014, HB - 0.006, H.y) + 0.04 * exp(-max(H.y - HB, 0.0) / 0.05);
            float tooth = 0.82 + 0.36 * noise(vec2(s, H.y) * 260.0) * noise(vec2(s, H.y) * 90.0 + 4.0) * 2.0;
            c = (ambient(H.xz) * 1.6 * (0.6 + 0.4 * H.y / KH) * 0.62 + RED * collected(vec2(s, H.y) / 0.0048 + 40.0, wave(H.xz) * sheet * 2.6)) * tooth;
            c += vec3(0.10, 0.17, 0.28) * AMB * 0.25 * smoothstep(0.006, 0.0, KH - H.y) * (0.4 + 1.2 * noise(vec2(s * 40.0, 3.0)));
            depth = tk;
        }
    }
    // ---- the barrier: a black card with two slits; all that passes it shows as two lines
    {
        float tb = (XB - CAM.x) / rd.x;
        vec3 H = CAM + rd * tb;
        if (tb > 0.0 && tb < depth && abs(H.z) < 0.30 && H.y > 0.0 && H.y < HBAR) {
            float tooth = 0.8 + 0.4 * noise(H.zy * 240.0);
            c = ambient(H.xz) * 0.05 * tooth + vec3(0.10, 0.17, 0.28) * AMB * 0.22 * smoothstep(0.005, 0.0, HBAR - H.y) * (0.4 + 1.2 * noise(vec2(H.z * 40.0, 5.0)));
            // the slits, lit from behind: brighter as the source comes up, never switched
            float slit = exp(-pow((abs(H.z) - 0.5 * SEP) / 0.0045, 2.0)) * smoothstep(HB + 0.03, HB - 0.01, H.y);
            c += RED * slit * (0.15 + 7.0 * smoothstep(0.0, 30.0, EXPO)) * (0.7 + 0.5 * noise(vec2(H.y * 120.0, H.z * 30.0)));
            // and the glow of the beam on its far side spilling round its edges
            c += RED * 0.05 * smoothstep(2.0, 40.0, EXPO) * exp(-abs(H.z) / 0.12) * smoothstep(HBAR, 0.0, H.y);
            depth = tb;
        }
    }
    return c;
}
`;
}
