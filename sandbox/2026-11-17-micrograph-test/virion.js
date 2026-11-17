// micrograph-test · the virion of the dark palette, shared by the shots that show it (Dark,
// Budding): everything measured on the user's still (see dark.js) as one function.
window.MGT = window.MGT ?? {};
MGT.lib = MGT.lib ?? {};
MGT.lib.virion = `
// the inks (sRGB, each pure at its own luminance)
const vec3 RED = vec3(0.70, 0.20, 0.21), YELLOW = vec3(0.95, 0.72, 0.28), BLUE = vec3(0.27, 0.45, 0.48), MAUVE = vec3(0.62, 0.40, 0.39);
// l = a point in the virion's own frame, ax = its semi-axes, look = (core signal, shell
// signal, yellow in the shell, mauve in the zone round the core). Gives its signal v, ink k
// and grit gr, how much of the pixel it covers, and how far its ink reaches (inkw)
void virion(vec2 l, vec2 ax, float seed, vec4 look, float tm, out float v, out vec3 k, out float gr, out float cover, out float inkw) {
    float a = atan(l.y, l.x);
    float rn = length(l / ax) / wobble(a, seed, 0.06, tm);            // 1 on the fitted outline
    float R = min(ax.x, ax.y);
    vec3 h = hash3(vec2(seed, 11.0));
    // nothing in it is centred: the core sits to one side, so the shell is thick on the other
    vec2 lc = l - 0.11 * R * vec2(cos(h.x * 6.283), sin(h.x * 6.283));
    float rc = length(lc / ax) * wobble(atan(lc.y, lc.x), seed + 3.0, 0.10, tm * 0.7);
    float side = 0.5 + 0.5 * cos(a - h.x * 6.283 - 3.14159);                    // 1 where the shell is thick
    // what it is made of, fixed to it: the grains of the core, finer ones in the shell
    float g1 = grainy(l, R * 0.085, seed, 0.5), g2 = grainy(l, R * 0.054, seed + 9.0, 0.85);
    // … and in the shell they are combed outwards (the stalks of the spikes go through it)
    float g3 = grainy(vec2(a * R * 0.85, rn * R * 0.55) + 0.02 * R * g1, R * 0.054, seed + 4.0, 0.85);
    float core = look.x, top = look.y, yel = look.z, pale = look.w;
    // signal by radius, as measured: a core, a paler zone round it, a bright thin shell
    // (thicker on one side), a rim that falls off, and the fringe of spikes
    float zone = smoothstep(0.40, 0.66, rc), ring = smoothstep(0.70, 0.88, rn + 0.09 * (side - 0.5));
    v = mix(core, mix(core, top, 0.5), zone);
    v = mix(v, top * (0.84 + 0.24 * side), ring);
    gr = 0.24 * g1 * smoothstep(1.0, 0.3, rn) + mix(0.74, 0.56, ring) * mix(g2, g3, 0.8 * smoothstep(0.55, 0.8, rn));
    v = mix(v, 0.50 * top / 0.74 + 0.10, smoothstep(0.87, 1.0, rn));
    float d = (rn - 0.975) * R;
    float spikes = crown(d, a, 13.0, 0.42 * R, seed, tm, 0.0);
    float fringe = 0.34 * smoothstep(1.22, 1.0, rn) + 0.27 * spikes;
    float m = smoothstep(1.07, 0.93, rn);                                      // the body's own edge, soft
    v = mix(fringe, v, m);
    cover = clamp(max(m, smoothstep(1.34, 1.04, rn) * 0.9 + 0.75 * spikes), 0.0, 1.0);
    // its inks: red core (lifted towards white it reads pink), a yellow shell, the
    // blue-grey fringe; a dim virion has a mauve shell and hardly any yellow
    k = mix(RED, MAUVE, pale * zone);
    k = mix(k, YELLOW, clamp(ring * yel * (0.6 + 0.6 * side), 0.0, 1.0));
    k = mix(BLUE, k, smoothstep(1.05, 0.93, rn));
    inkw = smoothstep(1.5, 1.1, rn);
}
`;
