// micrograph-test · shot 2 · Stain: one particle in a pool of stain, on lilac.
// Built on the user's reference still (private/stain169.png, not committed: the centre
// 16:9 of the square still). Measured on it: the particle's core (an ellipse fit), the
// colour at every distance from its centre (PROF: the mean over all angles, one sample
// every 0.08 core radii), and how the pool of stain is lopsided (darker above the
// particle, the core darker on its left).
window.MGT = window.MGT ?? {};
MGT.stain = {
    // the instant that reproduces the reference still (local seconds)
    MATCH: 2.5,
    glsl: `
#define T uA[0]
#define STAGE vec2(uA[1], uA[2])
#define ZOOM uA[3]
#define TURN uA[4]
const vec2 C = vec2(0.0009, -0.0215), AX = vec2(0.1972, 0.1895);
const float ANG = 2.409, STEP = 0.08;
const vec3 PROF[64] = vec3[64](
    vec3(0.725, 0.584, 0.257), vec3(0.718, 0.579, 0.254), vec3(0.738, 0.597, 0.272), vec3(0.713, 0.572, 0.247),
    vec3(0.682, 0.536, 0.214), vec3(0.671, 0.521, 0.211), vec3(0.663, 0.512, 0.208), vec3(0.658, 0.506, 0.211),
    vec3(0.650, 0.494, 0.218), vec3(0.616, 0.454, 0.201), vec3(0.586, 0.417, 0.193), vec3(0.575, 0.396, 0.214),
    vec3(0.600, 0.412, 0.292), vec3(0.662, 0.478, 0.417), vec3(0.638, 0.453, 0.428), vec3(0.525, 0.328, 0.330),
    vec3(0.417, 0.222, 0.249), vec3(0.421, 0.250, 0.293), vec3(0.439, 0.291, 0.353), vec3(0.432, 0.296, 0.384),
    vec3(0.422, 0.293, 0.408), vec3(0.430, 0.307, 0.438), vec3(0.454, 0.337, 0.471), vec3(0.482, 0.370, 0.504),
    vec3(0.508, 0.400, 0.533), vec3(0.535, 0.429, 0.560), vec3(0.558, 0.454, 0.582), vec3(0.576, 0.476, 0.602),
    vec3(0.598, 0.501, 0.624), vec3(0.615, 0.519, 0.640), vec3(0.632, 0.538, 0.657), vec3(0.646, 0.551, 0.670),
    vec3(0.660, 0.564, 0.683), vec3(0.674, 0.579, 0.697), vec3(0.688, 0.592, 0.710), vec3(0.700, 0.603, 0.721),
    vec3(0.711, 0.614, 0.732), vec3(0.725, 0.627, 0.745), vec3(0.735, 0.638, 0.756), vec3(0.746, 0.649, 0.767),
    vec3(0.752, 0.655, 0.774), vec3(0.758, 0.661, 0.782), vec3(0.767, 0.671, 0.793), vec3(0.778, 0.683, 0.804),
    vec3(0.786, 0.692, 0.813), vec3(0.793, 0.700, 0.822), vec3(0.800, 0.707, 0.830), vec3(0.806, 0.712, 0.837),
    vec3(0.812, 0.718, 0.843), vec3(0.819, 0.726, 0.851), vec3(0.824, 0.730, 0.856), vec3(0.829, 0.736, 0.861),
    vec3(0.835, 0.742, 0.868), vec3(0.837, 0.745, 0.870), vec3(0.847, 0.756, 0.879), vec3(0.852, 0.763, 0.884),
    vec3(0.857, 0.769, 0.890), vec3(0.859, 0.772, 0.892), vec3(0.864, 0.778, 0.896), vec3(0.860, 0.773, 0.891),
    vec3(0.863, 0.777, 0.895), vec3(0.863, 0.778, 0.895), vec3(0.867, 0.781, 0.898), vec3(0.865, 0.778, 0.897)
);
vec3 prof(float r) {
    float x = clamp(r / STEP - 0.5, 0.0, 62.999);
    int i = int(floor(x));
    return mix(PROF[i], PROF[i + 1], fract(x));
}
const vec3 RUST = vec3(0.58, 0.37, 0.34);
void specimen(vec2 p, out float s, out vec3 ink) {
    vec2 q = (p - STAGE) / ZOOM, w = q - C;
    vec2 l = rot(ANG + TURN) * w;
    float a = atan(l.y, l.x), wa = atan(w.y, w.x), R = AX.y;
    float rn = length(l / AX) / wobble(a, 7.0, 0.03, T * 0.6);
    vec3 c = prof(rn);
    s = lum(c);
    ink = c;
    // the pool of stain is lopsided: deeper above the particle; the core is darker on its left
    float up = sin(wa);
    s *= 1.0 - (up > 0.0 ? 0.22 : 0.33) * up * smoothstep(1.15, 1.4, rn) * pow(1.4 / max(rn, 1.4), 1.8);
    // the envelope is a band with a dark seam of stain outside it; the core is mottled
    s += 0.045 * shell(rn - 1.09, 0.06) - 0.05 * shell(rn - 1.25, 0.05) * (1.0 - 0.5 * up);
    s *= 1.0 + 0.22 * (fbm(l * 13.0 + 2.0) - 0.5) * smoothstep(1.0, 0.85, rn);
    s *= 1.0 + 0.19 * cos(wa) * smoothstep(0.25, 0.8, rn) * smoothstep(1.02, 0.9, rn);
    s *= 1.0 + 0.045 * q.x + 0.05 * (fbm(q * 2.3 + 5.0) - 0.5);
    // the spikes stand in the dark stain: lumps of the particle's own paler matter
    float zone = smoothstep(1.12, 1.2, rn) * smoothstep(1.75, 1.5, rn);
    vec2 nl = l / AX + 0.09 * (vec2(noise(l * 26.0), noise(l * 26.0 + 9.0)) - 0.5);
    float sp = smoothstep(0.2, 0.75, lumps(nl, a, 15.0, 3.0, T, vec2(1.24, 1.39), vec2(0.10, 0.20)));
    s *= 1.0 - 0.10 * zone;
    s = mix(s, 0.42 * (1.0 - 0.2 * up), 0.7 * sp);
    ink = mix(ink, RUST, 0.75 * sp);
    // grain: the stain's own crystals everywhere, and the coarser contents of the core
    float core = smoothstep(1.0, 0.86, rn);
    grit = (0.09 + 0.15 * smoothstep(0.95, 1.2, rn) * smoothstep(2.5, 1.5, rn)) * grainy(q, 0.0056, 1.0, 0.75) + core * (0.16 * grainy(l, 0.0068, 4.0, 0.8) + 0.07 * grainy(l, 0.016, 6.0, 0.4));
}
`,
    frame(t, edge) {
        const M = this.MATCH, u = t - M;
        // the magnification creeps in, the stage drifts, the particle hardly turns
        const a = [t, 0.004 * u, 0.0025 * u, (1 + 0.012 * u) * (1 - 0.25 * edge.inn) * (1 - 0.45 * edge.out), 0.012 * u];
        // focus: the shot arrives soft from the magnification change and is pulled in once
        const defocus = Motion.keys([[0, 2.6], [0.55, 0.0], [0.85, 0.6], [1.2, 0.15]], t, Ease.inOut) + 0.05 * Math.sin(t * 1.1 + 1) + 2.6 * edge.out + (edge.skip ? 2.6 * edge.inn * edge.inn : 0);
        const detector = {
            soft: 1.5, defocus, fringe: 0.2 + 0.3 * defocus, fringeWidth: 3,
            noise: { amount: 0.105, power: 0.1, floor: 0.001, size: 5.2, live: 0.6, hold: 2, sharp: 0.75, fine: 0.3 },
            bleed: 2.0, gain: (1 - 0.7 * edge.inn * edge.inn) * (1 - 0.7 * edge.out),
        };
        return { a, detector, stage: [a[1], a[2]] };
    },
    overlay(g, t, env) {
        Micrograph.databar(g, env, { x: env.W - 56 - 200, len: 200, label: '50 nm', caption: 'virion · negative stain', font: 'VT323', size: 34, colour: '#1c0f24', shadow: 'rgba(255,255,255,0.5)', alpha: Ease.seg(t, 1.3, 1.6) * (1 - Ease.seg(t, 4.6, 4.75)) });
    },
};
