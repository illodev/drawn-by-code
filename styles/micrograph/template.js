// Micrograph style template: two particles in a pool of stain, found out of focus, pulled
// in, and tinted by the colourist; a scale bar burned in by the instrument.
const TPL_GLSL = `
#define T uA[0]
#define STAGE vec2(uA[1], uA[2])
#define WASH uA[3]
// the inks (sRGB, each pure at its own luminance)
const vec3 FIELD = vec3(0.60, 0.80, 0.78), DEEP = vec3(0.20, 0.42, 0.50), SHELL = vec3(0.96, 0.78, 0.36), CORE = vec3(0.86, 0.36, 0.30), SPIKE = vec3(0.62, 0.60, 0.44);
void particle(vec2 q, vec2 c, vec2 r, float seed, inout float s, inout vec3 ink) {
    vec2 l = q - c;
    float a = atan(l.y, l.x), R = min(r.x, r.y);
    float d = body(l, r, seed, 0.05, T * 0.6);                 // never a circle, and it breathes
    float x = clamp(-d / R, 0.0, 1.0);
    float g1 = grainy(l, R * 0.10, seed, 0.5), g2 = grainy(l, R * 0.05, seed + 3.0, 0.8);
    // outside: a pool of stain that deepens towards the particle, and a crown of spikes in it
    float pool = smoothstep(2.2 * R, 0.0, d);
    s *= 1.0 - 0.55 * pool * pool;
    ink = mix(ink, DEEP, pool);
    vec2 n = l / (r * wobble(a, seed, 0.05, T * 0.6)) + 0.09 * (vec2(noise(l * 26.0), noise(l * 26.0 + 9.0)) - 0.5);
    float sp = smoothstep(0.2, 0.75, lumps(n, a, 16.0, seed, T, vec2(1.10, 1.24), vec2(0.09, 0.16))) * step(0.0, d);
    s = mix(s, 0.50, 0.75 * sp);
    ink = mix(ink, SPIKE, 0.8 * sp);
    // the particle: a bright shell, a darker core off-centre, grain of its own
    float in1 = inside(d, 0.006);
    float v = mix(0.74, 0.46, smoothstep(0.22, 0.5, x + 0.08 * g1));
    s = mix(s, v, in1);
    ink = mix(ink, mix(SHELL, CORE, smoothstep(0.2, 0.5, x + 0.08 * g1)), in1);
    grit = mix(grit, 0.30 * g2 + 0.12 * g1, in1);
}
void specimen(vec2 p, out float s, out vec3 ink) {
    vec2 q = p - STAGE;
    s = 0.72 + 0.05 * (fbm(q * 2.5) - 0.5);
    ink = FIELD;
    grit = 0.10 * grainy(q, 0.006, 1.0, 0.7);                  // the stain's own crystals
    particle(q, vec2(-0.20, 0.03), vec2(0.150, 0.138), 2.0, s, ink);
    particle(q, vec2(0.33, -0.10), vec2(0.105, 0.112), 5.0, s, ink);
    // the wash: until the colourist reaches a place it is the raw grey image
    float front = smoothstep(0.0, 0.25, WASH * 3.0 - 0.5 - (p.x / uAspect + 0.5) - 0.9 * (fbm(p * 3.0 + 7.0) - 0.5));
    ink = mix(vec3(lum(ink)), ink, front);
}
`;
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/micrograph/micrograph.js'],
    fonts: [{ family: 'VT323', src: 'fonts/VT323-latin.woff2' }],
    shots: [[0, 4, 'Template']],
    setup(env) {
        return { M: Micrograph.make(env).scene('tpl', TPL_GLSL) };
    },
    draw(g, t, env) {
        // the operator finds focus: far out, through it, back; then it only breathes
        const defocus = Motion.keys([[0, 3.2], [0.8, 0.0], [1.1, 0.8], [1.5, 0.15]], t, Ease.inOut) + 0.05 * Math.sin(t * 1.3);
        const stage = [0.004 * t, -0.002 * t];                 // the stage creeps
        const wash = Ease.inOut(Ease.seg(t, 1.5, 3.0));
        env.state.M.render(g, 'tpl', {
            t, stage,
            a: [t, stage[0], stage[1], wash],
            detector: {
                soft: 1.2, defocus, fringe: 0.25 + 0.3 * defocus,
                noise: { amount: 0.09, power: 0.3, size: 4.4, live: 0.6, hold: 2, sharp: 0.7 },
                bleed: 2.2, light: [1, 1 - 0.05 * wash, 1 - 0.2 * wash],   // highlights burn to the palette's tone once tinted
                gain: 0.12 + 0.88 * Ease.out(Ease.seg(t, 0, 0.5)),   // the beam comes on
            },
        });
        Micrograph.databar(g, env, { x: env.W - 56 - 220, len: 220, label: '100 nm', font: 'VT323', size: 34, colour: '#0e2a2c', shadow: 'rgba(255,255,255,0.5)', alpha: Ease.seg(t, 0.5, 0.9) });
    },
});
