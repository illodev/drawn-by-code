// The dance, measured from the reference: a camera track (a 2D zoom, measured on the rigid
// hat brim) and one key table per cat. A key overrides some pose fields of the key before
// it (the pose accumulates), and every field is interpolated with a Catmull-Rom spline
// through the keys, sampled on twos (15 drawings/s): the reference is smooth 30 fps
// footage, the felt version is stop motion.
//
//   Dance.at(t) → { poses: [p0, p1, p2], zoom: [S, u, v], puddle: [[x, z, r]…] }
const Stage = (() => {
    // a level camera at the kittens' chest height, measured at 2.8 s (zoom 1): the three
    // cats span the frame's width, the hat's top at 0.29 of the height, the feet at 0.71
    const CAM = { cam: [0, 0.41, 3.43], target: [0, 0.41, 0], fov: 0.62 };
    const F = 0.5 / Math.tan(CAM.fov / 2) * 1600;
    const project = ([x, y, z]) => {
        const dz = CAM.cam[2] - z;
        return [450 + (x / dz) * F, 800 - ((y - CAM.cam[1]) / dz) * F, F / dz];
    };
    return { CAM, project, HORIZON: 800 };
})();

const Dance = (() => {
    // camera: the frame zooms about a fixed point (u, v); S = hat width / 229 px
    // (the width at 2.6–11 s). Measured: 177 px at 0 s, 229 at 2.6 s, 211 at 11.3 s,
    // 176 at 11.8–12.3 s, then growing as the cats come forward.
    const ZOOM = [
        [0.0, 0.773], [0.4, 0.79], [0.8, 0.83], [1.0, 0.86], [1.4, 0.886], [1.8, 0.913],
        [2.0, 0.956], [2.2, 0.978], [2.4, 0.995], [2.8, 1.0], [11.3, 1.0], [11.8, 0.77],
        [12.4, 0.8], [13.0, 0.83], [13.4, 0.9], [13.8, 0.97], [14.2, 1.03], [14.6, 1.08],
        [15.0, 1.12], [15.84, 1.16],
    ];
    const ZOOM_AT = [0.632, 0.648]; // the fixed point (fractions of the frame), measured 0–2.6 s

    // one key file per stretch of the dance (keys/segA.js: 0–4.1 s, segB.js: 4.1–9.3 s,
    // segC.js: 9.3–15.84 s), each var DANCE_SEG_X = [cat0 keys, cat1 keys, cat2 keys] with
    // keys [t, {pose fields}]; a stretch's first key is a full pose
    const SEGS = ['A', 'B', 'C'].map((s) => globalThis['DANCE_SEG_' + s]).filter(Boolean);
    const KEYS = [0, 1, 2].map((c) => {
        const k = SEGS.flatMap((s) => s[c]).sort((a, b) => a[0] - b[0]);
        return k.length ? k : [[0, {}]];
    });

    const FIELDS = ['x', 'z', 'bob', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'head.0', 'head.1', 'head.2',
        'armL.0', 'armL.1', 'armL.2', 'armL.3', 'armR.0', 'armR.1', 'armR.2', 'armR.3',
        'legL.0', 'legL.1', 'legR.0', 'legR.1', 'tail.0', 'tail.1', 'tail.2', 'mouth'];
    const get = (p, f) => { const [a, i] = f.split('.'); return i === undefined ? p[a] : p[a][+i]; };
    function set(p, f, v) { const [a, i] = f.split('.'); if (i === undefined) p[a] = v; else p[a][+i] = v; }
    const clone = (p) => JSON.parse(JSON.stringify(p));
    // accumulate the keys into full poses
    function resolve(keys) {
        let cur = clone(Cats.REST);
        return keys.map(([t, o]) => {
            cur = clone(cur);
            for (const [k, v] of Object.entries(o)) cur[k] = Array.isArray(v) ? v.map((x, i) => (x ?? cur[k][i])) : v;
            return [t, cur];
        });
    }
    const cr = (p0, p1, p2, p3, u) => 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
    function sample(keys, t) {
        if (t <= keys[0][0]) return keys[0][1];
        const n = keys.length;
        if (t >= keys[n - 1][0]) return keys[n - 1][1];
        let i = 0;
        while (keys[i + 1][0] <= t) i++;
        const u = (t - keys[i][0]) / (keys[i + 1][0] - keys[i][0]);
        const K = (j) => keys[Math.max(0, Math.min(n - 1, j))][1];
        const out = clone(K(i));
        for (const f of FIELDS) set(out, f, cr(get(K(i - 1), f), get(K(i), f), get(K(i + 1), f), get(K(i + 2), f), u));
        return out;
    }
    const scalar = (tab, t) => {
        if (t <= tab[0][0]) return tab[0][1];
        if (t >= tab[tab.length - 1][0]) return tab[tab.length - 1][1];
        let i = 0;
        while (tab[i + 1][0] <= t) i++;
        const n = tab.length, V = (j) => tab[Math.max(0, Math.min(n - 1, j))][1];
        const u = (t - tab[i][0]) / (tab[i + 1][0] - tab[i][0]);
        return cr(V(i - 1), V(i), V(i + 1), V(i + 2), u);
    };
    let RES = null;
    // the fitted poses (private/fit-poses.js, optional: data read off the reference), one per
    // drawing; the hand keys fill whatever has not been fitted
    const FIT = globalThis.DANCE_FIT ?? {}; // fit-*-poses.js files merge into it
    function at(t) {
        if (!RES) RES = KEYS.map(resolve);
        const d = Math.floor(t * 15 + 1e-6), tq = d / 15;
        const poses = FIT[d] ? FIT[d].map((p) => ({ ...clone(Cats.REST), ...p })) : RES.map((k) => sample(k, tq));
        // depth and lift are smoothed over ±0.2 s: keyed from measured sizes they jitter key
        // to key (a cat pulsing towards the camera), and stretches keyed apart meet smoothly
        if (!FIT[d]) RES.forEach((k, c) => {
            let z = 0, b = 0;
            for (let i = -3; i <= 3; i++) { const p = sample(k, tq + i / 15); z += p.z; b += p.bob; }
            poses[c].z = z / 7;
            // never below the floor: a negative lift sank the feet (the frame sits lower than
            // the camera model; that is the camera's to fix, not the cat's)
            poses[c].bob = Math.max(-0.02, b / 7);
        });
        return { tq, poses, zoom: [scalar(ZOOM, tq), ...ZOOM_AT] };
    }
    return { at, ZOOM, ZOOM_AT, resolve };
})();
