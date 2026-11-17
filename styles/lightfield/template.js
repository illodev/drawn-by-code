// Lightfield style template: a point of light heating up in a dusty dark room, the air and
// the dust lit by it, and a title emitted as light through the same lens and film.
const TPL_GLSL = `
#define HEAT uA[0]
#define TITLE uA[1]
vec3 radiance(vec2 p) {
    vec2 s = vec2(0.0, 0.12);
    float d = length(p - s);
    // heat is a temperature: a dull red ember that whitens as it climbs
    vec3 hot = blackbody(1000.0 + 1900.0 * min(HEAT, 1.1)) * HEAT * HEAT * HEAT;
    // the room: a dark blue wall, mottled, darker towards the corners
    vec3 c = emit(vec3(0.010, 0.13, 0.28) * (0.55 + 0.9 * fbm(p * 2.4 + 3.0)) * (1.0 - 0.55 * smoothstep(0.2, 1.0, dot(p, p))));
    // the body of the light: small and very bright; its halo is the lens's work, not painted
    c += hot * 2600.0 * smoothstep(0.006 + uPx, 0.006 - uPx, d);
    // what it lights: the air round it, and the dust
    float fall = 1.0 / (1.0 + d * d * 90.0);
    c += hot * 0.22 * fall * fall * (0.4 + 1.2 * fbm(p * 3.0 + vec2(uT * 0.04, 0.0)));
    float m = motes(p, 0.075, uT, 1.0, 0.0009, 0.0026, 0.2) * step(0.4, hash(floor(p / 0.075) + 7.0))
            + 0.5 * motes(p + 0.37, 0.19, uT * 0.7, 2.0, 0.005, 0.012, 1.0);
    c += (hot * 7.0 * fall + emit(vec3(0.06, 0.12, 0.20))) * m;
    // the title, as light
    vec4 t = plate(p);
    c += lin(t.rgb) * t.a * 7.0 * TITLE;
    return c;
}
`;
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/lightfield/lightfield.js'],
    fonts: [{ family: 'Poppins', src: 'fonts/Poppins-Bold-latin.woff2', descriptors: { weight: '700' } },
            { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2', descriptors: { weight: '500' } }],
    shots: [[0, 4, 'Template']],
    setup(env) {
        return { L: Lightfield.make(env).scene('tpl', TPL_GLSL) };
    },
    draw(g, t, env) {
        // a light does not switch on: it climbs, overshoots a little, settles and trembles
        const heat = Motion.keys([[0, 0], [0.3, 0.12], [0.7, 0.3], [1.4, 1.09], [2.0, 1]], t, Ease.inOut) * (1 + 0.012 * Math.sin(t * 37));
        const title = Ease.out(Ease.seg(t, 1.6, 2.6));
        env.state.L.render(g, 'tpl', {
            t, a: [heat, title],
            plateKey: 'title',
            plate: (pg) => {
                pg.textBaseline = 'alphabetic';
                pg.font = '500 150px Lora';
                const w1 = pg.measureText('light').width;
                pg.font = '700 150px Poppins';
                const w2 = pg.measureText('field').width, x = (env.W - w1 - w2 - 6) / 2;
                pg.font = '500 150px Lora';
                pg.fillStyle = '#ffc94a';
                pg.fillText('light', x, 640);
                pg.font = '700 150px Poppins';
                pg.fillStyle = '#ffffff';
                pg.fillText('field', x + w1 + 6, 640);
            },
            optics: {
                bloom: 0.2, bloomWeights: [1.0, 1.4, 1.6, 1.3, 0.9, 0.5, 0.2], halation: [1, 0.35, 0.08], halationFrom: 4,
                streaks: { gain: 0.11, threshold: 40, length: 0.3, falloff: 9, rays: 8, level: 3, seed: 3, irregular: 0.45, rot: 0.3, tint: [1, 0.6, 0.3] },
                ca: 0.0006, vignette: 0.15, soften: 0.15,
                grain: { amount: 0.04, size: 1.7, chroma: 0.3, floor: 0.35 },
            },
        });
    },
});
