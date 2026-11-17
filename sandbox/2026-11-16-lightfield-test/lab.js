// lightfield-test · the optics bench shared by the Prism and Slits shots: a dark matte
// table seen from above and in front, on which light grazes (so a beam shows as the streak
// it lays on the paper, the way a ray box does), and the pieces standing on it.
// Table coordinates: X to the right, Z away from the camera, Y up; the table is y = 0.
// The camera is in uA[0..6] (position, target, focal length in frame heights), so a shot
// can move it.
window.LFT = window.LFT ?? {};
LFT.lab = {
    glsl: `
#define CAM vec3(uA[0], uA[1], uA[2])
#define TGT vec3(uA[3], uA[4], uA[5])
#define FOCAL uA[6]
vec3 viewRay(vec2 p) {
    vec3 f = normalize(TGT - CAM), r = normalize(cross(vec3(0.0, 1.0, 0.0), f)), u = cross(f, r);
    return normalize(p.x * r + p.y * u + FOCAL * f);
}
// where the view ray meets the plane y = h (far away if it never does)
vec2 planeAt(vec3 rd, float h, out float t) {
    t = rd.y < -1e-4 ? (h - CAM.y) / rd.y : 1e4;
    return CAM.xz + rd.xz * t;
}
float cross2(vec2 a, vec2 b) { return a.x * b.y - a.y * b.x; }
float segd(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
// the colour of one wavelength (nm), linear sRGB, negative lobes cut (Wyman's fit of CIE 1931)
vec3 spectral(float nm) {
    float x = 1.065 * exp(-0.5 * pow((nm - 595.8) / 33.33, 2.0)) + 0.366 * exp(-0.5 * pow((nm - 446.8) / 19.44, 2.0));
    float y = 1.014 * exp(-0.5 * pow((log(nm) - log(556.3)) / 0.075, 2.0));
    float z = 1.839 * exp(-0.5 * pow((log(nm) - log(449.8)) / 0.051, 2.0));
    return max(vec3(3.2406 * x - 1.5372 * y - 0.4986 * z, -0.9689 * x + 1.8758 * y + 0.0415 * z, 0.0557 * x - 0.2040 * y + 1.0570 * z), 0.0);
}
// the table top: black card. What it gives back of a grazing light is not even: fibres,
// a grain, and dust lying on it that catches far more than the card does.
vec3 tableLit(vec2 T, vec3 light) {
    float grain = 0.55 + 0.9 * noise(T * 210.0) * noise(T * 520.0 + 9.0) * 2.0;
    float cloud = 0.7 + 0.6 * fbm(T * 5.0 + 2.0);
    vec2 g = T * 95.0, i = floor(g);
    vec3 h = hash3(i + 3.0);
    vec2 f = fract(g) - (0.2 + 0.6 * h.xy);
    float an = h.z * 6.283;
    // a speck or a fibre in one cell out of three
    float fibre = smoothstep(0.07, 0.02, segd(f, vec2(0.0), vec2(cos(an), sin(an)) * 0.32 * h.x * h.x)) * step(0.66, h.y) * (0.3 + 2.2 * pow(h.x, 3.0));
    return light * (0.085 * grain * cloud + 0.55 * fibre);
}
`,
    // Snell through a triangular prism, in the table's plane. V: its three corners; o, d: a
    // ray; n: the glass's index for this colour. Returns where it goes in, where it comes
    // out and its direction after (null if it is totally reflected inside or misses).
    trace(V, o, d, n) {
        const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
        const hit = (o, d, skip) => {
            let best = null;
            for (let i = 0; i < 3; i++) {
                if (i === skip) continue;
                const A = V[i], B = V[(i + 1) % 3], e = [B[0] - A[0], B[1] - A[1]], den = cross(d, e);
                if (Math.abs(den) < 1e-9) continue;
                const ao = [A[0] - o[0], A[1] - o[1]], t = cross(ao, e) / den, u = cross(ao, d) / den;
                if (t > 1e-6 && u >= 0 && u <= 1 && (!best || t < best.t)) best = { t, i, e };
            }
            return best;
        };
        const normal = (e, d) => {
            let n = [e[1], -e[0]];
            const l = Math.hypot(n[0], n[1]);
            n = [n[0] / l, n[1] / l];
            return n[0] * d[0] + n[1] * d[1] > 0 ? [-n[0], -n[1]] : n;
        };
        const refract = (d, nrm, eta) => {
            const c = -(d[0] * nrm[0] + d[1] * nrm[1]), k = 1 - eta * eta * (1 - c * c);
            if (k < 0) return null;
            const f = eta * c - Math.sqrt(k);
            return [eta * d[0] + f * nrm[0], eta * d[1] + f * nrm[1]];
        };
        const h1 = hit(o, d, -1);
        if (!h1) return null;
        const pin = [o[0] + d[0] * h1.t, o[1] + d[1] * h1.t], n1 = normal(h1.e, d);
        const d1 = refract(d, n1, 1 / n);
        const h2 = hit(pin, d1, h1.i);
        if (!h2) return null;
        const pout = [pin[0] + d1[0] * h2.t, pin[1] + d1[1] * h2.t];
        const d2 = refract(d1, normal(h2.e, d1), n);
        const c = -(d[0] * n1[0] + d[1] * n1[1]);
        return { pin, pout, dout: d2, n1, reflected: [d[0] + 2 * c * n1[0], d[1] + 2 * c * n1[1]] };
    },
    // the glass: a dense flint, with its dispersion stretched about three times so the fan
    // reads on a table a metre wide (the order and the shape of the spectrum are the real ones)
    index: (nm) => 1.5515 + 0.02376 / ((nm / 1000) * (nm / 1000)),
};
