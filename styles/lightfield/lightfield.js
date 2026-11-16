// Lightfield style kit: light photographed, not drawn. A scene is a fragment shader that
// returns scene-referred radiance (linear, unbounded: a filament is 60, a sun 4000), and the
// kit is the camera in front of it: a lens that scatters (bloom over seven octaves, the wide
// ones tinted like film halation), an iris that diffracts (rays out of anything bright
// enough), chromatic aberration, vignette, a film curve that burns highlights to white, and
// grain that follows the signal. Everything a frame shows, text included, goes through that
// camera: that is what makes two scenes look shot on the same stock.
// Global: Lightfield.
//
//   const L = Lightfield.make(env, { scale: 1 })      one WebGL2 context for the film
//   L.scene('limb', GLSL)                             a scene: defines vec3 radiance(vec2 p)
//   L.render(g, 'limb', { t, frame, a: [floats…], optics: {…}, plate: (g2) => {…}, plateKey })
//
// Scene GLSL: `vec3 radiance(vec2 p)`, p in frame units (y up, the frame is 1 high:
// y ∈ [−0.5, 0.5], x ∈ [−aspect/2, aspect/2]). It gets: uT (seconds), uFrame, uAspect, uPx
// (one output pixel in frame units, for antialiased edges), uA[64] (the scene's animation:
// `#define SUN uA[0]`), and the helpers of PRELUDE below (hash, noise, fbm, blackbody, lin,
// disc, motes, plate).
//
// plate: a 2D canvas the scene's JS paints (logical units, like any draw) and the shader reads
// with `plate(p)` (straight alpha, sRGB): titles are emitted as light (`lin(c.rgb) * c.a *
// 40.0`), so they bloom, burn and take grain like the rest. It is repainted when plateKey
// changes.
//
// optics (all optional, see DEFAULTS): exposure, toe, bloom, bloomWeights[7], halation [r,g,b],
// streaks { gain, threshold, length, falloff, rays, level, seed, rot, irregular, tint }, ca, vignette, soften,
// grain { amount, size, chroma, floor }, saturation, lift [r,g,b].
const Lightfield = (() => {
    const LEVELS = 7;
    const DEFAULTS = {
        exposure: 1,
        toe: 0.004,                                   // black crush: radiance well under it never exposes the film
        bloom: 0.5,                                   // how much of the light the lens scatters
        bloomWeights: [0.9, 1, 0.8, 0.6, 0.45, 0.3, 0.2], // per octave, from 2 px to ~1/8 of the frame
        halation: [1, 0.32, 0.08],                    // what the widest octaves are tinted towards
        halationFrom: 2,                              // the octave where the tint starts
        streaks: null,                                // { gain, threshold, length, rays, level, seed, rot, tint }
        ca: 0.0012,                                   // chromatic aberration at the frame's corner
        vignette: 0.25,
        soften: 0.25,                                 // 0 = a sharp lens, 1 = half resolution
        grain: { amount: 0.06, size: 1.6, chroma: 0.35, floor: 0.15 },
        saturation: 1,
        lift: [0, 0, 0],
    };
    const VS = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;
    const HEAD = `#version 300 es
precision highp float;
precision highp int;
`;
    // integer lattice hashes: a float hash differs by GPU (engine skill, pyramid-engraving)
    const HASH = `
uint hu(uint x) { x ^= x >> 16; x *= 0x7feb352dU; x ^= x >> 15; x *= 0x846ca68bU; x ^= x >> 16; return x; }
float hf(uint x) { return float(hu(x) >> 8) * (1.0 / 16777216.0); }
uint lat(ivec2 i) { return hu(uint(i.x) * 0x9E3779B9U ^ hu(uint(i.y) + 0x7F4A7C15U)); }
float hash(vec2 p) { return hf(lat(ivec2(floor(p)))); }
float hash(vec3 p) { ivec3 i = ivec3(floor(p)); return hf(lat(i.xy) ^ hu(uint(i.z) * 0x85EBCA6BU + 0x165667B1U)); }
vec2 hash2(vec2 p) { uint h = lat(ivec2(floor(p))); return vec2(hf(h), hf(h ^ 0x68E31DA4U)); }
vec3 hash3(vec2 p) { uint h = lat(ivec2(floor(p))); return vec3(hf(h), hf(h ^ 0x68E31DA4U), hf(h ^ 0xB5297A4DU)); }
float noise(vec2 x) {
    vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float noise(vec3 x) {
    vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
`;
    const PRELUDE = HEAD + `
uniform vec2 uRes;
uniform float uT, uFrame, uAspect, uPx, uToe;
uniform float uA[64];
uniform sampler2D uPlate;
out vec4 fragColor;
const float PI = 3.14159265;
` + HASH + `
float sat(float x) { return clamp(x, 0.0, 1.0); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + 17.3; a *= 0.5; } return s; }
float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 17.3; a *= 0.5; } return s; }
// sRGB (as measured on a reference, 0–1) to linear light
vec3 lin(vec3 c) { return pow(max(c, 0.0), vec3(2.2)); }
// what the film curve of the kit turns into the display value v (0–1): the radiance to emit
// so that a flat area comes out as the colour measured on a reference
vec3 emit(vec3 srgb) { vec3 x = -log(1.0 - min(lin(srgb), vec3(0.985))); return 0.5 * (x + sqrt(x * x + 4.0 * x * uToe)); }
// the colour of a glowing body at k kelvin, normalised to its red (1900 a dull ember, 2700 a
// filament, 5800 the sun, 9000 a blue star): heat is a temperature, never a picked orange
vec3 blackbody(float k) {
    float t = k / 100.0;
    float g = t <= 66.0 ? 0.39008 * log(t) - 0.63184 : 1.12989 * pow(t - 60.0, -0.07551);
    float b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : 0.54320 * log(t - 10.0) - 1.19625);
    float r = t <= 66.0 ? 1.0 : 1.29293 * pow(t - 60.0, -0.13320);
    return lin(clamp(vec3(r, g, b), 0.0, 1.0));
}
// an out-of-focus point of light: a disc with a soft rim (blur 0 = a sharp dot, 1 = a gaussian)
float disc(vec2 d, float r, float blur) {
    float l = length(d);
    return mix(smoothstep(r + uPx, r - uPx, l), exp(-l * l / (r * r * 0.5)), blur);
}
// dust in the air: one mote per cell of a grid, each with its own size, brightness, twinkle
// and a slow drift that never leaves its cell (so no neighbours need checking). Layer it at
// two or three cell sizes for depth; the big, dim, blurred ones are the near ones.
float motes(vec2 p, float cell, float t, float seed, float rMin, float rMax, float blur) {
    vec2 g = p / cell, i = floor(g);
    vec3 h = hash3(i + seed * 37.0);
    vec3 k = hash3(i + seed * 37.0 + 91.0);
    float r = mix(rMin, rMax, h.z * h.z) / cell;
    vec2 c = 0.5 + (0.5 - r - 0.02) * 0.9 * vec2(sin(t * (0.25 + 0.5 * k.x) + h.x * 6.283), cos(t * (0.2 + 0.45 * k.y) + h.y * 6.283)) * (0.4 + 0.6 * k.z);
    float tw = 0.55 + 0.45 * sin(t * (0.7 + 2.2 * k.z) + k.x * 40.0);
    return step(0.35, k.y) * tw * (0.25 + 0.75 * k.x * k.x) * disc(fract(g) - c, r, blur);
}
vec4 plate(vec2 p) { return texture(uPlate, vec2(p.x / uAspect + 0.5, p.y + 0.5)); }
`;
    const MAIN = `
void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    fragColor = vec4(max(radiance(p), 0.0), 1.0);
}
`;
    // lens scatter: a dual-filter pyramid (each level half the last), blurred on the way down
    // and summed on the way up with a weight and a tint per octave
    const DOWN = HEAD + `
uniform sampler2D uTex; uniform vec2 uTexel, uRes; out vec4 o;
void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec3 c = texture(uTex, uv).rgb * 4.0;
    c += texture(uTex, uv + uTexel * vec2(-1, -1)).rgb + texture(uTex, uv + uTexel * vec2(1, -1)).rgb;
    c += texture(uTex, uv + uTexel * vec2(-1, 1)).rgb + texture(uTex, uv + uTexel * vec2(1, 1)).rgb;
    o = vec4(min(c / 8.0, vec3(60000.0)), 1.0);
}
`;
    const UP = HEAD + `
uniform sampler2D uTex, uSame; uniform vec2 uTexel, uRes; uniform vec3 uW; out vec4 o;
void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec3 c = texture(uTex, uv + uTexel * vec2(-1, 0)).rgb + texture(uTex, uv + uTexel * vec2(1, 0)).rgb + texture(uTex, uv + uTexel * vec2(0, -1)).rgb + texture(uTex, uv + uTexel * vec2(0, 1)).rgb;
    c += 2.0 * (texture(uTex, uv + uTexel * vec2(-0.5, -0.5)).rgb + texture(uTex, uv + uTexel * vec2(0.5, -0.5)).rgb + texture(uTex, uv + uTexel * vec2(-0.5, 0.5)).rgb + texture(uTex, uv + uTexel * vec2(0.5, 0.5)).rgb);
    o = vec4(c / 12.0 + uW * texture(uSame, uv).rgb, 1.0);
}
`;
    // iris diffraction: what is brighter than a threshold is smeared along one ray (two
    // cascaded passes of 8 taps = a 64-tap exponential tail)
    const BRIGHT = HEAD + `
uniform sampler2D uTex; uniform vec2 uRes; uniform float uTh; out vec4 o;
void main() {
    vec3 c = texture(uTex, gl_FragCoord.xy / uRes).rgb;
    float m = max(c.r, max(c.g, c.b));
    o = vec4(c * smoothstep(uTh, uTh * 3.0, m), 1.0);
}
`;
    const STREAK = HEAD + `
uniform sampler2D uTex; uniform vec2 uRes, uDir; uniform float uDecay, uGain; out vec4 o;
void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec3 acc = vec3(0.0); float w = 1.0;
    for (int i = 0; i < 8; i++) { acc += texture(uTex, uv - uDir * float(i)).rgb * w; w *= uDecay; }
    o = vec4(acc * uGain, 1.0);
}
`;
    // the camera body: aberration, vignette, the film curve, grain
    const FILM = HEAD + `
uniform sampler2D uHdr, uSoft, uBloom, uStreak;
uniform vec2 uRes;
uniform float uFrame, uExposure, uBloomGain, uStreakGain, uCA, uVig, uSoften, uSat, uToe;
uniform vec4 uGrain; // amount, size (px at 1080), chroma, floor
uniform vec3 uLift, uStreakTint;
out vec4 o;
` + HASH + `
vec3 light(vec2 uv) {
    vec3 c = mix(texture(uHdr, uv).rgb, texture(uSoft, uv).rgb, uSoften);
    return c * (1.0 - uBloomGain) + uBloomGain * texture(uBloom, uv).rgb + uStreakGain * uStreakTint * texture(uStreak, uv).rgb;
}
void main() {
    vec2 uv = gl_FragCoord.xy / uRes, d = uv - 0.5;
    float asp = uRes.x / uRes.y;
    float r2 = dot(d * vec2(asp, 1.0), d * vec2(asp, 1.0)) / (0.25 * (asp * asp + 1.0)); // 1 at the corner
    vec3 c = vec3(light(uv + d * uCA * 2.0).r, light(uv).g, light(uv - d * uCA * 2.0).b);
    float v = 1.0 / (1.0 + uVig * r2);
    c *= uExposure * v * v;
    c = c * c / (c + uToe);                  // the toe: light too weak to expose the film stays black
    c = 1.0 - exp(-c);                       // film: every channel saturates on its own, so highlights burn to white
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(l), c, uSat);
    c = pow(max(c, 0.0), vec3(1.0 / 2.2));
    c = c + uLift * (1.0 - c);
    // grain: silver clumps a couple of pixels across plus a fine tooth, new every frame,
    // and proportional to the signal (black stays black unless floor says otherwise)
    float s = uRes.y / 1080.0 * uGrain.y, f = uFrame * 13.0;
    vec2 gp = gl_FragCoord.xy / s;
    vec3 n = vec3(noise(vec3(gp, f)), noise(vec3(gp + 31.7, f + 5.0)), noise(vec3(gp + 77.1, f + 9.0)));
    vec3 fine = vec3(hash(vec3(gl_FragCoord.xy, f + 1.0)), hash(vec3(gl_FragCoord.xy, f + 2.0)), hash(vec3(gl_FragCoord.xy, f + 3.0)));
    n = (n - 0.5) * 1.6 + (fine - 0.5) * 0.7;
    n = mix(vec3(n.g), n, uGrain.z);
    float ld = dot(c, vec3(0.299, 0.587, 0.114));
    float env = mix(uGrain.w, 1.0, smoothstep(0.0, 0.35, ld)) * (1.0 - 0.5 * smoothstep(0.75, 1.0, ld));
    c += n * uGrain.x * env;
    c += (hash(vec3(gl_FragCoord.xy, f + 7.0)) - 0.5) / 255.0;
    o = vec4(c, 1.0);
}
`;
    function make(env, o = {}) {
        const scale = o.scale ?? 1;
        const W = Math.round(env.px[0] * scale), H = Math.round(env.px[1] * scale);
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false });
        if (!gl) throw new Error('Lightfield: no WebGL2');
        if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('Lightfield: no float render targets (EXT_color_buffer_float)');
        const compile = (type, src, what) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`Lightfield shader (${what}): ` + gl.getShaderInfoLog(s));
            return s;
        };
        const vs = compile(gl.VERTEX_SHADER, VS, 'vertex');
        const program = (fs, what) => {
            const p = gl.createProgram();
            gl.attachShader(p, vs);
            gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs, what));
            gl.bindAttribLocation(p, 0, 'p');
            gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`Lightfield link (${what}): ` + gl.getProgramInfoLog(p));
            const locs = new Map();
            return { p, u: (n) => { if (!locs.has(n)) locs.set(n, gl.getUniformLocation(p, n)); return locs.get(n); } };
        };
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const target = (w, h) => {
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
            for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
            const fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            return { tex, fb, w, h };
        };
        const hdr = target(W, H);
        const down = [], up = [];
        for (let i = 1; i <= LEVELS; i++) {
            const w = Math.max(2, Math.round(W / 2 ** i)), h = Math.max(2, Math.round(H / 2 ** i));
            down.push(target(w, h));
            up.push(target(w, h));
        }
        const streakT = new Map(); // per level: bright, ping, sum
        const streakTargets = (lv) => {
            if (!streakT.has(lv)) { const { w, h } = down[lv - 1]; streakT.set(lv, [target(w, h), target(w, h), target(w, h)]); }
            return streakT.get(lv);
        };
        const P = { down: program(DOWN, 'down'), up: program(UP, 'up'), bright: program(BRIGHT, 'bright'), streak: program(STREAK, 'streak'), film: program(FILM, 'film') };
        const scenes = new Map();
        // the plate: a 2D canvas the shader reads as a texture
        const plateCv = document.createElement('canvas');
        plateCv.width = W;
        plateCv.height = H;
        const plateTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, plateTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plateCv);
        for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
        let plateKey;
        const bind = (unit, tex) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); };
        const into = (t) => { gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fb : null); gl.viewport(0, 0, t ? t.w : W, t ? t.h : H); };
        const draw = () => gl.drawArrays(gl.TRIANGLES, 0, 3);

        function render(g, name, f = {}) {
            const S = scenes.get(name);
            if (!S) throw new Error('Lightfield: no scene «' + name + '»');
            const op = { ...DEFAULTS, ...(f.optics ?? {}) };
            op.grain = { ...DEFAULTS.grain, ...(f.optics?.grain ?? {}) };
            const frame = f.frame ?? Math.round((f.t ?? 0) * env.fps);
            if (f.plate && f.plateKey !== plateKey) {
                const pg = plateCv.getContext('2d');
                pg.setTransform(1, 0, 0, 1, 0, 0);
                pg.clearRect(0, 0, W, H);
                pg.setTransform(W / env.W, 0, 0, H / env.H, 0, 0);
                pg.save();
                f.plate(pg);
                pg.restore();
                bind(1, plateTex);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plateCv);
                plateKey = f.plateKey;
            }
            gl.disable(gl.BLEND);
            // 1 · the scene, as radiance
            into(hdr);
            gl.useProgram(S.p);
            gl.uniform2f(S.u('uRes'), W, H);
            gl.uniform1f(S.u('uT'), f.t ?? 0);
            gl.uniform1f(S.u('uFrame'), frame);
            gl.uniform1f(S.u('uAspect'), W / H);
            gl.uniform1f(S.u('uPx'), 1 / H);
            gl.uniform1f(S.u('uToe'), op.toe);
            const a = new Float32Array(64);
            (f.a ?? []).forEach((v, i) => (a[i] = v));
            gl.uniform1fv(S.u('uA'), a);
            bind(1, plateTex);
            gl.uniform1i(S.u('uPlate'), 1);
            draw();
            // 2 · the lens: down the pyramid…
            gl.useProgram(P.down.p);
            gl.uniform1i(P.down.u('uTex'), 0);
            let src = hdr;
            for (const d of down) {
                into(d);
                bind(0, src.tex);
                gl.uniform2f(P.down.u('uTexel'), 1 / src.w, 1 / src.h);
                gl.uniform2f(P.down.u('uRes'), d.w, d.h);
                draw();
                src = d;
            }
            // …and up, each octave with its weight, the wide ones tinted (halation)
            gl.useProgram(P.up.p);
            gl.uniform1i(P.up.u('uTex'), 0);
            gl.uniform1i(P.up.u('uSame'), 2);
            const wsum = op.bloomWeights.reduce((s, w) => s + w, 0);
            for (let i = LEVELS - 1; i >= 0; i--) {
                into(up[i]);
                const below = i === LEVELS - 1 ? null : up[i + 1];
                bind(0, below ? below.tex : down[i].tex);
                bind(2, down[i].tex);
                gl.uniform2f(P.up.u('uTexel'), below ? 1 / below.w : 0, below ? 1 / below.h : 0);
                gl.uniform2f(P.up.u('uRes'), up[i].w, up[i].h);
                const k = Math.min(1, Math.max(0, (i + 1 - op.halationFrom) / Math.max(1, LEVELS - op.halationFrom)));
                const w = (op.bloomWeights[i] ?? 0) / wsum;
                // the deepest level has nothing below: its «below» sample is itself with weight 0
                gl.uniform3f(P.up.u('uW'), w * (1 + (op.halation[0] - 1) * k), w * (1 + (op.halation[1] - 1) * k), w * (1 + (op.halation[2] - 1) * k));
                if (!below) { gl.uniform2f(P.up.u('uTexel'), 0, 0); bind(0, zero.tex); }
                draw();
            }
            // 3 · the iris: rays out of whatever is bright enough
            const st = op.streaks && op.streaks.gain > 0 ? op.streaks : null;
            let sum = zero;
            if (st) {
                const lv = st.level ?? 3, [bright, ping, acc] = streakTargets(lv);
                sum = acc;
                into(bright);
                gl.useProgram(P.bright.p);
                bind(0, down[lv - 1].tex);
                gl.uniform1i(P.bright.u('uTex'), 0);
                gl.uniform2f(P.bright.u('uRes'), bright.w, bright.h);
                gl.uniform1f(P.bright.u('uTh'), st.threshold ?? 8);
                draw();
                into(acc);
                gl.clearColor(0, 0, 0, 1);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.useProgram(P.streak.p);
                gl.uniform1i(P.streak.u('uTex'), 0);
                gl.uniform2f(P.streak.u('uRes'), bright.w, bright.h);
                for (const r of rays(st)) {
                    // len is where the ray has fallen to e^−falloff (64 taps reach it): a steep
                    // falloff on a very bright source is what tapers a ray to a point; a
                    // gentle one saturates the film along its whole length and draws a bar
                    const step = r.len / 64, dx = Math.cos(r.angle) * step / (W / H), dy = Math.sin(r.angle) * step, decay = Math.exp(-(st.falloff ?? 9) / 64);
                    into(ping);
                    gl.disable(gl.BLEND);
                    bind(0, bright.tex);
                    gl.uniform2f(P.streak.u('uDir'), dx, dy);
                    gl.uniform1f(P.streak.u('uDecay'), decay);
                    gl.uniform1f(P.streak.u('uGain'), 1);
                    draw();
                    into(acc);
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.ONE, gl.ONE);
                    bind(0, ping.tex);
                    gl.uniform2f(P.streak.u('uDir'), dx * 8, dy * 8);
                    gl.uniform1f(P.streak.u('uDecay'), decay ** 8);
                    gl.uniform1f(P.streak.u('uGain'), r.gain * (1 - decay));
                    draw();
                }
                gl.disable(gl.BLEND);
            }
            // 4 · the camera body
            into(null);
            gl.useProgram(P.film.p);
            bind(0, hdr.tex);
            bind(2, up[0].tex);
            bind(3, down[0].tex);
            bind(4, sum.tex);
            gl.uniform1i(P.film.u('uHdr'), 0);
            gl.uniform1i(P.film.u('uBloom'), 2);
            gl.uniform1i(P.film.u('uSoft'), 3);
            gl.uniform1i(P.film.u('uStreak'), 4);
            gl.uniform2f(P.film.u('uRes'), W, H);
            gl.uniform1f(P.film.u('uFrame'), frame);
            gl.uniform1f(P.film.u('uExposure'), op.exposure);
            gl.uniform1f(P.film.u('uBloomGain'), op.bloom);
            gl.uniform1f(P.film.u('uStreakGain'), st ? st.gain : 0);
            gl.uniform3fv(P.film.u('uStreakTint'), st?.tint ?? [1, 1, 1]);
            gl.uniform1f(P.film.u('uCA'), op.ca);
            gl.uniform1f(P.film.u('uVig'), op.vignette);
            gl.uniform1f(P.film.u('uSoften'), op.soften);
            gl.uniform1f(P.film.u('uSat'), op.saturation);
            gl.uniform1f(P.film.u('uToe'), op.toe);
            gl.uniform4f(P.film.u('uGrain'), op.grain.amount, op.grain.size, op.grain.chroma, op.grain.floor);
            gl.uniform3fv(P.film.u('uLift'), op.lift);
            draw();
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.imageSmoothingQuality = 'high';
            g.drawImage(cv, 0, 0, env.px[0], env.px[1]);
            g.restore();
        }
        const zero = target(2, 2);
        into(zero);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return {
            W, H, gl,
            scene(name, glsl) { scenes.set(name, program(PRELUDE + glsl + MAIN, 'scene ' + name)); return this; },
            render,
        };
    }
    // The rays of an iris: `rays` is a count (blades: n rays, evenly spread and then
    // disturbed by the seed, the way a real iris is never regular) or a list of
    // { angle, len, gain }. Lengths in frame units.
    function rays(st) {
        if (Array.isArray(st.rays)) return st.rays.map((r) => ({ angle: r.angle + (st.rot ?? 0), len: r.len ?? st.length ?? 0.2, gain: r.gain ?? 1 }));
        const n = st.rays ?? 12, rnd = Motion.rng('lightfield-rays-' + (st.seed ?? 1)), irr = st.irregular ?? 0.5, out = [];
        for (let i = 0; i < n; i++) {
            out.push({
                angle: (st.rot ?? 0) + ((i + (rnd() - 0.5) * 0.7 * irr) / n) * Math.PI * 2,
                len: (st.length ?? 0.2) * (1 - irr * 0.55 * rnd()),
                gain: 1 - irr * 0.6 * rnd(),
            });
        }
        return out;
    }
    return { make, DEFAULTS, rays };
})();
