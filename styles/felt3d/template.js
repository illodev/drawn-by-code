// Felt 3D style template: a needle-felted ball creature with glass bead eyes and a stitched
// smile hops on the beat in front of a painted backdrop (the puppet has alpha: any backdrop
// can go behind it) and casts its shadow on the backdrop's floor. Stop motion on twos.
const TPL_GLSL = `
vec2 map(vec3 p) {
    vec3 q = p - vec3(0.0, 0.32 + PF(0), 0.0);
    q.y /= PF(1);
    float d = sdEllipsoid(q, vec3(0.3, 0.28, 0.28)) + lumps(q, 0.006);
    d = smin(d, sdRoundCone(vec3(abs(q.x), q.y, q.z * 2.0), vec3(0.14, 0.18, 0.0), vec3(0.2, 0.34, 0.0), 0.07, 0.015) / 2.0, 0.03);
    vec2 r = vec2(d * PF(1), 1.0);
    r = opU(r, vec2(sdSphere(vec3(abs(q.x), q.y, q.z) - vec3(0.1, 0.06, 0.25), 0.035), 2.0));
    return r;
}
vec3 albedo(float m, vec3 p, vec3 n) {
    if (m == 2.0) return vec3(0.02);
    vec3 q = p - vec3(0.0, 0.32 + PF(0), 0.0);
    // a stitched smile
    float s = abs(length(q.xy - vec2(0.0, 0.03)) - 0.07);
    float smile = step(q.y, -0.02) * step(0.2, q.z) * smoothstep(0.006, 0.003, s);
    return mix(vec3(0.42, 0.62, 0.86) * (0.9 + 0.2 * noise(p * vec3(300.0, 100.0, 300.0))), vec3(0.2, 0.2, 0.35), smile);
}
vec4 material(float m) { return m == 2.0 ? vec4(1.2, 90.0, 0.0, 0.0) : vec4(0.02, 4.0, 0.55, 0.013); }
`;
Motion.scene({
    fps: 24,
    duration: 3,
    logical: [1600, 900],
    uses: ['styles/felt3d/felt3d.js'],
    bpm: 120,
    shots: [[0, 3, 'Template']],
    setup(env) {
        return { R: Felt3D.renderer(env, { scene: TPL_GLSL, scale: 0.6, params: 4 }) };
    },
    draw(g, t, env) {
        const d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        // the backdrop: a painted wall and floor (any image would do)
        const gr = g.createLinearGradient(0, 0, 0, 900);
        gr.addColorStop(0, '#f3dcc4');
        gr.addColorStop(0.55, '#efcfae');
        gr.addColorStop(0.551, '#c99a6e');
        gr.addColorStop(1, '#b8845a');
        g.fillStyle = gr;
        g.fillRect(0, 0, 1600, 900);
        // a hop per beat: up, land squashed, recover
        const ph = (tq * 2) % 1;
        const y = Math.max(0, Math.sin(ph * Math.PI)) * 0.25;
        const sq = ph < 0.08 ? 0.82 : ph < 0.16 ? 1.08 : 1;
        env.state.R.render(g, d, { p: [y, sq], boil: d % 3, cam: [0, 0.45, 3.2], target: [0, 0.35, 0], fov: 0.5, light: [-0.6, 0.8, 0.6], shadow: 0.6 });
    },
});
