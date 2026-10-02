// Tabletop 3D style template: a chrome paper clip hops twice across a cutting mat and lands on
// a red stapler on the beat; a sticky note in front says so. Real materials (chrome, glossy
// plastic, card, cork-free mat), one softbox, a warm lamp, a miniature's depth of field and
// stop motion on twos. Render it with DBC_GPU=1.
const TPL_GLSL = `
// a gem paper clip lying in its xy plane (x along it), wire radius r
float arcBend(vec3 p, vec2 c, float R, float r, float side) {
    vec2 q = p.xy - c;
    if (q.x * side > 0.0) return length(vec2(length(q) - R, p.z)) - r;
    return min(length(vec3(q - vec2(0.0, R), p.z)), length(vec3(q + vec2(0.0, R), p.z))) - r;
}
float clip(vec3 p) {
    const float r = 0.045;
    float d = sdCapsule(p, vec3(0.7, 0.12, 0.0), vec3(2.4, 0.12, 0.0), r);
    d = min(d, sdCapsule(p, vec3(0.7, -0.24, 0.0), vec3(2.75, -0.24, 0.0), r));
    d = min(d, sdCapsule(p, vec3(0.45, 0.42, 0.0), vec3(2.75, 0.42, 0.0), r));
    d = min(d, sdCapsule(p, vec3(0.45, -0.42, 0.0), vec3(2.0, -0.42, 0.0), r));
    d = min(d, arcBend(p, vec2(0.7, -0.06), 0.18, r, -1.0));
    d = min(d, arcBend(p, vec2(2.75, 0.09), 0.33, r, 1.0));
    d = min(d, arcBend(p, vec2(0.45, 0.0), 0.42, r, -1.0));
    return d;
}
float stapler(vec3 p, out float m) {
    vec3 q = p - vec3(2.4, 0.0, -0.6);
    // the base: dark plastic on a rubber pad, the metal anvil at its nose
    float base = sdRoundBox(q - vec3(0.0, 0.26, 0.0), vec3(3.6, 0.2, 0.72), 0.16);
    float pad = sdRoundBox(q - vec3(0.0, 0.05, 0.0), vec3(3.5, 0.05, 0.68), 0.04);
    float anvil = sdRoundBox(q - vec3(2.95, 0.47, 0.0), vec3(0.45, 0.02, 0.3), 0.015);
    // the arm: red, rising a little towards the hinge, a domed chrome cover on top
    vec3 a = q - vec3(0.1, 1.02, 0.0); a.xy = rot(0.035) * a.xy;
    float arm = sdRoundBox(a, vec3(3.45, 0.34, 0.6), 0.28);
    vec3 c = a - vec3(0.25, 0.3, 0.0);
    float cover = max(sdEllipsoid(c, vec3(3.0, 0.22, 0.5)), -c.y - 0.02);
    float hinge = sdCappedCylinder(q, vec3(-3.25, 0.66, -0.52), vec3(-3.25, 0.66, 0.52), 0.33);
    vec2 r = vec2(min(arm, hinge), 3.0);
    r = opU(r, vec2(base, 8.0));
    r = opU(r, vec2(pad, 9.0));
    r = opU(r, vec2(min(cover, anvil), 4.0));
    m = r.y;
    return r.x;
}
vec2 map(vec3 p) {
    // the desk (wood) and the cutting mat on it
    vec2 r = vec2(p.y + 0.0, 1.0);
    float mat = sdBox(p - vec3(0.0, 0.05, 0.0), vec3(9.0, 0.05, 6.0));
    r = opU(r, vec2(mat, 2.0));
    // the far wall
    r = opU(r, vec2(22.0 + p.z, 7.0));
    // a mug behind, out of focus (glazed ceramic)
    vec3 mp = p - vec3(7.5, 0.0, -9.0);
    float cup = sdCylinder(mp - vec3(0.0, 4.75, 0.0), 4.75, 4.1) - 0.1;
    cup = max(cup, -sdCylinder(mp - vec3(0.0, 5.6, 0.0), 4.4, 3.7));
    cup = min(cup, sdTorus((mp - vec3(-4.5, 5.0, 0.0)).xzy, vec2(1.9, 0.42)));
    r = opU(r, vec2(cup, 10.0));
    float sm; float s = stapler(p, sm);
    r = opU(r, vec2(s, sm));
    // the clip, placed by PF(0..11): origin and rotation
    vec3 cp = local(p, 0);
    float bound = length(cp - vec3(1.6, 0.0, 0.0)) - 1.9;
    r = opU(r, bound > 0.3 ? vec2(bound, 0.0) : vec2(clip(cp), 5.0));
    // a sticky note in front (texture uTex0)
    vec3 np = p - vec3(-1.6, 0.11, 3.1);
    np.xz = rot(0.18) * np.xz;
    np.y -= 0.09 * pow(max(0.0, -np.z - 0.6), 2.0); // the far edge curls up
    r = opU(r, vec2(sdBox(np, vec3(1.9, 0.015, 1.9)) * 0.8, 6.0));
    return r;
}
vec3 albedo(float m, vec3 p, vec3 n) {
    if (m == 1.0) { float w = woodGrain(p * vec3(1.0, 1.0, 1.0)); return mix(vec3(0.62, 0.42, 0.26), vec3(0.42, 0.26, 0.15), w); }
    if (m == 2.0) {
        // a green cutting mat: a 1 cm grid, a heavier line every 5
        vec2 g = abs(fract(p.xz + 0.5) - 0.5), g5 = abs(fract(p.xz / 5.0 + 0.5) - 0.5) * 5.0;
        float line = max(smoothstep(0.03, 0.0, min(g.x, g.y)) * 0.55, smoothstep(0.05, 0.0, min(g5.x, g5.y)));
        return mix(vec3(0.16, 0.36, 0.28) * (0.94 + 0.12 * noise(p * 6.0)), vec3(0.78, 0.86, 0.8), line * 0.8);
    }
    if (m == 3.0) return vec3(0.72, 0.08, 0.07);
    if (m == 8.0) return vec3(0.09, 0.09, 0.1);
    if (m == 10.0) return vec3(0.2, 0.36, 0.62);
    if (m == 7.0) return vec3(0.8, 0.74, 0.66);
    if (m == 9.0) return vec3(0.05);
    if (m == 4.0 || m == 5.0) return vec3(0.86, 0.87, 0.9);
    if (m == 6.0) {
        vec3 np = p - vec3(-1.6, 0.11, 3.1); np.xz = rot(0.18) * np.xz;
        vec2 uv = np.xz / 3.8 + 0.5;
        return texture(uTex0, uv).rgb * (0.96 + 0.08 * fibres(p));
    }
    return vec3(0.55, 0.5, 0.46) * (0.9 + 0.1 * noise(p * 0.8));
}
vec4 material(float m) {
    if (m == 3.0) return vec4(0.22, 0.0, 0.0, 0.0);   // glossy plastic
    if (m == 8.0) return vec4(0.4, 0.0, 0.0, 0.0);    // the base, satin plastic
    if (m == 9.0) return vec4(0.9, 0.0, 0.1, 0.0);    // rubber pad
    if (m == 10.0) return vec4(0.14, 0.0, 0.0, 0.0);  // glazed ceramic
    if (m == 4.0) return vec4(0.28, 1.0, 0.0, 0.0);   // brushed steel plate
    if (m == 5.0) return vec4(0.1, 1.0, 0.0, 0.0);    // chrome wire
    if (m == 6.0) return vec4(0.85, 0.0, 0.3, 0.004); // paper
    if (m == 2.0) return vec4(0.7, 0.0, 0.1, 0.0);
    return vec4(0.6, 0.0, 0.1, 0.006);
}
float relief(float m, vec3 p) { return m == 6.0 ? fibres(p) : m == 1.0 ? woodGrain(p) : 0.0; }
`;
Motion.scene({
    fps: 24,
    duration: 3,
    logical: [1600, 900],
    uses: ['styles/tabletop3d/tabletop3d.js'],
    fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 3, 'Template']],
    setup(env) {
        // the sticky note's print: a canvas mapped onto the paper
        const note = document.createElement('canvas');
        note.width = note.height = 512;
        const x = note.getContext('2d');
        x.fillStyle = '#f4d65a';
        x.fillRect(0, 0, 512, 512);
        x.fillStyle = '#2b2a6e';
        x.font = '190px Hand';
        x.textAlign = 'center';
        x.fillText('hop!', 256, 300);
        return { R: Tabletop3D.renderer(env, { scene: TPL_GLSL, scale: 0.6, params: 16 }), note };
    },
    draw(g, t, env) {
        const { V } = Tabletop3D;
        const d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        // two hops on the beats: the clip tilts back (anticipation), flies, lands
        const hop = (t0, t1, a, b, h) => {
            const u = Math.min(1, Math.max(0, (tq - t0) / (t1 - t0)));
            return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 4 * h * u * (1 - u), a[2] + (b[2] - a[2]) * u, u];
        };
        const A = [-6.6, 0.15, 1.1], B = [-4.2, 0.15, 0.5], C = [0.9, 1.5, -0.6];
        let pos, rz = 0, ry = 0.3;
        if (tq < 0.5) { pos = A; rz = tq > 0.3 ? -0.18 : 0; }
        else if (tq < 1.0) { const h = hop(0.5, 1.0, A, B, 1.6); pos = h; rz = -0.18 + h[3] * 0.18; }
        else if (tq < 1.5) { pos = B; rz = tq > 1.3 ? -0.2 : 0; ry = 0.3 + (tq - 1) * 0.3; }
        else if (tq < 2.0) { const h = hop(1.5, 2.0, B, C, 2.4); pos = h; rz = -0.2 + h[3] * 0.2; ry = 0.45 + h[3] * 0.1; }
        else { pos = C; rz = tq < 2.17 ? 0.08 * Math.cos((tq - 2) * 40) : 0; ry = 0.55; }
        // the clip lies flat: its plane (xy) turned onto the table (xz)
        const R = V.mm(V.ry(ry), V.mm(V.rz(rz), V.rx(-Math.PI / 2)));
        const nd = Tabletop3D.nudge(d, 'clip', 0.006);
        const p = [pos[0] + nd[0], pos[1] + 0.045, pos[2] + nd[2], ...R, 0, 0, 0, 0];
        env.state.R.render(g, d, {
            p, cam: [-1.2, 6.2, 13.5], target: [-0.6, 0.6, 0.0], fov: 0.5, focus: 14.2, aperture: 0.35,
            keyDir: [-0.55, 0.8, 0.45], key: 2.3, soft: 6, lampPos: [9, 9, -2], lamp: 1.1, lampReach: 12,
            exposure: Tabletop3D.flicker(d), textures: [env.state.note],
        });
    },
    post(g, t, env) {
        Tabletop3D.post(g, env, Math.floor(t * 12 + 1e-6));
    },
});
