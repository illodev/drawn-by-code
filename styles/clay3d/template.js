// Clay 3D style template: a coral clay ball dropping onto a cream clay table, squashing on
// the beat, lit by the warm key with soft shadows and depth of field. Stop motion on twos.
const TPL_GLSL = `
#define Y uA[0]
#define SQ uA[1]
vec2 map(vec3 p) {
    vec2 r = vec2(sdRoundBox(p - vec3(0.0, 0.9, 0.0), vec3(2.5, 0.1, 1.5), 0.05), 1.0);
    r = opU(r, vec2(p.z + 2.0, 2.0));
    vec3 q = p - vec3(0.0, Y, 0.2);
    r = opU(r, vec2(sdEllipsoid(q, vec3(0.35 * SQ, 0.35 / SQ, 0.35 * SQ)), 3.0));
    return r;
}
vec3 albedo(float m, vec3 p, vec3 n) { return m == 1.0 ? vec3(0.85, 0.78, 0.64) : m == 2.0 ? vec3(0.62, 0.74, 0.66) : vec3(0.82, 0.34, 0.25); }
vec4 material(float m) { return m == 3.0 ? vec4(0.3, 22.0, 0.35, 1.0) : vec4(0.05, 8.0, 0.1, 0.5); }
vec3 background(vec3 rd) { return vec3(0.3, 0.26, 0.22); }
`;
Motion.scene({
    fps: 24,
    duration: 3,
    logical: [1600, 900],
    uses: ['styles/clay3d/clay3d.js'],
    bpm: 120,
    shots: [[0, 3, 'Template']],
    setup(env) {
        return { R: Clay3D.renderer(env, { scene: TPL_GLSL, scale: 0.5 }) };
    },
    draw(g, t, env) {
        const d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        const y = Motion.keys([[0, 3.0], [1.0, 1.35], [1.3, 1.8], [1.6, 1.35], [3, 1.35]], tq);
        const sq = tq >= 1.0 && tq < 1.09 ? 1.3 : tq >= 1.6 && tq < 1.69 ? 1.12 : 1;
        const a = [y - (sq > 1 ? 0.06 : 0), sq];
        a[95] = d % 3;
        env.state.R.render(g, d, { a, cam: [0, 1.7, 4.2], target: [0, 1.3, 0], fov: 0.55, focus: 4.2, aperture: 0.2, light: [-0.65, 0.72, 0.7] });
    },
});
