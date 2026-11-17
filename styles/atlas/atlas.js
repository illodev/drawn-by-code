// Atlas style kit: a page of a fine early-20th-century school atlas, drawn from a heightfield.
//
//   const R = Atlas.relief(env, height)             // height = await Atlas.load(url, meta)
//   R.draw(g, view, { contour: 3 })                 // the shaded relief, its tints and contours
//   Atlas.onMap(g, env, view, size, () => { Atlas.river(g, pts, w, px) … })   // map-space ink
//
// The relief is WebGL2: per pixel a Catmull-Rom height (with its exact gradient) plus detail
// octaves that only appear once the camera is close enough to see them; the slope is lit from
// the upper left; the colour is read from a table of (height, shade) measured on the reference
// (green valleys, cream lights, violet-grey shadows, brown heights); contour lines are the
// local ground darkened by a measured ratio, kept a constant hairline on screen and faded
// where they would crowd; and the paper's grain is in map space, so it travels with the map.
// Everything on top (water, the canal, roads, the town, fields, lettering, the frame) is
// canvas ink in map coordinates (map px = pixels of the heightfield).
const Atlas = (() => {
    // The ground: rows = height (low first), columns = shade from -0.1 to 1.0 (dark first);
    // measured on sandbox/2026-11-17-atlas-test/ref/atlas-4.png by tools/lut.py.
    const SWISS = {
        nh: 16, ns: 24, shade: [-0.1, 1.0],
        line: [0.761, 0.685, 0.649],     // a contour line = the ground × this
        rgb: [ // LUT begin
            135,136,106,136,136,106,136,137,106,137,138,106,136,139,106,136,139,105,137,140,106,140,142,106,143,144,108,146,146,110,149,150,112,153,153,115,157,157,118,162,162,121,166,166,124,171,170,127,175,175,131,180,181,137,187,187,141,192,190,142,195,192,144,198,195,146,201,198,149,203,202,152,
            135,135,105,135,136,106,136,137,106,138,138,107,138,139,107,139,140,107,140,141,108,143,143,109,146,146,111,149,148,113,153,152,116,157,156,118,161,160,122,166,164,125,171,168,128,175,173,131,180,177,135,186,184,141,193,190,145,198,194,147,201,196,149,203,199,152,207,203,154,210,206,156,
            134,132,103,135,134,104,136,135,106,138,137,107,140,138,108,142,140,109,144,142,110,147,144,112,150,147,114,153,151,117,157,154,120,161,159,123,166,163,126,171,167,129,176,172,132,181,176,136,186,182,140,194,189,147,201,196,152,205,199,154,208,202,155,211,204,157,214,207,158,217,209,158,
            133,128,100,134,130,102,136,132,104,137,134,106,140,137,108,144,140,110,147,143,112,151,146,115,155,150,117,158,154,120,162,158,123,167,162,126,171,166,129,175,170,132,180,174,136,186,179,140,192,186,145,201,195,153,209,202,158,213,205,159,215,206,160,216,207,161,219,209,161,221,210,160,
            133,126,99,133,127,100,135,130,103,138,133,106,142,137,109,146,140,111,150,144,114,153,147,117,157,151,120,162,155,123,166,159,125,171,163,129,175,167,132,180,172,135,184,176,138,189,181,142,196,188,149,206,198,157,214,205,162,217,207,163,219,208,162,220,208,162,222,209,162,224,211,162,
            133,126,100,133,126,101,134,128,102,138,132,106,143,136,110,147,140,113,151,144,115,156,147,118,160,151,121,164,155,124,169,160,127,174,164,130,179,169,133,183,173,137,188,177,140,193,182,144,198,188,150,206,196,158,214,203,163,218,206,163,220,207,162,221,207,162,223,208,162,225,210,163,
            135,126,102,135,127,103,136,128,104,139,131,107,144,135,110,148,139,113,152,143,116,157,147,118,161,151,121,166,155,124,171,160,128,176,164,131,181,169,134,186,173,137,191,178,142,196,183,146,200,187,150,206,194,157,213,201,162,218,204,163,220,205,162,222,206,163,224,208,164,227,210,165,
            137,127,103,138,127,104,139,128,105,141,131,107,144,134,109,149,138,112,153,142,115,158,146,118,162,150,121,167,155,125,172,159,128,177,164,131,182,168,135,188,173,138,193,178,143,198,183,147,202,187,151,207,192,156,212,197,160,217,201,162,220,203,162,222,205,163,225,207,165,228,210,167,
            137,126,104,138,127,105,140,128,106,142,129,107,145,132,109,149,136,112,154,140,115,159,145,118,163,149,122,168,153,125,172,158,128,177,162,131,183,167,135,188,172,139,194,177,143,199,182,147,203,186,151,208,191,156,213,195,158,216,198,160,219,200,161,222,202,163,225,206,166,229,209,170,
            136,126,104,137,126,106,139,127,107,141,128,108,145,130,109,149,134,111,154,139,115,159,143,118,163,147,122,167,152,125,172,156,128,177,161,131,183,165,135,188,171,139,194,176,143,199,181,147,204,185,152,209,190,156,214,194,158,217,196,159,220,199,162,223,202,165,227,205,169,231,209,172,
            135,123,103,136,123,104,138,125,106,141,126,107,145,128,108,149,132,111,153,136,114,157,141,117,162,145,121,166,149,124,171,153,127,176,158,131,182,163,135,188,169,139,194,174,143,200,179,147,205,183,151,210,188,156,215,193,159,219,196,161,222,199,164,225,203,168,229,207,172,232,210,175,
            132,117,98,133,117,99,136,120,101,139,122,103,142,125,106,147,129,109,151,133,112,156,138,116,161,142,120,165,147,123,171,151,127,176,156,131,182,162,135,188,167,139,194,172,143,200,177,147,205,183,152,211,189,159,218,195,164,223,200,167,228,204,170,231,207,173,234,210,177,236,213,179,
            129,111,94,129,111,93,135,115,97,139,120,102,143,124,105,147,128,108,152,132,112,156,136,115,161,141,119,166,145,123,171,150,126,176,155,130,182,160,134,187,165,138,193,170,142,199,175,146,204,181,153,210,189,161,219,197,168,227,202,171,232,207,175,235,211,179,238,214,183,240,217,186,
            129,109,94,130,110,95,135,115,99,139,120,103,144,124,106,148,128,110,152,132,113,156,136,116,161,140,119,165,144,123,169,148,126,174,152,129,179,156,133,184,161,137,189,166,141,195,171,146,201,177,151,207,184,157,214,190,163,220,196,168,226,202,173,231,207,179,236,213,186,240,219,193,
            128,109,95,130,112,98,134,116,102,138,119,105,142,123,109,145,126,112,149,130,115,153,133,117,156,137,120,160,140,123,164,144,127,168,148,130,173,152,134,178,157,138,183,162,143,189,168,148,195,173,153,201,179,158,207,185,163,213,192,169,220,198,175,226,205,183,233,213,191,239,220,200,
            123,107,98,126,110,101,129,114,104,133,117,107,136,120,110,139,123,112,142,126,115,146,129,118,149,132,120,153,136,124,156,139,127,160,143,130,165,147,134,170,152,139,175,157,143,180,162,148,185,168,153,192,173,158,198,179,163,205,186,169,212,193,176,219,201,184,227,210,193,236,219,202
        ], // LUT end
    };
    // The inks, measured on the same plate (tools/vectors.py) and around it.
    const INK = {
        lake: '#bed3d7', waterline: '#7ba6bc', river: '#6ea6c0', riverEdge: '#5b93b0',
        canal: '#c5201f', block: '#615a52', street: '#efe8d8', road: '#f4f0e6', roadEdge: '#5e5a52',
        margin: '#e3d5c0', neat: '#262220', letter: '#2b2622', field: ['#bcc58e', '#a9b77f', '#cfd09a', '#b4bf86', '#d6cf9f', '#9fb078', '#c6c891'],
        fieldEdge: '#8d9670', dam: '#8f8b84', damLight: '#d9d4c8',
    };

    // ------------------------------------------------------------------------------- data
    // A heightfield written as little-endian uint16 (0..65535 = 0..hmax map px of height).
    // A tint elevation (what the colours follow) can come with it; without one it is the height
    // blurred, as a cartographer tints by generalized elevation, not by every bump.
    async function load(url, meta, tintUrl) {
        const read = async (u) => new Uint16Array(await (await fetch(u)).arrayBuffer());
        const u = await read(url), [w, h] = meta.size;
        const f = new Float32Array(w * h);
        for (let i = 0; i < f.length; i++) f[i] = u[i] / 65535;
        let tint;
        if (tintUrl) {
            const t = await read(tintUrl);
            tint = new Float32Array(w * h);
            for (let i = 0; i < f.length; i++) tint[i] = t[i] / 65535;
        } else tint = blur(f, w, h, meta.tintBlur ?? 6);
        return { w, h, data: f, tint, hmax: meta.hmax, azimuth: meta.azimuth ?? 315, elevation: meta.elevation ?? 45 };
    }
    // three box passes ≈ a gaussian of the given sigma (px)
    function blur(src, w, h, sigma) {
        const r = Math.max(1, Math.round(sigma * 0.9));
        let a = Float32Array.from(src), b = new Float32Array(w * h);
        for (let pass = 0; pass < 3; pass++) {
            for (let y = 0; y < h; y++) { let s = 0; for (let x = -r; x <= r; x++) s += a[y * w + Math.min(w - 1, Math.max(0, x))]; for (let x = 0; x < w; x++) { b[y * w + x] = s / (2 * r + 1); s += a[y * w + Math.min(w - 1, x + r + 1)] - a[y * w + Math.max(0, x - r)]; } }
            for (let x = 0; x < w; x++) { let s = 0; for (let y = -r; y <= r; y++) s += b[Math.min(h - 1, Math.max(0, y)) * w + x]; for (let y = 0; y < h; y++) { a[y * w + x] = s / (2 * r + 1); s += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x]; } }
        }
        return a;
    }

    // ------------------------------------------------------------------------------- relief
    const VS = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
    const FS = `#version 300 es
precision highp float; precision highp int;
uniform sampler2D uH, uLut;
uniform ivec2 uHS;
uniform vec2 uRes, uC, uLutShade;
uniform float uMpp, uHmax, uContour, uLineW, uLineA, uDetail, uPaperA, uFade;
uniform vec3 uL, uLineK, uErosion;
uniform vec2 uErosion2;
out vec4 o;
float Hf(ivec2 i) { return texelFetch(uH, clamp(i, ivec2(0), uHS - 1), 0).r; }
float Tf(ivec2 i) { return texelFetch(uH, clamp(i, ivec2(0), uHS - 1), 0).g; }
float tintAt(vec2 p) {
    vec2 q = p - 0.5, f = fract(q); ivec2 i = ivec2(floor(q));
    return mix(mix(Tf(i), Tf(i + ivec2(1, 0)), f.x), mix(Tf(i + ivec2(0, 1)), Tf(i + ivec2(1, 1)), f.x), f.y);
}
// height and its gradient (map px) from a Catmull-Rom patch
vec3 heightAt(vec2 p) {
    vec2 q = p - 0.5, fl = floor(q), f = q - fl;
    ivec2 i = ivec2(fl);
    vec2 t2 = f * f, t3 = t2 * f;
    vec4 wx = 0.5 * vec4(-t3.x + 2.0 * t2.x - f.x, 3.0 * t3.x - 5.0 * t2.x + 2.0, -3.0 * t3.x + 4.0 * t2.x + f.x, t3.x - t2.x);
    vec4 dx = 0.5 * vec4(-3.0 * t2.x + 4.0 * f.x - 1.0, 9.0 * t2.x - 10.0 * f.x, -9.0 * t2.x + 8.0 * f.x + 1.0, 3.0 * t2.x - 2.0 * f.x);
    vec4 wy = 0.5 * vec4(-t3.y + 2.0 * t2.y - f.y, 3.0 * t3.y - 5.0 * t2.y + 2.0, -3.0 * t3.y + 4.0 * t2.y + f.y, t3.y - t2.y);
    vec4 dy = 0.5 * vec4(-3.0 * t2.y + 4.0 * f.y - 1.0, 9.0 * t2.y - 10.0 * f.y, -9.0 * t2.y + 8.0 * f.y + 1.0, 3.0 * t2.y - 2.0 * f.y);
    vec3 r = vec3(0.0);
    for (int y = 0; y < 4; y++) {
        vec4 row = vec4(Hf(i + ivec2(-1, y - 1)), Hf(i + ivec2(0, y - 1)), Hf(i + ivec2(1, y - 1)), Hf(i + ivec2(2, y - 1)));
        float v = dot(wx, row), d = dot(dx, row);
        r += vec3(wy[y] * v, wy[y] * d, dy[y] * v);
    }
    return r;
}
// value noise with its derivative
float hash(vec2 p) { uvec2 q = uvec2(ivec2(floor(p)) + 32768); uint h = q.x * 1597334677u ^ q.y * 3812015801u; h = (h ^ (h >> 16)) * 2246822519u; h ^= h >> 13; return float(h & 0xffffffu) / 16777215.0; }
vec3 noised(vec2 p) {
    vec2 i = floor(p), f = p - i;
    vec2 u = f * f * (3.0 - 2.0 * f), du = 6.0 * f * (1.0 - f);
    float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
    return vec3(a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y,
                du * (vec2(b - a, c - a) + (a - b - c + d) * u.yx));
}
float vnoise(vec2 p) { return noised(p).x; }
vec2 hash2(vec2 p) { return vec2(hash(p), hash(p + vec2(37.0, 91.0))); }
// Gullies: waves that vary across the slope, so their crests and troughs run downhill, in
// randomly placed cells blended smoothly (after Fewes's «eroded terrain noise»). dir is the
// direction ALONG the contour (perpendicular to the gradient), its length the strength.
vec3 erosion(vec2 p, vec2 dir) {
    vec2 ip = floor(p), fp = p - ip;
    vec3 va = vec3(0.0); float wt = 0.0;
    for (int i = -2; i <= 1; i++) for (int j = -2; j <= 1; j++) {
        vec2 o = vec2(float(i), float(j));
        vec2 pp = fp + o - hash2(ip - o) * 0.5;
        float w = exp(-dot(pp, pp) * 2.0);
        float mag = dot(pp, dir) * 6.2831853;
        va += vec3(cos(mag), -sin(mag) * dir) * w;
        wt += w;
    }
    return va / wt;
}
void main() {
    vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
    vec2 p = uC + (s - 0.5 * uRes) * uMpp;
    vec3 hg = heightAt(p) * uHmax;
    float h = hg.x; vec2 grad = hg.yz;
    // erosion: gullies and spurs down every slope, finer than the heightfield can hold, each
    // octave branching off the slope the octaves before it made; an octave only shows where
    // its wavelength is over ~2.5 screen px, so a closer camera finds finer gullies
    float slopeLen = length(grad);
    float rough = smoothstep(0.06, 0.45, slopeLen) * uDetail, h0 = h;
    if (rough > 0.0) {
        vec2 along = vec2(grad.y, -grad.x) / max(slopeLen, 1e-4);   // along the contour
        float cell = uErosion.x, amp = uErosion.y;
        vec2 eg = vec2(0.0);
        for (int k = 0; k < 6; k++) {
            float vis = smoothstep(2.0, 4.0, cell / uMpp);
            vec2 dir = normalize(along + vec2(eg.y, -eg.x) * uErosion.z + 1e-5) * 0.65;
            vec3 e = erosion(p / cell + float(k) * 13.1, dir);
            // height a·cell·e.x; its gradient a·e.yz (the 1/cell of d/dp cancels the cell)
            h += rough * vis * amp * cell * e.x;
            eg += rough * vis * amp * e.yz;
            cell *= 0.5; amp *= 0.62;
        }
        grad += eg;
    }
    vec3 nrm = normalize(vec3(-grad, 1.0));
    float sh = dot(nrm, uL);
    float tn = clamp(tintAt(p), 0.0, 1.0);
    vec3 col = texture(uLut, vec2((sh - uLutShade.x) / (uLutShade.y - uLutShade.x), tn)).rgb;
    // contour lines: a hairline on screen, faded where they would be closer than ~2 px
    // contours follow the ground with the gullies only partly in: they bend at a gully, they
    // do not fray
    float hc = mix(h0, h, uErosion2.x);
    float c = hc / uContour;
    float fw = max(length(mix(hg.yz, grad, uErosion2.x)) * uMpp / uContour, 1e-5);   // change of c per screen px
    float dpx = abs(fract(c + 0.5) - 0.5) / fw;
    float line = 1.0 - smoothstep(0.5 * uLineW - 0.6, 0.5 * uLineW + 0.6, dpx);
    line *= 1.0 - smoothstep(0.5, 0.85, fw);
    col *= mix(vec3(1.0), uLineK, line * uLineA);
    // the paper, in map space: fibres, a mottle, a slow stain
    float paper = 0.045 * (vnoise(p / 0.9) - 0.5) + 0.035 * (vnoise(p / 5.0 + 3.1) - 0.5) + 0.03 * (vnoise(p / 60.0 + 7.7) - 0.5);
    col *= 1.0 + uPaperA * paper;
    col = mix(col, vec3(0.89, 0.835, 0.75), uFade);
    o = vec4(col, 1.0);
}`;
    function relief(env, height, o = {}) {
        const pal = o.palette ?? SWISS;
        const W = env.px[0], H = env.px[1];
        const cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false });
        if (!gl) throw new Error('Atlas: no WebGL2');
        const sh = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src); gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Atlas shader: ' + gl.getShaderInfoLog(s));
            return s;
        };
        const P = gl.createProgram();
        gl.attachShader(P, sh(gl.VERTEX_SHADER, VS));
        gl.attachShader(P, sh(gl.FRAGMENT_SHADER, FS));
        gl.bindAttribLocation(P, 0, 'p');
        gl.linkProgram(P);
        if (!gl.getProgramParameter(P, gl.LINK_STATUS)) throw new Error('Atlas link: ' + gl.getProgramInfoLog(P));
        const U = (n) => gl.getUniformLocation(P, n);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const tex = (unit, filter) => {
            const t = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, t);
            for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, filter], [gl.TEXTURE_MAG_FILTER, filter], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
            return t;
        };
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        tex(0, gl.NEAREST);
        const rg = new Float32Array(height.w * height.h * 2);
        for (let i = 0; i < height.w * height.h; i++) { rg[i * 2] = height.data[i]; rg[i * 2 + 1] = height.tint[i]; }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, height.w, height.h, 0, gl.RG, gl.FLOAT, rg);
        tex(1, gl.LINEAR);
        const lut = new Uint8Array(pal.nh * pal.ns * 4);
        for (let i = 0; i < pal.nh * pal.ns; i++) { lut.set(pal.rgb.slice(i * 3, i * 3 + 3), i * 4); lut[i * 4 + 3] = 255; }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, pal.ns, pal.nh, 0, gl.RGBA, gl.UNSIGNED_BYTE, lut);
        const az = (height.azimuth * Math.PI) / 180, el = (height.elevation * Math.PI) / 180;
        const light = [Math.sin(az) * Math.cos(el), -Math.cos(az) * Math.cos(el), Math.sin(el)];
        return {
            gl, canvas: cv, height,
            // view: { cx, cy, zoom } in map px; at zoom 1 the map's width `span` fills the frame
            draw(g, view, f = {}) {
                const span = f.span ?? height.w;
                const mpp = span / (W * (view.zoom ?? 1));
                gl.viewport(0, 0, W, H);
                gl.useProgram(P);
                gl.uniform1i(U('uH'), 0);
                gl.uniform1i(U('uLut'), 1);
                gl.uniform2i(U('uHS'), height.w, height.h);
                gl.uniform2f(U('uRes'), W, H);
                gl.uniform2f(U('uC'), view.cx, view.cy);
                gl.uniform1f(U('uMpp'), mpp);
                gl.uniform1f(U('uHmax'), height.hmax);
                gl.uniform2f(U('uLutShade'), pal.shade[0], pal.shade[1]);
                gl.uniform3f(U('uL'), ...light);
                gl.uniform3f(U('uLineK'), ...(f.lineK ?? pal.line));
                gl.uniform1f(U('uContour'), f.contour ?? 3);
                gl.uniform1f(U('uLineW'), (f.lineWidth ?? 1.1) * (W / 1280));
                gl.uniform1f(U('uLineA'), f.lineAlpha ?? 1);
                gl.uniform1f(U('uDetail'), f.detail ?? 1);
                // erosion: the coarsest gully spacing (map px), its slope amplitude, branching
                const er = f.erosion ?? [7, 0.22, 1.2];
                gl.uniform3f(U('uErosion'), er[0], er[1], er[2]);
                gl.uniform2f(U('uErosion2'), f.erosionInContours ?? 0.35, 0);
                gl.uniform1f(U('uPaperA'), f.paper ?? 1);
                gl.uniform1f(U('uFade'), f.fade ?? 0);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
                g.save();
                g.setTransform(1, 0, 0, 1, 0, 0);
                g.drawImage(cv, 0, 0);
                g.restore();
            },
        };
    }

    // ------------------------------------------------------------------------------- map space
    // Runs fn with g mapped so 1 unit = 1 map px under the view; returns screen px per map px.
    function onMap(g, env, view, span, fn) {
        const s = (env.W / span) * (view.zoom ?? 1);
        g.save();
        g.translate(env.W / 2, env.H / 2);
        g.scale(s, s);
        g.translate(-view.cx, -view.cy);
        fn(s * env.k);
        g.restore();
    }
    const pathOf = (g, pts, close) => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        if (close) g.closePath();
    };
    // A smooth path through points (centripetal Catmull-Rom sampled), as points.
    function smooth(pts, per = 6) {
        if (pts.length < 3) return pts.slice();
        const out = [];
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
            for (let k = 0; k < per; k++) {
                const t = k / per, t2 = t * t, t3 = t2 * t;
                out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
            }
        }
        out.push(pts[pts.length - 1]);
        return out;
    }
    const lengths = (pts) => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; };

    // A river: a centre line with a width per point (map px), drawn as short tapered segments
    // in the river ink, with a slightly darker edge where it is wide enough to have one.
    function river(g, pts0, w0, o = {}) {
        const col = o.color ?? INK.river, k = o.width ?? 1;
        // a smooth course: the measured points through a spline, widths along with them
        const pts = o.smooth === false ? pts0 : smooth(pts0, 3), w = [];
        for (let i = 0; i < pts.length; i++) { const f = (i / (pts.length - 1)) * (w0.length - 1), j = Math.floor(f); w.push(w0[Math.min(j, w0.length - 1)] * (1 - (f - j)) + w0[Math.min(j + 1, w0.length - 1)] * (f - j)); }
        g.lineCap = 'round';
        g.lineJoin = 'round';
        const seg = (c, extra) => {
            g.strokeStyle = c;
            for (let i = 1; i < pts.length; i++) {
                g.beginPath();
                g.moveTo(pts[i - 1][0], pts[i - 1][1]);
                g.lineTo(pts[i][0], pts[i][1]);
                g.lineWidth = Math.max(0.7, ((w[i - 1] + w[i]) / 2) * k + extra);
                g.stroke();
            }
        };
        if (o.edge !== false) seg(o.edgeColor ?? INK.riverEdge, 0.5);
        seg(col, 0);
    }
    // A lake: the water, then waterlines along the shore inside it (distances in map px from
    // the shore, measured: a shore line and three lines that fade inward).
    function lake(g, shore, o = {}) {
        const A0 = g.globalAlpha;   // ink fades with whatever alpha it is drawn under
        const lines = o.lines ?? [[0, 1.1, 1], [3.0, 0.9, 0.85], [5.3, 0.8, 0.65], [8.0, 0.7, 0.45]];
        g.save();
        pathOf(g, shore, true);
        g.fillStyle = o.fill ?? INK.lake;
        g.fill();
        g.clip();
        g.lineJoin = 'round';
        // a line at distance d is the band [d - w/2, d + w/2] inside the shore: stroke the shore
        // that wide (clipped to the water) and wipe the band nearer the shore with water again;
        // innermost first, so each wipe only clears what the next lines repaint
        for (const [d, w, a] of [...lines].sort((p, q) => q[0] - p[0])) {
            g.globalAlpha = A0 * (a);
            g.strokeStyle = o.line ?? INK.waterline;
            g.lineWidth = 2 * (d + w / 2);
            pathOf(g, shore, true);
            g.stroke();
            g.globalAlpha = A0 * (1);
            if (d - w / 2 > 0) {
                g.strokeStyle = o.fill ?? INK.lake;
                g.lineWidth = 2 * (d - w / 2);
                pathOf(g, shore, true);
                g.stroke();
            }
        }
        g.restore();
    }
    // A dashed line along a path, the dashes anchored at its start, drawn up to `upto` (0..1).
    function dashed(g, pts, o = {}) {
        const sm = smooth(pts, 4), L = lengths(sm), total = L[L.length - 1];
        const dash = o.dash ?? 13.4, gap = o.gap ?? 6.4, upto = (o.upto ?? 1) * total;
        g.strokeStyle = o.color ?? INK.canal;
        g.lineWidth = o.width ?? 3.6;
        g.lineCap = o.cap ?? 'round';
        let i = 0;
        for (let a = 0; a < upto; a += dash + gap) {
            const b = Math.min(a + dash - (o.cap === 'butt' ? 0 : g.lineWidth), upto);
            if (b <= a) break;
            while (i < L.length - 2 && L[i + 1] < a) i++;
            g.beginPath();
            let j = i, first = true;
            for (let s = a; s <= b + 1e-6; s += Math.min(1.5, b - a || 1)) {
                while (j < L.length - 2 && L[j + 1] < s) j++;
                const u = (s - L[j]) / Math.max(1e-6, L[j + 1] - L[j]);
                const x = sm[j][0] + (sm[j + 1][0] - sm[j][0]) * u, y = sm[j][1] + (sm[j + 1][1] - sm[j][1]) * u;
                first ? g.moveTo(x, y) : g.lineTo(x, y);
                first = false;
                if (b - a < 1e-6) break;
            }
            g.stroke();
        }
        return total;
    }
    // The part of a path up to a fraction u of its length (smoothed first), and the point there.
    function along(pts, u, per = 4) {
        const sm = smooth(pts, per), L = lengths(sm), at = Math.max(0, Math.min(1, u)) * L[L.length - 1];
        const out = [sm[0]];
        let i = 1;
        while (i < sm.length && L[i] <= at) out.push(sm[i++]);
        if (i < sm.length) {
            const f = (at - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
            out.push([sm[i - 1][0] + (sm[i][0] - sm[i - 1][0]) * f, sm[i - 1][1] + (sm[i][1] - sm[i - 1][1]) * f]);
        }
        return { pts: out, at: out[out.length - 1], length: L[L.length - 1] };
    }
    // A channel: a pale band with a thin edge on each side, along a path (a canal's bed, under
    // its dashes).
    function channel(g, pts, o = {}) {
        const A0 = g.globalAlpha;   // ink fades with whatever alpha it is drawn under
        const sm = smooth(pts, 4);
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.strokeStyle = o.edge ?? INK.roadEdge;
        g.globalAlpha = A0 * (o.edgeAlpha ?? 0.55);
        g.lineWidth = (o.width ?? 7) + 1.6;
        pathOf(g, sm); g.stroke();
        g.globalAlpha = A0 * (1);
        g.strokeStyle = o.fill ?? '#ece4cf';
        g.lineWidth = o.width ?? 7;
        pathOf(g, sm); g.stroke();
    }
    // Lettering: letter-spaced capitals, italics for water, along an angle; ink, no halo.
    function label(g, text, x, y, o = {}) {
        g.save();
        g.translate(x, y);
        g.rotate(o.angle ?? 0);
        g.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 400} ${o.size ?? 12}px ${o.family ?? 'Garamond'}`;
        g.fillStyle = o.color ?? INK.letter;
        g.textBaseline = 'alphabetic';
        const ws = [...text].map((ch) => g.measureText(ch).width);
        // letter spacing as a share of the size, or whatever spreads the word over `width`
        const sp = o.width != null && text.length > 1 ? (o.width - ws.reduce((a, b) => a + b, 0)) / (text.length - 1) : (o.spacing ?? 0) * (o.size ?? 12);
        const total = ws.reduce((a, b) => a + b, 0) + sp * (text.length - 1);
        let cx = o.align === 'left' ? 0 : o.align === 'right' ? -total : -total / 2;
        [...text].forEach((ch, i) => { g.fillText(ch, cx, (o.size ?? 12) * 0.35); cx += ws[i] + sp; });
        g.restore();
        return total;
    }
    // The frame of the page: a margin of paper, a thick outer rule and a thin inner one.
    function neatline(g, env, o = {}) {
        const k = env.W / 1280;
        const [x0, y0, x1, y1] = (o.map ?? [15, 15, 1265, 705]).map((v) => v * k);
        g.save();
        g.fillStyle = o.margin ?? INK.margin;
        g.beginPath();
        g.rect(0, 0, env.W, env.H);
        g.rect(x0, y0, x1 - x0, y1 - y0);
        g.fill('evenodd');
        g.strokeStyle = INK.neat;
        g.lineWidth = 2.0 * k;
        g.strokeRect(9 * k, 9 * k, env.W - 18 * k, env.H - 18 * k);
        g.lineWidth = 1.0 * k;
        g.strokeRect(13.5 * k, 13.5 * k, env.W - 27 * k, env.H - 27 * k);
        g.restore();
    }
    // A scale bar: ticks at 0, half and full, numbers above, the unit after the last.
    function scaleBar(g, x, y, len, o = {}) {
        g.save();
        g.strokeStyle = g.fillStyle = o.color ?? INK.letter;
        g.lineWidth = o.width ?? 1.6;
        g.beginPath();
        g.moveTo(x, y); g.lineTo(x + len, y);
        for (const f of [0, 0.5, 1]) { g.moveTo(x + len * f, y - (o.tick ?? 5)); g.lineTo(x + len * f, y + (o.tick ?? 5)); }
        g.stroke();
        g.font = `${o.size ?? 12}px ${o.family ?? 'Garamond'}`;
        g.textAlign = 'center';
        const labels = o.labels ?? ['0', '5', '10'];
        [0, 0.5, 1].forEach((f, i) => g.fillText(labels[i], x + len * f, y - (o.above ?? 10)));
        g.textAlign = 'left';
        g.fillText(o.unit ?? 'km', x + len + (o.unitGap ?? 9), y - (o.above ?? 10));
        g.restore();
    }
    // A road: a main road is a white core in a grey casing; a lane is one grey hairline.
    function road(g, pts, o = {}) {
        const A0 = g.globalAlpha;   // ink fades with whatever alpha it is drawn under
        const sm = smooth(pts, 5);
        g.lineCap = 'round';
        g.lineJoin = 'round';
        if (o.main) {
            g.strokeStyle = o.edge ?? INK.roadEdge;
            g.lineWidth = o.width ?? 3.0;
            pathOf(g, sm); g.stroke();
            g.strokeStyle = o.core ?? INK.road;
            g.lineWidth = (o.width ?? 3.0) * 0.45;
            pathOf(g, sm); g.stroke();
        } else {
            g.strokeStyle = o.edge ?? INK.roadEdge;
            g.globalAlpha = A0 * (o.alpha ?? 0.75);
            g.lineWidth = o.width ?? 0.9;
            pathOf(g, sm); g.stroke();
            g.globalAlpha = A0 * (1);
        }
    }
    // A building: a small dark block with softened corners, a lighter roof edge on the lit side.
    function house(g, x, y, s, a = 0, o = {}) {
        g.save();
        g.translate(x, y);
        g.rotate(a);
        const r = Math.min(0.9, s * 0.28);
        g.beginPath();
        g.roundRect(-s / 2, -s / 2, s, s * (o.aspect ?? 1), r);
        g.fillStyle = o.color ?? INK.block;
        g.fill();
        g.restore();
    }
    // A village: houses scattered about a centre, thicker near it, along a given direction.
    function village(g, x, y, n, seed, o = {}) {
        const rnd = Motion.rng('village-' + seed), dir = o.angle ?? 0, spread = o.spread ?? 9;
        for (let i = 0; i < n; i++) {
            const along = (rnd() - 0.5) * 2 * spread * (o.stretch ?? 1.6), across = (rnd() - 0.5) * spread * 0.9 * (1 - Math.abs(along) / (spread * 2.2));
            const s = (o.size ?? 3.2) * (0.75 + 0.5 * rnd());
            house(g, x + along * Math.cos(dir) - across * Math.sin(dir), y + along * Math.sin(dir) + across * Math.cos(dir), s, dir + (rnd() - 0.5) * 0.4, o);
        }
    }
    // ------------------------------------------------------------------------------- towns
    // A town as the plate draws one: its ground is the pale of its streets; on it, BLOCKS
    // (irregular quadrilaterals, the spaces between streets), each cut into LOTS: small
    // dark-grey quads of their own tones, each with a darker rim, with hairline gaps between
    // them. Seen whole it is a dark mass threaded by white streets; it frays at its edge into
    // scattered lots. A block is [x0,y0, x1,y1, x2,y2, x3,y3] (corners in turn); lots are laid
    // on its own bilinear grid, so they follow its shape.
    const LOT = ['#5d564e', '#655e55', '#6b645b', '#716a61', '#5a534b', '#696258'];
    function blocks(g, list, o = {}) {
        const lot = o.lot ?? 2.7, gap = o.gap ?? 0.45, keep = o.keep ?? (() => 1), rimW = o.rim ?? 0.32;
        const A0 = g.globalAlpha;
        for (const q of list) {
            const rnd = Motion.rng('lots-' + q.seed);
            const P = (u, v) => [
                (1 - v) * ((1 - u) * q.c[0] + u * q.c[2]) + v * ((1 - u) * q.c[6] + u * q.c[4]),
                (1 - v) * ((1 - u) * q.c[1] + u * q.c[3]) + v * ((1 - u) * q.c[7] + u * q.c[5]),
            ];
            const lu = Math.hypot(q.c[2] - q.c[0], q.c[3] - q.c[1]), lv = Math.hypot(q.c[6] - q.c[0], q.c[7] - q.c[1]);
            const nu = Math.max(1, Math.round(lu / lot)), nv = Math.max(1, Math.round(lv / lot));
            const gu = gap / Math.max(lu, 1e-3), gv = gap / Math.max(lv, 1e-3);
            for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
                // now and then two lots are one (a bigger house), now and then a yard is empty
                if (rnd() < (o.empty ?? 0.03)) continue;
                const u0 = i / nu + gu * 0.5, u1 = (i + 1) / nu - gu * 0.5, v0 = j / nv + gv * 0.5, v1 = (j + 1) / nv - gv * 0.5;
                const c = P((u0 + u1) / 2, (v0 + v1) / 2);
                const k = keep(c[0], c[1], q);
                if (k <= 0 || rnd() > k) continue;
                const a = P(u0, v0), b = P(u1, v0), cc = P(u1, v1), d = P(u0, v1);
                // a softened quad: each corner cut by a quarter of the side, so lots read as
                // rounded houses; a darker rim, and the lit corner (upper left) a touch lighter
                const corners = [a, b, cc, d], R = 0.28;
                g.beginPath();
                for (let m = 0; m < 4; m++) {
                    const p0 = corners[(m + 3) % 4], p1 = corners[m], p2 = corners[(m + 1) % 4];
                    const s0 = [p1[0] + (p0[0] - p1[0]) * R, p1[1] + (p0[1] - p1[1]) * R], s1 = [p1[0] + (p2[0] - p1[0]) * R, p1[1] + (p2[1] - p1[1]) * R];
                    m ? g.lineTo(s0[0], s0[1]) : g.moveTo(s0[0], s0[1]);
                    g.quadraticCurveTo(p1[0], p1[1], s1[0], s1[1]);
                }
                g.closePath();
                g.globalAlpha = A0;
                g.fillStyle = LOT[Math.floor(rnd() * LOT.length)];
                g.fill();
                g.strokeStyle = 'rgba(40,35,30,0.55)';
                g.lineWidth = rimW;
                g.stroke();
                g.globalAlpha = A0 * 0.22;
                g.fillStyle = '#d8d0c2';
                g.beginPath();
                const h0 = P(u0 + (u1 - u0) * 0.18, v0 + (v1 - v0) * 0.18), h1 = P(u0 + (u1 - u0) * 0.55, v0 + (v1 - v0) * 0.18), h2 = P(u0 + (u1 - u0) * 0.18, v0 + (v1 - v0) * 0.55);
                g.moveTo(h0[0], h0[1]); g.lineTo(h1[0], h1[1]); g.lineTo(h2[0], h2[1]); g.closePath();
                g.fill();
            }
        }
        g.globalAlpha = A0;
    }
    // Blocks of a radial town: rings cut by radial streets (the roads' ends) and by cross lanes,
    // every corner nudged so no line runs quite straight; blocks fray beyond the edge.
    function radialBlocks(cx, cy, R, o = {}) {
        const rnd = Motion.rng('radial-' + (o.seed ?? 1)), out = [];
        const spokes = (o.spokes ?? [0.4, 1.2, 2.0, 2.8, 3.6, 4.4, 5.2, 6.0]).slice().sort((a, b) => a - b);
        const ring = o.ring ?? 9.5, street = o.street ?? 1.5, cross = o.cross ?? 12;
        const rings = [];
        for (let r = o.core ?? 3.5; r < R * 1.25; r += ring * (0.9 + 0.2 * rnd())) rings.push(r);
        for (let s = 0; s < spokes.length; s++) {
            const a0 = spokes[s], a1 = s + 1 < spokes.length ? spokes[s + 1] : spokes[0] + Math.PI * 2;
            for (let k = 0; k + 1 < rings.length; k++) {
                const r0 = rings[k] + street / 2, r1 = rings[k + 1] - street / 2, rm = (r0 + r1) / 2;
                const span = (a1 - a0) * rm, n = Math.max(1, Math.round(span / cross));
                for (let i = 0; i < n; i++) {
                    const pad0 = (i === 0 ? street * 0.6 : street * 0.5) / rm, pad1 = (i === n - 1 ? street * 0.6 : street * 0.5) / rm;
                    const b0 = a0 + ((a1 - a0) * i) / n + pad0, b1 = a0 + ((a1 - a0) * (i + 1)) / n - pad1;
                    if (b1 <= b0) continue;
                    const j = () => (rnd() - 0.5) * 0.9;
                    const pt = (r, a) => [cx + (r + j()) * Math.cos(a), cy + (r + j()) * Math.sin(a)];
                    const A = pt(r0, b0), B = pt(r0, b1), C = pt(r1, b1), D = pt(r1, b0);
                    out.push({ c: [...A, ...B, ...C, ...D], seed: (o.seed ?? 1) * 1e4 + s * 100 + k * 7 + i, r: rm });
                }
            }
        }
        return out;
    }
    // Blocks of a real town: a jittered street grid laid along the town's own grain (the
    // direction of its streets, a field), district by district; only where `inside` says
    // there is built-up land do lots go down, so the town keeps its true outline.
    function gridBlocks(x0, y0, x1, y1, angleAt, o = {}) {
        const rnd = Motion.rng('grid-' + (o.seed ?? 1)), out = [];
        const block = o.block ?? 12, street = o.street ?? 1.4, D = o.district ?? 64;
        for (let dy = y0; dy < y1; dy += D) for (let dx = x0; dx < x1; dx += D) {
            const cxD = dx + D / 2, cyD = dy + D / 2;
            const th = angleAt(cxD, cyD) + (rnd() - 0.5) * 0.08, ca = Math.cos(th), sa = Math.sin(th);
            const bs = block * (o.blockAt ? o.blockAt(cxD, cyD) : 1);
            const n = Math.ceil((D * 1.6) / bs);
            const ph = [rnd() * bs, rnd() * bs];
            const vtx = {};
            const V = (i, j) => {
                const key = i + ',' + j;
                if (!vtx[key]) {
                    const u = i * bs - n * bs / 2 + ph[0] + (rnd() - 0.5) * bs * 0.22, v = j * bs * (o.aspect ?? 1.25) - n * bs / 2 + ph[1] + (rnd() - 0.5) * bs * 0.22;
                    vtx[key] = [cxD + u * ca - v * sa, cyD + u * sa + v * ca];
                }
                return vtx[key];
            };
            for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
                const A = V(i, j), B = V(i + 1, j), C = V(i + 1, j + 1), Dd = V(i, j + 1);
                const mx = (A[0] + C[0]) / 2, my = (A[1] + C[1]) / 2;
                if (mx < dx || mx >= dx + D || my < dy || my >= dy + D) continue;     // each block to one district
                // pull the corners in toward the centre by half a street
                const shrink = (P) => { const vx = mx - P[0], vy = my - P[1], l = Math.hypot(vx, vy) || 1; return [P[0] + (vx / l) * street * 0.7, P[1] + (vy / l) * street * 0.7]; };
                out.push({ c: [...shrink(A), ...shrink(B), ...shrink(C), ...shrink(Dd)], seed: Math.round(mx * 1000 + my), x: mx, y: my });
            }
        }
        return out;
    }
    // The radial town of the plate: its pale ground, its blocks, done.
    function town(g, cx, cy, R, o = {}) {
        const key = [cx, cy, R, o.seed, (o.spokes ?? []).join()].join('|');
        if (!town.cache) town.cache = new Map();
        if (!town.cache.has(key)) town.cache.set(key, radialBlocks(cx, cy, R, o));
        const list = town.cache.get(key);
        const edgeR = (a) => R * (0.9 + 0.08 * Math.sin(a * 3 + 1.3) + 0.06 * Math.sin(a * 5 + 0.4));
        const A0 = g.globalAlpha;
        g.beginPath();
        for (let i = 0; i <= 64; i++) {
            const a = (i / 64) * Math.PI * 2, rr = edgeR(a) + 2;
            i ? g.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)) : g.moveTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
        }
        g.fillStyle = o.ground ?? INK.street;
        g.globalAlpha = A0 * 0.92;
        g.fill();
        g.globalAlpha = A0;
        blocks(g, list, {
            lot: o.lot ?? 2.7,
            keep: (x, y) => { const r = Math.hypot(x - cx, y - cy), e = edgeR(Math.atan2(y - cy, x - cx)); return r < e ? 0.97 : Math.max(0, 1 - (r - e) / (R * 0.3)) * 0.5; },
        });
    }
    // Fields: a patchwork of parcels on a tilted grid wherever `where(x, y)` says there is
    // plain, each a pale wash of one of the field greens and buffs with a faint edge.
    function fields(g, x0, y0, x1, y1, where, o = {}) {
        const A0 = g.globalAlpha;   // ink fades with whatever alpha it is drawn under
        const rnd = Motion.rng('fields-' + (o.seed ?? 1)), a = o.angle ?? -0.06;
        const ca = Math.cos(a), sa = Math.sin(a), pal = o.palette ?? INK.field;
        const to = (u, v) => [x0 + (u - x0) * ca - (v - y0) * sa, y0 + (u - x0) * sa + (v - y0) * ca];
        // rows of parcels of their own heights, each row cut into parcels of their own widths
        for (let v = y0 - 60; v < y1 + 60;) {
            const rh = (o.row ?? 22) * (0.55 + 0.6 * rnd());
            for (let u = x0 - 60; u < x1 + 60;) {
                const w = (o.cell ?? 24) * (0.5 + 1.1 * rnd());
                const [x, y] = to(u + w / 2, v + rh / 2);
                if (where(x, y)) {
                    const wash = rnd() < (o.fill ?? 0.62);
                    g.save();
                    g.translate(x, y);
                    g.rotate(a);
                    if (wash) {
                        g.globalAlpha = A0 * ((o.alpha ?? 0.6) * (0.55 + 0.45 * rnd()));
                        g.fillStyle = pal[Math.floor(rnd() * pal.length)];
                        g.fillRect(-w / 2 + 0.4, -rh / 2 + 0.4, w - 0.8, rh - 0.8);
                    }
                    g.globalAlpha = A0 * (o.edgeAlpha ?? 0.4);
                    g.strokeStyle = INK.fieldEdge;
                    g.lineWidth = 0.45;
                    g.strokeRect(-w / 2 + 0.4, -rh / 2 + 0.4, w - 0.8, rh - 0.8);
                    g.restore();
                }
                u += w;
            }
            v += rh;
        }
        g.globalAlpha = A0 * (1);
    }
    // An arch dam: the crest from a to b bowed toward the water (upstream), the downstream face
    // as a fan from the crest down to a straighter foot, concrete grey ruled down its slope and
    // stippled, lit on the side the light comes from; a white crest line and a dark foot.
    function dam(g, a, b, o = {}) {
        const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
        const nx = -dy / L, ny = dx / L, side = o.down ?? 1;             // n·side points downstream
        const bow = (o.bow ?? 0.14) * L, d0 = (o.depth ?? [0.45, 0.55])[0] * L, d1 = (o.depth ?? [0.45, 0.55])[1] * L;
        const crest = [], foot = [], n = 18;
        for (let i = 0; i <= n; i++) {
            const t = i / n, k = Math.sin(t * Math.PI), d = d0 + (d1 - d0) * t;
            crest.push([a[0] + dx * t - nx * side * bow * k, a[1] + dy * t - ny * side * bow * k]);
            const ft = 0.12 + 0.76 * t;                                    // the foot is narrower
            foot.push([a[0] + dx * ft + nx * side * (d - bow * 0.25 * k), a[1] + dy * ft + ny * side * (d - bow * 0.25 * k)]);
        }
        const rnd = Motion.rng('dam-' + (o.seed ?? 1));
        g.save();
        pathOf(g, crest.concat(foot.slice().reverse()), true);
        const grd = g.createLinearGradient(a[0], a[1], b[0], b[1]);
        grd.addColorStop(0, o.light ?? '#b9b5ac');
        grd.addColorStop(1, o.dark ?? '#7c7871');
        g.fillStyle = grd;
        g.fill();
        g.clip();
        g.strokeStyle = 'rgba(45,40,35,0.32)';
        g.lineWidth = 0.4;
        for (let i = 0; i <= 30; i++) {                                    // rules down the face
            const t = i / 30, c = crest[Math.round(t * n)], f = foot[Math.round(t * n)];
            g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(f[0], f[1]); g.stroke();
        }
        g.fillStyle = 'rgba(40,35,30,0.35)';                               // stipple
        for (let i = 0; i < 260; i++) {
            const t = rnd(), s = rnd(), c = crest[Math.round(t * n)], f = foot[Math.round(t * n)];
            g.fillRect(c[0] + (f[0] - c[0]) * s, c[1] + (f[1] - c[1]) * s, 0.45, 0.45);
        }
        g.restore();
        g.lineCap = 'round';
        g.strokeStyle = 'rgba(40,36,32,0.7)';
        g.lineWidth = 0.6;
        pathOf(g, foot); g.stroke();
        g.strokeStyle = 'rgba(40,36,32,0.6)';
        g.lineWidth = 0.5;
        pathOf(g, crest.map(([x, y]) => [x + nx * side * 1.4, y + ny * side * 1.4])); g.stroke();
        g.strokeStyle = o.crestColor ?? '#f3efe6';
        g.lineWidth = o.crest ?? 2.0;
        pathOf(g, crest); g.stroke();
    }
    // Is (x, y) inside the polygon pts?
    function inside(pts, x, y) {
        let c = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const [xi, yi] = pts[i], [xj, yj] = pts[j];
            if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
        }
        return c;
    }
    return { blocks, radialBlocks, gridBlocks, along, channel, inside, SWISS, INK, load, relief, onMap, smooth, lengths, river, lake, dashed, label, neatline, scaleBar, pathOf, road, house, village, town, fields, dam };
})();
