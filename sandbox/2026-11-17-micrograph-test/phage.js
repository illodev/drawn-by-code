// micrograph-test · Phage (ours, the stain palette): bacteriophages on the wall of a
// bacterium, in negative stain. No reference still: built from what a T4 looks like in
// stain (a prolate head, pale while it is full of DNA because the stain cannot get in and
// dark with a pale shell once it is empty; a collar; a striated sheath round a thin tube; a
// baseplate; long kinked fibres, faint) and from what it does: the fibres find the wall,
// the baseplate sits, the sheath contracts to half its length and drives the tube in, and
// the head empties. The stain pools darkest against everything that stands on the film.
// Licence taken: in a dried preparation nothing moves.
window.MGT = window.MGT ?? {};
MGT.phage = {
    // the bacterium is a disc so big that only an arc of its wall crosses the bottom of the frame
    CELL: [-0.25, -1.06, 0.93],
    glsl: `
#define T uA[0]
#define STAGE vec2(uA[1], uA[2])
#define ZOOM uA[4]
#define NP 4
// phage i: head centre uA[8 + 6 i], uA[9 + 6 i]; direction of its tail [10] (rad); how far
// the sheath has contracted [11] (0–1); how full the head is [12] (1–0); how far its
// fibres are folded down onto the wall [13] (0 = splayed, free; 1 = planted)
const vec3 CELL = vec3(-0.25, -1.06, 0.93);
const vec3 LILAC = vec3(0.86, 0.78, 0.89), PURPLE = vec3(0.45, 0.31, 0.43), WINE = vec3(0.42, 0.22, 0.25);
const vec3 YOLK = vec3(0.73, 0.58, 0.26), PINK = vec3(0.68, 0.50, 0.44), RUST = vec3(0.58, 0.37, 0.34);
float segd(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
// a prolate hexagon (the head seen side on), distance in the units of r
float hexd(vec2 q, vec2 r) {
    vec2 a = abs(q / r);
    return (max(a.y * 0.92 + a.x * 0.42, a.x * 1.02) - 1.0) * min(r.x, r.y);
}
void specimen(vec2 p, out float s, out vec3 ink) {
    vec2 q = p / ZOOM - STAGE;
    float gf = grainy(q, 0.0056, 1.0, 0.75), gm = grainy(q, 0.013, 2.0, 0.5);
    // ---- the bacterium's wall
    float dc = length(q - CELL.xy) - CELL.z + 0.012 * (fbm(q * 5.0 + 3.0) - 0.5);
    // ---- the nearest phage, in its own frame: x along the tail from the head's centre
    int ip = 0;
    float best = 1e3, second = 1e3;
    for (int i = 0; i < NP; i++) {
        vec2 c = vec2(uA[8 + 6 * i], uA[9 + 6 * i]), dir = vec2(cos(uA[10 + 6 * i]), sin(uA[10 + 6 * i]));
        float d = segd(q, c, c + dir * 0.25);
        if (d < best) { second = best; best = d; ip = i; } else second = min(second, d);
    }
    vec2 c = vec2(uA[8 + 6 * ip], uA[9 + 6 * ip]);
    float ang = uA[10 + 6 * ip], con = uA[11 + 6 * ip], full = uA[12 + 6 * ip], fold = uA[13 + 6 * ip], seed = float(ip) * 7.0 + 3.0;
    vec2 l = rot(ang) * (q - c);
    l += 0.004 * (vec2(noise(l * 40.0 + seed), noise(l * 40.0 + seed + 9.0)) - 0.5);          // nothing is ruled
    vec2 HR = vec2(0.082, 0.060);                                       // the head: half length, half width
    float dh = hexd(l, HR * wobble(atan(l.y, l.x), seed, 0.035, 0.0));
    float neck = length(l - vec2(0.094, 0.0)) - 0.017;
    float len = mix(0.150, 0.072, con), wid = mix(0.0150, 0.0235, con), x0 = 0.106;   // the sheath: shorter and fatter once contracted
    float dsh = segd(l, vec2(x0 + wid, 0.0), vec2(x0 + len - wid, 0.0)) - wid;
    float dtube = segd(l, vec2(x0, 0.0), vec2(x0 + 0.150 + 0.012, 0.0)) - 0.0055;     // the tube keeps its length: it sticks out
    float dplate = segd(l, vec2(x0 + len + 0.004, -0.024), vec2(x0 + len + 0.004, 0.024)) - 0.0085;
    // the fibres: four of the six show, each with a knee; free they splay, planted they fold down
    float dfib = 1e3;
    for (int k = 0; k < 4; k++) {
        vec3 h = hash3(vec2(float(k), seed));
        float side = k < 2 ? 1.0 : -1.0, sw = 0.25 * sin(T * (0.6 + h.x) + h.y * 6.283) * (1.0 - fold);
        vec2 root = vec2(x0 + len, side * 0.018);
        float a1 = mix(2.3 + 0.5 * h.x, 2.05 + 0.3 * h.x, fold) + sw, a2 = mix(1.5 + 0.9 * h.y, 0.42 + 0.25 * h.z, fold) + sw;
        vec2 knee = root + (0.066 + 0.014 * h.z) * vec2(cos(a1), side * sin(a1));
        vec2 tip = knee + (0.078 + 0.016 * h.x) * vec2(cos(a2), side * sin(a2));
        dfib = min(dfib, min(segd(l, root, knee), segd(l, knee, tip)));
    }
    float dbody = min(min(dh, neck), min(min(dsh, dplate), dtube));
    // ---- the film and the stain: it lies deepest against whatever stands on it
    float near = min(min(dbody, dfib + 0.012), max(dc, 0.0));
    float pool = exp(-max(near, 0.0) / 0.055);
    // (the next nearest phage's pool too, roughly, so no seam shows half way between two)
    pool = max(pool, 0.9 * exp(-max(min(best, second) - 0.055, 0.0) / 0.055));
    s = 0.76 + 0.05 * (fbm(q * 2.3 + 5.0) - 0.5) + 0.03 * q.y;
    s *= 1.0 - 0.56 * pool * (0.85 + 0.2 * gm);
    ink = mix(LILAC, PURPLE, smoothstep(0.08, 0.65, pool));
    ink = mix(ink, WINE, smoothstep(0.7, 1.0, pool));
    grit = (0.09 + 0.12 * pool) * gf;
    // ---- the bacterium: pale where the stain cannot get in, a wall with a seam, mottled
    float cell = inside(dc, 0.010);
    float wall = shell(dc + 0.016, 0.012), seam = shell(dc + 0.034, 0.006);
    float cs = 0.52 + 0.10 * smoothstep(0.3, 0.7, fbm(q * 7.0 + 12.0)) + 0.10 * wall - 0.07 * seam + 0.05 * gm;
    s = mix(s, cs, cell);
    ink = mix(ink, mix(PINK, YOLK, 0.55 * smoothstep(0.03, 0.10, -dc)), cell);
    grit = mix(grit, 0.13 * gf + 0.06 * gm, cell);
    // ---- the phage. Fibres first: faint, pale threads in the dark stain
    float fib = smoothstep(0.0065, 0.0015, dfib) * (0.55 + 0.35 * gm) * (1.0 - cell);
    s = mix(s, 0.57, 0.8 * fib);
    ink = mix(ink, PINK, 0.7 * fib);
    // the tube, the sheath with its turns, the baseplate, the collar
    float tube = inside(dtube, 0.004) * (1.0 - 0.75 * cell);
    s = mix(s, 0.50, 0.75 * tube);
    ink = mix(ink, PINK, 0.8 * tube);
    float sh = inside(dsh, 0.005), turns = 0.5 + 0.5 * sin((l.x - x0) / mix(0.0125, 0.0105, con) * 6.2831853);
    s = mix(s, 0.56 + 0.045 * turns + 0.03 * gm, sh);
    ink = mix(ink, PINK, sh);
    float pl = inside(min(dplate, neck), 0.005);
    s = mix(s, 0.55, pl);
    ink = mix(ink, RUST, 0.8 * pl);
    // the head: full, the stain stays out and it is pale and grainy; empty, the stain is
    // inside and only the shell stays pale
    float hd = inside(dh, 0.005), rim = shell(dh + 0.009, 0.007);
    float hfull = 0.61 + 0.05 * gm, hempty = mix(0.27 + 0.04 * gm, 0.58, rim);
    s = mix(s, mix(hempty, hfull, full), hd);
    ink = mix(ink, mix(mix(WINE, PINK, rim), YOLK, full), hd);
    grit = mix(grit, mix(0.12, 0.17, full) * grainy(l, 0.0062, seed, 0.8) + 0.05 * gm, max(hd, sh));
}
`,
    frame(t, edge) {
        const [cx, cy, R] = this.CELL, a = new Array(34).fill(0);
        // a point on the wall at `deg` from the top of the arc, and the way down onto it
        const onWall = (deg, h) => { const r = ((90 - deg) * Math.PI) / 180; return [cx + (R + h) * Math.cos(r), cy + (R + h) * Math.sin(r), r + Math.PI]; };
        a[0] = t;
        a[1] = 0.003 * t;
        a[2] = 0.0015 * t;
        a[4] = (1 + 0.35 * edge.inn) * (1 + 0.6 * edge.out);
        // the one we watch: it comes down, its fibres find the wall (2.0 s), the baseplate
        // sits (2.6 s), the sheath contracts (3.0–3.5 s) and the head empties (3.6–5.2 s)
        const con = Ease.inOut(Ease.seg(t, 3.0, 3.5)), land = Ease.inOut(Ease.seg(t, 0.2, 2.6));
        // (head height above the wall: the tube's length while free, less what the sheath takes up)
        const h = 0.106 + 0.150 + 0.03 + 0.11 * (1 - land) - 0.078 * con;
        const [x, y, dir] = onWall(13 - 9 * (1 - land), h);
        const wob = (1 - land) * (0.35 * Math.sin(t * 1.7) + 0.2 * Math.sin(t * 2.9 + 1));
        a.splice(8, 6, x + 0.012 * (1 - land) * Math.sin(t * 2.3), y, dir + wob, con, 1 - Ease.inOut(Ease.seg(t, 3.6, 5.2)), Ease.inOut(Ease.seg(t, 1.5, 2.6)));
        // one that did all that before we looked: contracted, empty, planted
        const [x1, y1, d1] = onWall(-24, 0.106 + 0.150 + 0.03 - 0.078);
        a.splice(14, 6, x1, y1, d1 + 0.12, 1, 0, 1);
        // two still adrift in the stain, tumbling slowly
        a.splice(20, 6, 0.52 + 0.010 * t + 0.006 * Math.sin(t * 1.1), 0.24 + 0.004 * Math.cos(t * 0.9), -2.2 + 0.06 * t + 0.05 * Math.sin(t * 1.3), 0, 1, 0);
        a.splice(26, 6, -0.60 - 0.006 * t, 0.30 + 0.005 * Math.sin(t * 0.8), -0.35 - 0.05 * t, 0, 1, 0);
        const defocus = Motion.keys([[0, 2.6], [0.55, 0.0], [0.85, 0.6], [1.2, 0.15]], t, Ease.inOut) + 0.05 * Math.sin(t * 1.1 + 1) + 2.6 * edge.out;
        const detector = {
            soft: 1.3, defocus, fringe: 0.2 + 0.3 * defocus, fringeWidth: 3,
            noise: { amount: 0.105, power: 0.1, floor: 0.001, size: 5.2, live: 0.6, hold: 2, sharp: 0.75, fine: 0.3 },
            bleed: 2.0, gain: (1 - 0.7 * edge.inn * edge.inn) * (1 - 0.7 * edge.out),
        };
        return { a, detector, stage: [a[1], a[2]] };
    },
    overlay(g, t, env) {
        Micrograph.databar(g, env, { x: env.W - 56 - 180, len: 180, label: '100 nm', caption: 'bacteriophage T4 on E. coli', font: 'VT323', size: 34, colour: '#1c0f24', shadow: 'rgba(255,255,255,0.5)', alpha: Ease.seg(t, 0.3, 0.6) * (1 - Ease.seg(t, 5.55, 5.7)) });
    },
};
