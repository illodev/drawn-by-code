// skate-toon · the broadcast finish: the frame as it reached a living room around 2000.
// Global: SkateToonTV. Load after toon.js; call from a scene's post(ctx, t, env).
//
// The drawings are clean vectors; a cel cartoon of the time was painted, shot on film,
// transferred to standard-definition video and compressed. What that does to a picture, in the
// order it happens (looked at on captures of shows of the genre; nothing here is copied from one):
//   - paint: a flat fill is never quite flat (a slow mottle a few percent deep, the same in every
//     frame: it belongs to the paint, not to the signal);
//   - film: a little weave of the whole frame from one exposure to the next, grain;
//   - video: far fewer lines than we draw (luma soft over a pixel or two of ours, colour over
//     twice that, so a saturated edge bleeds), an edge enhancer that leaves a faint light rim
//     beside every dark line, blacks that are a warm dark brown and whites that are cream,
//     colour a touch warmer and heavier, a fall-off into the corners.
const SkateToonTV = (() => {
    const VERT = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main() { vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); gl_Position = vec4(aPos, 0.0, 1.0); }`;
    const FRAG = `#version 300 es
precision highp float; precision highp int;
uniform sampler2D uTex; uniform vec2 uRes; uniform float uFrame, uAmt, uSoft, uGrain, uPaint;
in vec2 vUv; out vec4 outCol;
uint hashu(uvec3 v) {
    v = v * 1664525u + 1013904223u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    v ^= v >> 16u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; return v.x ^ v.y ^ v.z;
}
float hash(float x, float y, float z) { return float(hashu(uvec3(ivec3(floor(vec3(x, y, z))) + 40000)) >> 8) / 16777216.0; }
// smooth value noise on a grid of cell c pixels (z picks the layer)
float vnoise(vec2 px, float c, float z) {
    vec2 q = px / c, i = floor(q), f = fract(q);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i.x, i.y, z), hash(i.x + 1.0, i.y, z), f.x), mix(hash(i.x, i.y + 1.0, z), hash(i.x + 1.0, i.y + 1.0, z), f.x), f.y);
}
vec3 toYiq(vec3 c) { return vec3(dot(c, vec3(0.299, 0.587, 0.114)), dot(c, vec3(0.596, -0.274, -0.322)), dot(c, vec3(0.211, -0.523, 0.312))); }
vec3 toRgb(vec3 y) { return vec3(y.x + 0.956 * y.y + 0.621 * y.z, y.x - 0.272 * y.y - 0.647 * y.z, y.x - 1.106 * y.y + 1.703 * y.z); }
vec3 pic(vec2 uv) { return toYiq(texture(uTex, clamp(uv, vec2(0.0), vec2(1.0))).rgb); }
void main() {
    float S = uRes.x / 1920.0;              // sizes below are in pixels of a 1920 frame
    vec2 px = vec2(S) / uRes;
    vec2 p = vUv * 2.0 - 1.0;
    // film weave: the whole frame a fraction of a pixel off, new on every exposure (on twos)
    float fr = floor(uFrame / 2.0);
    vec2 uv = vUv + (vec2(hash(fr, 3.0, 7.0), hash(fr, 9.0, 13.0)) - 0.5) * 1.1 * px * uAmt;
    // luma: soft over a pixel or two; colour: over twice that, and wider across than down
    float r = 1.25 * uSoft;
    float Y = 0.0, Yw = 0.0; vec2 C = vec2(0.0); float ws = 0.0, wc = 0.0, ww = 0.0;
    for (int j = -2; j <= 2; j++) for (int i = -3; i <= 3; i++) {
        vec2 o = vec2(float(i), float(j));
        vec3 s = pic(uv + o * r * px);
        float wl = exp(-dot(o, o) / 1.3) * step(abs(o.x), 2.5);
        float wch = exp(-(o.x * o.x / 5.0 + o.y * o.y / 2.2));
        float wwd = exp(-dot(o, o) / 5.5);
        Y += s.x * wl; ws += wl; C += s.yz * wch; wc += wch; Yw += s.x * wwd; ww += wwd;
    }
    Y /= ws; C /= wc; Yw /= ww;
    // the edge enhancer: detail pushed up, which leaves a light rim beside a dark line
    Y += 0.42 * uAmt * (Y - Yw);
    // paint: a slow mottle and a finer one, fixed to the frame, deeper in the mid tones
    float mot = (vnoise(gl_FragCoord.xy / S, 46.0, 1.0) - 0.5) * 0.55 + (vnoise(gl_FragCoord.xy / S, 9.0, 2.0) - 0.5) * 0.45;
    Y *= 1.0 + mot * 0.085 * uPaint * (0.35 + 0.65 * smoothstep(0.08, 0.5, Y) * (1.0 - 0.55 * smoothstep(0.82, 1.0, Y)));
    // grain: fine in luma, coarser and fainter in colour, new on every frame
    vec2 gp = floor(gl_FragCoord.xy / (1.6 * S));
    Y += (hash(gp.x, gp.y, uFrame) - 0.5) * 0.040 * uGrain;
    vec2 cp = floor(gl_FragCoord.xy / (5.0 * S));
    C += (vec2(hash(cp.x, cp.y, uFrame + 11.0), hash(cp.x, cp.y, uFrame + 23.0)) - 0.5) * 0.018 * uGrain;
    vec3 col = toRgb(vec3(Y, C * mix(1.0, 1.07, uAmt)));
    // the grade: a soft shoulder, blacks lifted to a warm dark brown, whites to cream, a warm cast
    vec3 g = clamp(col, 0.0, 1.0);
    g = mix(g, g * g * (3.0 - 2.0 * g), 0.22);                         // a little more contrast in the middle
    g = vec3(0.060, 0.042, 0.040) + g * (vec3(0.985, 0.962, 0.905) - vec3(0.060, 0.042, 0.040));
    g *= vec3(1.020, 1.0, 0.972);
    col = mix(col, g, uAmt);
    col *= 1.0 - 0.085 * uAmt * dot(p, p) * dot(p, p);                 // the corners
    outCol = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
    let st = null;
    function glFor(W, H) {
        if (st && st.W === W && st.H === H) return st;
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false });
        if (!gl) return (st = { W, H, gl: null });
        const sh = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('SkateToonTV shader: ' + gl.getShaderInfoLog(s));
            return s;
        };
        const pr = gl.createProgram();
        gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
        gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(pr);
        if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('SkateToonTV link: ' + gl.getProgramInfoLog(pr));
        gl.useProgram(pr);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(pr, 'aPos');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
        const u = {};
        for (const n of ['uTex', 'uRes', 'uFrame', 'uAmt', 'uSoft', 'uGrain', 'uPaint']) u[n] = gl.getUniformLocation(pr, n);
        gl.viewport(0, 0, W, H);
        return (st = { W, H, gl, cv, u, tex });
    }
    /**
     * The finish, for a scene's post(ctx, t, env). o (each 0 = off, 1 = as measured, more = heavier):
     *   amount  the grade, the edge enhancer, the weave and the corners
     *   soft    how few lines the video has (1: luma soft over ~1.3 px of a 1920 frame)
     *   grain   film grain
     *   paint   the mottle of painted fills
     */
    function post(ctx, t, env, o = {}) {
        const [W, H] = env.px, s = glFor(W, H);
        if (!s.gl) return;
        const { gl, u } = s;
        gl.bindTexture(gl.TEXTURE_2D, s.tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
        gl.uniform1i(u.uTex, 0);
        gl.uniform2f(u.uRes, W, H);
        gl.uniform1f(u.uFrame, Math.round(t * env.fps));
        gl.uniform1f(u.uAmt, o.amount ?? 1);
        gl.uniform1f(u.uSoft, o.soft ?? 1);
        gl.uniform1f(u.uGrain, o.grain ?? 1);
        gl.uniform1f(u.uPaint, o.paint ?? 1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(s.cv, 0, 0);
        ctx.restore();
    }
    return { post };
})();
