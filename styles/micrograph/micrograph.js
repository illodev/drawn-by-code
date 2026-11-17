// Micrograph style kit: an image made by an instrument and tinted afterwards. A scene is a
// fragment shader that describes a specimen, not a picture: for every point, how much
// signal the detector gets there (one grey value) and which ink the colourist laid over
// that region. The kit is the instrument and the colourist: focus (a blur whose fringe
// swells round every edge when it is off), the detector's grain (a band-limited speckle,
// that follows the signal, new every exposure), gain and offset, and then false colour:
// the grey signal runs through a ramp black → ink → white, with the ink's edges softer than
// the signal's, because they were painted with a soft brush. Colour never carries detail.
// Global: Micrograph.
//
//   const M = Micrograph.make(env, { scale: 1 })      one WebGL2 context for the film
//   M.scene('field', GLSL, { data, width })           defines void specimen(vec2 p, out float s, out vec3 ink)
//   M.render(g, 'field', { t, frame, a: [floats…], stage: [x, y], detector: {…}, plate, plateKey })
//
// Scene GLSL: `void specimen(vec2 p, out float s, out vec3 ink)`; p in frame units (y up,
// the frame is 1 high: y ∈ [−0.5, 0.5], x ∈ [−aspect/2, aspect/2]); s is the signal as the
// display will show it (0 black … 1 white, before the instrument); ink is an sRGB colour,
// pure at its own luminance (s equal to the ink's luminance shows the ink itself, less
// darkens it towards black, more lifts it towards white). It may also set the global `grit`:
// the specimen's own grain at that point (stain crystals, what the thing is made of), as a
// share of the signal (± 0.3 is a lot). Structures are soft and their grain is not: grit is
// multiplied in after the softening (`soft`), and only the instrument's defocus blurs it.
// It gets uT, uFrame, uAspect, uPx, uA[256] and the helpers of PRELUDE below.
//
// data: tables measured on a reference (an outline as radii, a tone per ring and sector) go
// in as a flat array of floats, `width` per row, and the shader reads them with
// `datum(column, row)`, which keeps big const arrays out of the shader.
//
// plate: a 2D canvas the scene's JS paints (logical units) and the shader reads with
// `plate(p)`: text that belongs to the specimen (stained, blurred and grainy like the rest).
// A databar (scale bar, magnification) is not specimen: draw it on `g` after render().
//
// stage: where the specimen holder is, in frame units; the part of the grain that belongs
// to the support film (1 − noise.live) moves with it.
const Micrograph = (() => {
    const LEVELS = 6, GRITS = 4;
    const DEFAULTS = {
        soft: 1,               // how soft the specimen's structures are by themselves, in octaves of blur (1 = 2 px at 1080, 2 = 4 px …)
        defocus: 0.3,          // the instrument out of focus: blurs structures and grit alike (octaves, on top of soft)
        fringe: 0.35,          // the Fresnel fringe: the signal overshoots at every edge (halo); grows with defocus
        fringeWidth: 3,        // the octave the fringe is measured against
        noise: {
            amount: 0.12,      // speckle: amount · signal^power (at signal 1 it is ± amount)
            power: 0.5,        // 0.5 = shot noise (counting electrons: it grows as the root of the signal), 1 = a share of the signal
            floor: 0.004,      // speckle that is there even with no signal (read-out)
            size: 3.2,         // px at 1080 high: the size of a speckle's cell
            live: 0.5,         // share that is new every exposure; the rest is the support film's and rides the stage
            hold: 2,           // frames an exposure lasts (2 = the detector reads out twelve times a second)
            sharp: 0.55,       // 0 = soft clouds, 1 = wormy, high-contrast grains
            fine: 0.3,         // how much of a second, finer octave rides on it
        },
        gain: 1, offset: 0, gamma: 1,   // the detector: s = pow((s − offset) · gain, gamma)
        bleed: 2.2,            // how much softer the ink's edges are than the signal's (octaves)
        colour: 1,             // 0 = the raw grey micrograph, 1 = tinted
        light: [1, 1, 1],      // what the ramp reaches at s = 1
        dark: [0, 0, 0],       // … and at s = 0
        beam: 0,               // illumination falling off towards the corners (0–1)
        beamAt: [0, 0],        // the beam's centre, frame units
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
uint lat(ivec3 i) { return lat(i.xy) ^ hu(uint(i.z) * 0x85EBCA6BU + 0x165667B1U); }
float hash(vec2 p) { return hf(lat(ivec2(floor(p)))); }
float hash(vec3 p) { return hf(lat(ivec3(floor(p)))); }
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
// gradient noise (band-limited round one cycle per cell, mean 0, ≈ ±0.7): what a speckle is
vec3 grad(ivec3 i) { uint h = lat(i); return vec3(hf(h), hf(h ^ 0x68E31DA4U), hf(h ^ 0xB5297A4DU)) * 2.0 - 1.0; }
float gnoise(vec3 x) {
    ivec3 i = ivec3(floor(x)); vec3 f = fract(x), u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = dot(grad(i), f), b = dot(grad(i + ivec3(1, 0, 0)), f - vec3(1, 0, 0));
    float c = dot(grad(i + ivec3(0, 1, 0)), f - vec3(0, 1, 0)), d = dot(grad(i + ivec3(1, 1, 0)), f - vec3(1, 1, 0));
    float e = dot(grad(i + ivec3(0, 0, 1)), f - vec3(0, 0, 1)), g = dot(grad(i + ivec3(1, 0, 1)), f - vec3(1, 0, 1));
    float h = dot(grad(i + ivec3(0, 1, 1)), f - vec3(0, 1, 1)), k = dot(grad(i + ivec3(1, 1, 1)), f - vec3(1, 1, 1));
    return mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y), mix(mix(e, g, u.x), mix(h, k, u.x), u.y), u.z) * 1.6;
}
// a speckle field: two octaves of gradient noise pushed towards its extremes (sharp 0 =
// clouds, 1 = worms), mean 0, about ±1
float speckle(vec3 x, float sharp, float fine) {
    float n = gnoise(x) + fine * gnoise(vec3(x.xy * 1.93 + 11.7, x.z + 3.1));
    return n / mix(1.0, abs(n) + 0.22, sharp) * mix(1.9, 0.75, sharp);
}
`;
    const PRELUDE = HEAD + `
uniform vec2 uRes;
uniform float uT, uFrame, uAspect, uPx;
uniform float uA[256];
uniform sampler2D uPlate, uData;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 fragGrit;
const float PI = 3.14159265;
float grit = 0.0;
` + HASH + `
float datum(int x, int y) { return texelFetch(uData, ivec2(x, y), 0).r; }
float sat(float x) { return clamp(x, 0.0, 1.0); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + 17.3; a *= 0.5; } return s; }
float lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }
// the specimen's own grain (stain crystals, ribosomes, the texture of what it is made of):
// fixed to the specimen, so give it the specimen's local coordinates; cell = its size in
// the same units; mean 0, about ±1
float grainy(vec2 q, float cell, float seed, float sharp) { return speckle(vec3(q / cell, seed * 7.31), sharp, 0.45); }
// a closed outline that is never a circle: the radius factor at angle a (≈ 1 ± amp), from
// three lobes with seeded phases; t makes it breathe (pass 0 for a fixed shape)
float wobble(float a, float seed, float amp, float t) {
    vec3 h = hash3(vec2(seed, 3.0)) * 6.283;
    return 1.0 + amp * (0.5 * sin(2.0 * a + h.x + 0.31 * t) + 0.3 * sin(3.0 * a + h.y - 0.23 * t) + 0.2 * sin(5.0 * a + h.z + 0.4 * t));
}
// distance (frame units, negative inside) to an oval of semi-axes r whose outline wobbles;
// q is local (already translated and rotated)
float body(vec2 q, vec2 r, float seed, float amp, float t) {
    float k = wobble(atan(q.y, q.x), seed, amp, t), l = length(q / (r * k));
    return (l - 1.0) * min(r.x, r.y) * k;
}
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
// a shell at distance 0 of half-width w (a membrane seen edge on), 1 at its middle
float shell(float d, float w) { return exp(-d * d / (w * w)); }
// 1 inside, 0 outside, over a soft edge of width w
float inside(float d, float w) { return smoothstep(w, -w, d); }
// a crown of spikes round an outline: d = distance to the outline, a = angle; n spikes of
// length len, each with its own lean, length and presence; head 0 = a tooth (wide foot,
// soft point), 1 = a club (a stalk that swells into a head); returns 0–1 density
float crown(float d, float a, float n, float len, float seed, float t, float head) {
    float g = a / 6.2831853 * n, i = floor(g), f = fract(g) - 0.5;
    vec3 h = hash3(vec2(mod(i, n), seed + 5.0));
    float off = (h.x - 0.5) * 0.5 + 0.06 * sin(t * (0.5 + h.y) + h.z * 6.283);   // each one leans, and sways a little
    float l = len * (0.45 + 0.75 * h.y), u = d / l;                               // 0 at the outline, 1 at the tip
    float tooth = mix(0.46, 0.10, sat(u)), club = mix(0.13, 0.30, smoothstep(0.35, 0.95, u));
    float w = mix(tooth, club, head) * (0.8 + 0.5 * h.z);
    float tip = mix(smoothstep(1.05, 0.5, u), smoothstep(1.12, 0.92, u), head);
    return smoothstep(w, w * 0.35, abs(f - off)) * tip * step(0.0, u) * step(0.16, h.z);   // some are missing
}
// spikes as an instrument shows them: not drawn clubs but lumps, one per sector of the
// outline, each at its own angle and distance and of its own size (some missing), with a
// second knob (no lump is round) on a faint neck. n = position normalised so the outline
// is the unit circle (distort it with a low-frequency noise first), a = its angle, dist =
// nearest and farthest centre, size = smallest and largest radius (same units); 0–1 density
float lumps(vec2 n, float a, float count, float seed, float t, vec2 dist, vec2 size) {
    float g = a / 6.2831853 * count, i0 = floor(g), best = 0.0;
    for (int k = -1; k <= 1; k++) {
        float j = mod(i0 + float(k), count);
        vec3 h = hash3(vec2(j, seed)), h2 = hash3(vec2(j, seed + 17.0));
        float aa = (j + 0.5 + (h.x - 0.5) * 0.8) / count * 6.2831853 + 0.03 * sin(t * (0.4 + h2.x) + h2.y * 6.283);
        float rr = mix(dist.x, dist.y, h.y), sz = mix(size.x, size.y, h.z * h.z);
        vec2 dir = vec2(cos(aa), sin(aa)), d = n - rr * dir;
        float along = dot(d, dir), across = dot(d, vec2(-dir.y, dir.x));
        float head = exp(-(along * along / (sz * sz * (0.8 + 0.8 * h2.z)) + across * across / (sz * sz)));
        vec2 d2 = d - sz * 0.9 * vec2(cos(h2.y * 6.283), sin(h2.y * 6.283));
        head = max(head, 0.9 * exp(-dot(d2, d2) / (sz * sz * 0.5)));
        float neck = 0.3 * exp(-across * across / (sz * sz * 0.35)) * smoothstep(1.08, 1.16, dot(n, dir)) * smoothstep(rr, rr - 0.08, dot(n, dir));
        best = max(best, max(head, neck) * step(0.18, h2.x));
    }
    return best;
}
vec4 plate(vec2 p) { return texture(uPlate, vec2(p.x / uAspect + 0.5, p.y + 0.5)); }
`;
    const MAIN = `
void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    float s; vec3 ink;
    specimen(p, s, ink);
    fragColor = vec4(clamp(ink, 0.0, 1.0), clamp(s, 0.0, 1.5));
    fragGrit = vec4(grit, 0.0, 0.0, 1.0);
}
`;
    // the blur pyramid (each level half the last), for focus, fringe and ink bleed
    const DOWN = HEAD + `
uniform sampler2D uTex; uniform vec2 uTexel, uRes; out vec4 o;
void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec4 c = texture(uTex, uv) * 4.0;
    c += texture(uTex, uv + uTexel * vec2(-1, -1)) + texture(uTex, uv + uTexel * vec2(1, -1));
    c += texture(uTex, uv + uTexel * vec2(-1, 1)) + texture(uTex, uv + uTexel * vec2(1, 1));
    o = c / 8.0;
}
`;
    // the instrument and the colourist
    const DETECT = HEAD + `
uniform sampler2D uL0, uL1, uL2, uL3, uL4, uL5, uL6, uG0, uG1, uG2, uG3, uG4;
uniform vec2 uRes, uStage, uBeamAt;
uniform float uFrame, uSoft, uDefocus, uFringe, uFringeW, uGain, uOffset, uGamma, uBleed, uColour, uBeam;
uniform vec4 uNoise;   // amount, floor, size, live
uniform vec4 uNoise2;  // exposure index, sharp, power, fine
uniform vec3 uLight, uDark;
out vec4 o;
` + HASH + `
// a pyramid level read smoothly (a 3 × 3 tent over its texels, so no blocks show)
vec4 tent(sampler2D t, vec2 uv) {
    vec2 e = 1.0 / vec2(textureSize(t, 0));
    vec4 c = texture(t, uv) * 4.0;
    c += (texture(t, uv + vec2(e.x, 0)) + texture(t, uv - vec2(e.x, 0)) + texture(t, uv + vec2(0, e.y)) + texture(t, uv - vec2(0, e.y))) * 2.0;
    c += texture(t, uv + e) + texture(t, uv - e) + texture(t, uv + vec2(e.x, -e.y)) + texture(t, uv + vec2(-e.x, e.y));
    return c / 16.0;
}
vec4 level(float l, vec2 uv) {
    l = clamp(l, 0.0, 6.0);
    float i = floor(l), f = l - i;
    vec4 a, b;
    if (i < 0.5) { a = texture(uL0, uv); b = tent(uL1, uv); }
    else if (i < 1.5) { a = tent(uL1, uv); b = tent(uL2, uv); }
    else if (i < 2.5) { a = tent(uL2, uv); b = tent(uL3, uv); }
    else if (i < 3.5) { a = tent(uL3, uv); b = tent(uL4, uv); }
    else if (i < 4.5) { a = tent(uL4, uv); b = tent(uL5, uv); }
    else { a = tent(uL5, uv); b = tent(uL6, uv); }
    return mix(a, b, f);
}
float gritAt(float l, vec2 uv) {
    l = clamp(l, 0.0, 4.0);
    float i = floor(l), f = l - i, a, b;
    if (i < 0.5) { a = texture(uG0, uv).r; b = tent(uG1, uv).r; }
    else if (i < 1.5) { a = tent(uG1, uv).r; b = tent(uG2, uv).r; }
    else if (i < 2.5) { a = tent(uG2, uv).r; b = tent(uG3, uv).r; }
    else { a = tent(uG3, uv).r; b = tent(uG4, uv).r; }
    return mix(a, b, f);
}
void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    // focus: the signal blurred, and overshooting at every edge by what a wider blur loses
    float s = level(uSoft + uDefocus, uv).a;
    s += uFringe * (s - level(uSoft + uDefocus + uFringeW, uv).a);
    // what the specimen is made of: sharp unless the instrument itself is out of focus
    s *= 1.0 + gritAt(uDefocus, uv);
    // the beam: brighter where it is centred
    float r2 = dot(p - uBeamAt, p - uBeamAt);
    s *= 1.0 - uBeam * smoothstep(0.0, 1.0, r2 * 1.2);
    // the detector: grain proportional to the signal, part of it new every exposure, part
    // of it the support film's (it rides the stage)
    float cell = uRes.y / 1080.0 * uNoise.z;
    vec2 gp = gl_FragCoord.xy / cell;
    float live = speckle(vec3(gp, uNoise2.x * 17.0 + 0.5), uNoise2.y, uNoise2.w);
    float film = speckle(vec3(gp - uStage * uRes.y / cell, -40.5), uNoise2.y, uNoise2.w);
    float n = sqrt(uNoise.w) * live + sqrt(1.0 - uNoise.w) * film;
    s = max(s, 0.0);
    s += n * (uNoise.x * pow(s, uNoise2.z) + uNoise.y);
    s = pow(max((s - uOffset) * uGain, 0.0), uGamma);
    // the colourist: a ramp dark → ink → light, the ink read from a softer copy
    vec3 ink = level(uBleed, uv).rgb;
    float l = clamp(dot(ink, vec3(0.3, 0.59, 0.11)), 0.02, 0.98);
    vec3 c = s < l ? mix(uDark, ink, s / l) : mix(ink, uLight, min((s - l) / (1.0 - l), 1.0));
    c = mix(vec3(min(s, 1.0)), c, uColour);
    c += (hash(vec3(gl_FragCoord.xy, uFrame)) - 0.5) / 255.0;
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
        if (!gl) throw new Error('Micrograph: no WebGL2');
        if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('Micrograph: no float render targets (EXT_color_buffer_float)');
        const compile = (type, src, what) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`Micrograph shader (${what}): ` + gl.getShaderInfoLog(s));
            return s;
        };
        const vs = compile(gl.VERTEX_SHADER, VS, 'vertex');
        const program = (fs, what) => {
            const p = gl.createProgram();
            gl.attachShader(p, vs);
            gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs, what));
            gl.bindAttribLocation(p, 0, 'p');
            gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`Micrograph link (${what}): ` + gl.getProgramInfoLog(p));
            const locs = new Map();
            return { p, u: (n) => { if (!locs.has(n)) locs.set(n, gl.getUniformLocation(p, n)); return locs.get(n); } };
        };
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const params = (min) => { for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, min], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); };
        const target = (w, h) => {
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
            params(gl.LINEAR);
            const fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            return { tex, fb, w, h };
        };
        const size = (i) => [Math.max(2, Math.round(W / 2 ** i)), Math.max(2, Math.round(H / 2 ** i))];
        const levels = [], grits = [];
        for (let i = 0; i <= LEVELS; i++) levels.push(target(...size(i)));
        for (let i = 0; i <= GRITS; i++) grits.push(target(...size(i)));
        // the specimen pass writes both: signal + ink, and grit
        const both = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, both);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, levels[0].tex, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, grits[0].tex, 0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
        const P = { down: program(DOWN, 'down'), detect: program(DETECT, 'detect') };
        const scenes = new Map();
        const plateCv = document.createElement('canvas');
        plateCv.width = W;
        plateCv.height = H;
        const plateTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, plateTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plateCv);
        params(gl.LINEAR);
        let plateKey;
        // a table of floats as a texture (one float per texel, read exactly)
        const table = (arr, width) => {
            const h = Math.ceil(arr.length / width), px = new Float32Array(width * h);
            px.set(arr);
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, width, h, 0, gl.RED, gl.FLOAT, px);
            for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
            return tex;
        };
        const noData = table([0], 1);
        const bind = (unit, tex) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); };
        const into = (t) => { gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fb : null); gl.viewport(0, 0, t ? t.w : W, t ? t.h : H); };
        const draw = () => gl.drawArrays(gl.TRIANGLES, 0, 3);

        function render(g, name, f = {}) {
            const S = scenes.get(name);
            if (!S) throw new Error('Micrograph: no scene «' + name + '»');
            const d = { ...DEFAULTS, ...(f.detector ?? {}) };
            d.noise = { ...DEFAULTS.noise, ...(f.detector?.noise ?? {}) };
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
            // 1 · the specimen: signal and ink
            gl.bindFramebuffer(gl.FRAMEBUFFER, both);
            gl.viewport(0, 0, W, H);
            gl.useProgram(S.p);
            gl.uniform2f(S.u('uRes'), W, H);
            gl.uniform1f(S.u('uT'), f.t ?? 0);
            gl.uniform1f(S.u('uFrame'), frame);
            gl.uniform1f(S.u('uAspect'), W / H);
            gl.uniform1f(S.u('uPx'), 1 / H);
            const a = new Float32Array(256);
            (f.a ?? []).forEach((v, i) => (a[i] = v));
            gl.uniform1fv(S.u('uA'), a);
            bind(1, plateTex);
            gl.uniform1i(S.u('uPlate'), 1);
            bind(15, S.data ?? noData);
            gl.uniform1i(S.u('uData'), 15);
            draw();
            // 2 · the blur pyramid
            gl.useProgram(P.down.p);
            gl.uniform1i(P.down.u('uTex'), 0);
            for (const chain of [levels, grits]) for (let i = 1; i < chain.length; i++) {
                into(chain[i]);
                bind(0, chain[i - 1].tex);
                gl.uniform2f(P.down.u('uTexel'), 1 / chain[i - 1].w, 1 / chain[i - 1].h);
                gl.uniform2f(P.down.u('uRes'), chain[i].w, chain[i].h);
                draw();
            }
            // 3 · the instrument and the colourist
            into(null);
            const D = P.detect;
            gl.useProgram(D.p);
            for (let i = 0; i <= LEVELS; i++) { bind(2 + i, levels[i].tex); gl.uniform1i(D.u('uL' + i), 2 + i); }
            for (let i = 0; i <= GRITS; i++) { bind(9 + i, grits[i].tex); gl.uniform1i(D.u('uG' + i), 9 + i); }
            // the pyramid is sized at 1080 high: at other sizes the same blur is more or fewer octaves
            const oct = Math.log2(H / 1080);
            gl.uniform2f(D.u('uRes'), W, H);
            gl.uniform2f(D.u('uStage'), ...(f.stage ?? [0, 0]));
            gl.uniform2f(D.u('uBeamAt'), ...d.beamAt);
            gl.uniform1f(D.u('uFrame'), frame);
            gl.uniform1f(D.u('uSoft'), Math.max(0, d.soft + oct));
            gl.uniform1f(D.u('uDefocus'), Math.max(0, d.defocus));
            gl.uniform1f(D.u('uFringe'), d.fringe);
            gl.uniform1f(D.u('uFringeW'), d.fringeWidth);
            gl.uniform1f(D.u('uGain'), d.gain);
            gl.uniform1f(D.u('uOffset'), d.offset);
            gl.uniform1f(D.u('uGamma'), d.gamma);
            gl.uniform1f(D.u('uBleed'), Math.max(0, d.bleed + oct));
            gl.uniform1f(D.u('uColour'), d.colour);
            gl.uniform1f(D.u('uBeam'), d.beam);
            gl.uniform4f(D.u('uNoise'), d.noise.amount, d.noise.floor, d.noise.size, d.noise.live);
            gl.uniform4f(D.u('uNoise2'), Math.floor(frame / Math.max(1, d.noise.hold)), d.noise.sharp, d.noise.power, d.noise.fine);
            gl.uniform3fv(D.u('uLight'), d.light);
            gl.uniform3fv(D.u('uDark'), d.dark);
            draw();
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.imageSmoothingQuality = 'high';
            g.drawImage(cv, 0, 0, env.px[0], env.px[1]);
            g.restore();
        }
        return {
            W, H, gl,
            scene(name, glsl, o = {}) {
                const S = program(PRELUDE + glsl + MAIN, 'scene ' + name);
                if (o.data) S.data = table(o.data, o.width ?? o.data.length);
                scenes.set(name, S);
                return this;
            },
            render,
        };
    }
    // The databar: what the instrument burns into the image (a scale bar with its label,
    // and whatever fields the shot wants), crisp, never through the detector. len is the
    // bar's length in logical units; fields are short strings.
    function databar(g, env, o = {}) {
        const x = o.x ?? 56, y = o.y ?? env.H - 52, len = o.len ?? 180, a = o.alpha ?? 1, font = o.font ?? 'monospace';
        if (a <= 0) return;
        g.save();
        g.globalAlpha = a;
        g.fillStyle = o.colour ?? '#ffffff';
        g.shadowColor = o.shadow ?? 'rgba(0,0,0,0.55)';
        g.shadowBlur = 6;
        g.fillRect(x, y, len, 5);
        g.fillRect(x, y - 8, 3, 21);
        g.fillRect(x + len - 3, y - 8, 3, 21);
        g.font = `${o.size ?? 26}px ${font}`;
        g.textBaseline = 'alphabetic';
        g.textAlign = 'left';
        g.fillText(o.label ?? '100 nm', x, y - 16);
        let fx = x + Math.max(len, g.measureText(o.label ?? '100 nm').width) + 44;
        for (const f of o.fields ?? []) { g.fillText(f, fx, y + 9); fx += g.measureText(f).width + 36; }
        g.restore();
    }
    return { make, DEFAULTS, databar };
})();
