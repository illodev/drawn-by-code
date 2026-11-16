// 2026-11-16-lightfield-test · style lightfield
// The style test of «lightfield»: light photographed, on two of the user's references.
// One file per shot (limb.js, bulb.js): each gives its GLSL and, for a local time, the
// uniforms and the optics of the camera. This file only cuts between them.
const DIR = 'sandbox/2026-11-16-lightfield-test/';
Motion.scene({
    fps: 24,
    duration: 11.5,
    logical: [1600, 900],
    uses: ['styles/lightfield/lightfield.js', DIR + 'limb.js', DIR + 'bulb.js'],
    fonts: [{ family: 'Poppins', src: 'fonts/Poppins-Bold-latin.woff2', descriptors: { weight: '700' } },
            { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2', descriptors: { weight: '500' } }],
    shots: [[0, 5.5, 'Limb'], [5.5, 11.5, 'Bulb']],
    setup(env) {
        const L = Lightfield.make(env);
        L.scene('limb', LFT.limb.glsl);
        L.scene('bulb', LFT.bulb.glsl);
        return { L };
    },
    draw(g, t, env) {
        const { name, local } = Motion.shotAt(this.shots, t);
        const key = name.toLowerCase(), S = LFT[key];
        env.state.L.render(g, key, {
            t: local, frame: Math.round(t * env.fps), ...S.frame(local, env),
            plate: S.plate ? (pg) => S.plate(pg, env) : null, plateKey: key,
        });
    },
});
