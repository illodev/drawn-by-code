// 2026-11-16-lightfield-test · style lightfield
// «lightfield»: light photographed. Five lights, from the sky to the bench: the Sun over
// the edge of the Earth, the Sun behind the Moon, a beam split by a prism, one colour
// through two slits, and a filament that lights the title. The first and the last shot are
// matched to the user's reference stills; the three in between are our own.
// One file per shot: each gives its GLSL and, for a local time, the uniforms and the optics
// of the camera. This file only cuts between them.
const DIR = 'sandbox/2026-11-16-lightfield-test/';
Motion.scene({
    fps: 24,
    duration: 30.5,
    logical: [1600, 900],
    uses: ['styles/lightfield/lightfield.js', DIR + 'limb.js', DIR + 'eclipse.js', DIR + 'lab.js', DIR + 'prism.js', DIR + 'slits.js', DIR + 'bulb.js'],
    fonts: [{ family: 'Poppins', src: 'fonts/Poppins-Bold-latin.woff2', descriptors: { weight: '700' } },
            { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2', descriptors: { weight: '500' } }],
    audio: { mix: 'mix.wav' },      // sh mix-sound.sh makes it (synthesised: music.mjs + sound-design.mjs)
    shots: [[0, 5.5, 'Limb'], [5.5, 12, 'Eclipse'], [12, 18.5, 'Prism'], [18.5, 24.5, 'Slits'], [24.5, 30.5, 'Bulb']],
    setup(env) {
        const L = Lightfield.make(env);
        for (const [, , name] of this.shots) L.scene(name.toLowerCase(), LFT[name.toLowerCase()].glsl);
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
