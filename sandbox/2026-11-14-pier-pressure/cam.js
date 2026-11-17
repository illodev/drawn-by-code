// pier-pressure · the film's camera. One pinhole camera for the set and the cast, so every
// size and every vanishing line agrees: things are placed in metres in the world and projected,
// never sized by eye. Global: Cam. Load before set.js.
//
// World: X to the right, Y up (0 = the quay's surface), Z forwards from the camera, in metres.
// The camera stands 0.6 m above the quay (a low, wide-angle camera, as the genre's group shots),
// looks level along +Z, and its horizon is the frame's line y = 552.
//
//   Cam.pt([X, Y, Z]) → [x, y]            a world point on screen (logical units, 1600 × 900)
//   Cam.scale(Z) → units per metre at depth Z;  Cam.scaleAtY(y) for a point standing on the quay
//   Cam.ground(x, y) → [X, 0, Z]           the quay point under a screen point below the horizon
//   Cam.poly(pts3) → screen polygon, clipped at the near plane (use it for anything that may
//                    come close to or pass behind the camera: the ground, long walls, a deck)
//   Cam.box(o, size, yaw) → the faces of a box seen from the camera, far to near:
//                    [{ name: 'front'|'back'|'left'|'right'|'top'|'bottom', pts: screen quad, pts3 }]
//                    o: its base's centre [X, Y, Z]; size: [w, h, d]; yaw: radians about Y
//   Cam.circle(c, r, n) → a horizontal circle (a table top, a coil of rope, a wheel lying flat)
//   Cam.ring(c, r, axis, n) → a circle in a vertical plane: axis 'x' or 'z' is its normal
//   Cam.HEIGHT: how tall the cast is, in metres: size a character with
//       s = Cam.scale(Z) * Cam.HEIGHT.kit / (its drawing's height in its own units)
const Cam = (() => {
    const F = 1200, CX = 800, H0 = 552, EYE = 0.6, NEAR = 0.35;
    const HEIGHT = { kit: 1.4, pip: 1.12, hoagie: 1.32, milo: 1.62, dot: 1.8, captain: 0.46 };
    const pt = ([X, Y, Z]) => [CX + (F * X) / Z, H0 - (F * (Y - EYE)) / Z];
    const scale = (Z) => F / Z;
    const scaleAtY = (y) => (y - H0) / EYE;
    const ground = (x, y) => {
        const Z = (F * EYE) / (y - H0);
        return [((x - CX) * Z) / F, 0, Z];
    };
    // clip a 3D polygon against Z = NEAR (Sutherland–Hodgman), then project
    function poly(pts3) {
        const out = [];
        for (let i = 0; i < pts3.length; i++) {
            const a = pts3[i], b = pts3[(i + 1) % pts3.length];
            const ia = a[2] >= NEAR, ib = b[2] >= NEAR;
            if (ia) out.push(a);
            if (ia !== ib) {
                const t = (NEAR - a[2]) / (b[2] - a[2]);
                out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]);
            }
        }
        return out.map(pt);
    }
    const rotY = ([x, y, z], a) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
    function box(o, [w, h, d], yaw = 0) {
        const c = (x, y, z) => {
            const p = rotY([x, y, z], yaw);
            return [o[0] + p[0], o[1] + p[1], o[2] + p[2]];
        };
        const x0 = -w / 2, x1 = w / 2, z0 = -d / 2, z1 = d / 2;
        // each face: its corners (as seen from outside, starting top left) and its outward normal
        const faces = [
            ['front', [c(x0, h, z0), c(x1, h, z0), c(x1, 0, z0), c(x0, 0, z0)], [0, 0, -1]],
            ['back', [c(x1, h, z1), c(x0, h, z1), c(x0, 0, z1), c(x1, 0, z1)], [0, 0, 1]],
            ['left', [c(x0, h, z1), c(x0, h, z0), c(x0, 0, z0), c(x0, 0, z1)], [-1, 0, 0]],
            ['right', [c(x1, h, z0), c(x1, h, z1), c(x1, 0, z1), c(x1, 0, z0)], [1, 0, 0]],
            ['top', [c(x0, h, z1), c(x1, h, z1), c(x1, h, z0), c(x0, h, z0)], [0, 1, 0]],
            ['bottom', [c(x0, 0, z0), c(x1, 0, z0), c(x1, 0, z1), c(x0, 0, z1)], [0, -1, 0]],
        ];
        const seen = [];
        for (const [name, pts3, n0] of faces) {
            const n = rotY(n0, yaw);
            const m = pts3.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4, s[2] + p[2] / 4], [0, 0, 0]);
            // seen when its normal points back towards the camera at (0, EYE, 0)
            const facing = n[0] * (0 - m[0]) + n[1] * (EYE - m[1]) + n[2] * (0 - m[2]);
            if (facing > 1e-6) seen.push({ name, pts3, pts: poly(pts3), depth: Math.hypot(m[0], m[1] - EYE, m[2]) });
        }
        return seen.sort((a, b) => b.depth - a.depth);
    }
    const circle = (c, r, n = 28) => poly(Array.from({ length: n }, (_, i) => [c[0] + Math.cos((i / n) * Math.PI * 2) * r, c[1], c[2] + Math.sin((i / n) * Math.PI * 2) * r]));
    const ring = (c, r, axis = 'z', n = 24) => poly(Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2, u = Math.cos(a) * r, v = Math.sin(a) * r;
        return axis === 'z' ? [c[0] + u, c[1] + v, c[2]] : [c[0], c[1] + v, c[2] + u];
    }));
    return { F, CX, H0, EYE, NEAR, HEIGHT, pt, scale, scaleAtY, ground, poly, box, circle, ring, rotY };
})();
