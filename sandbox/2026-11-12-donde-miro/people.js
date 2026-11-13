// The people of the present, as he sees them: out of focus, a few wide strokes each,
// placed by hand per drawing (Oil.marks). His granddaughter in a red coat, the one
// saturated thing in the grey; passers-by in a hurry across the foreground.
const People = (() => {
    const UP = Math.PI / 2;
    // Out of focus: every stroke first as a wider, longer one halfway to the grey of the
    // square, then itself. Edges melt, the figure keeps its colour only at its core.
    const GREY = [138, 135, 130];
    const mixTo = (c, k) => { const h = Oil.hex(c); return [h[0] + (GREY[0] - h[0]) * k, h[1] + (GREY[1] - h[1]) * k, h[2] + (GREY[2] - h[2]) * k]; };
    const soft = (m) => [
        ...m.filter((q) => !q.kind).map((q) => ({ ...q, w: q.w * 1.7, len: q.len * 1.3 + q.w * 0.5, color: mixTo(q.color, 0.62), color2: mixTo(q.color2 ?? q.color, 0.7) })),
        ...m.map((q) => ({ ...q, color: mixTo(q.color, 0.12), color2: mixTo(q.color2 ?? q.color, 0.3) })),
    ];
    // feet at (x, y), height h; wave: 0 = arm down, 1 = up and waving; d: drawing index;
    // built: 0..1 of her strokes laid so far; walking: her step bobs
    function girl(x, y, h, wave, d, built = 1, walking = false) {
        const bob = walking ? Math.abs(Math.sin(d * 0.9)) * 0.012 * h : 0, yy = y - bob, sw = Math.sin(d * 1.3) * 0.34;
        const red = '#b8382c', redD = '#93302a', redL = '#c64a38', skin = '#c9a48c';
        const m = [
            { x, y: y + 0.03 * h, ang: 0, len: 0.42 * h, w: 0.06 * h, color: '#5c5a59' }, // her dark on the wet paving
            { x: x - 0.065 * h, y: yy - 0.12 * h, ang: UP, len: 0.26 * h, w: 0.085 * h, color: '#2f3340' },
            { x: x + 0.065 * h, y: yy - 0.12 * h, ang: UP, len: 0.26 * h, w: 0.085 * h, color: '#252833' },
            { x: x - 0.09 * h, y: yy - 0.47 * h, ang: UP - 0.05, len: 0.5 * h, w: 0.2 * h, color: red, color2: redL },
            { x: x + 0.09 * h, y: yy - 0.47 * h, ang: UP + 0.05, len: 0.5 * h, w: 0.2 * h, color: redD, color2: red },
            { x, y: yy - 0.5 * h, ang: UP, len: 0.44 * h, w: 0.18 * h, color: redL, color2: red },
            { x, y: yy - 0.26 * h, ang: 0, len: 0.44 * h, w: 0.1 * h, color: '#a8332a', color2: redD },
            { x: x + 0.16 * h, y: yy - 0.52 * h, ang: UP + 0.16, len: 0.3 * h, w: 0.07 * h, color: redD },
            { x, y: yy - 0.735 * h, ang: 0.08, len: 0.27 * h, w: 0.07 * h, color: '#d6cfc0', color2: '#b9b4ac' },
            { x: x - 0.085 * h, y: yy - 0.83 * h, ang: UP, len: 0.2 * h, w: 0.055 * h, color: '#4a3830' },
            { x: x + 0.09 * h, y: yy - 0.83 * h, ang: UP, len: 0.2 * h, w: 0.055 * h, color: '#3d2e28' },
            { x, y: yy - 0.86 * h, ang: UP, len: 0.17 * h, w: 0.14 * h, color: skin, color2: '#b8917c' },
            { x: x + 0.005 * h, y: yy - 0.945 * h, ang: 0, len: 0.21 * h, w: 0.09 * h, color: '#4a3830', color2: '#5a4638' },
        ];
        // the other arm: down along the coat, or up and waving
        const a = wave > 0.05 ? -UP - 0.55 + sw * wave + (1 - wave) * 2.2 : UP - 0.16;
        const sx = x - 0.14 * h, sy = yy - 0.67 * h;
        m.push({ x: sx + Math.cos(a) * 0.15 * h, y: sy + Math.sin(a) * 0.15 * h, ang: a, len: 0.31 * h, w: 0.07 * h, color: red, color2: redL });
        m.push({ x: sx + Math.cos(a) * 0.34 * h, y: sy + Math.sin(a) * 0.34 * h, ang: a, len: 0.08 * h, w: 0.065 * h, color: skin });
        return soft(m.slice(0, Math.max(0, Math.round(m.length * built))));
    }
    // somebody crossing the foreground: dir 1 walks right. An umbrella if `umb`.
    function passer(x, y, h, dir, d, umb, coat = '#3f424c') {
        const st = Math.sin(d * 1.05), bob = Math.abs(st) * 0.014 * h, yy = y - bob;
        const m = [
            { x: x + st * 0.1 * h, y: yy - 0.12 * h, ang: UP + st * 0.32, len: 0.3 * h, w: 0.08 * h, color: '#2a2c33' },
            { x: x - st * 0.1 * h, y: yy - 0.12 * h, ang: UP - st * 0.32, len: 0.3 * h, w: 0.08 * h, color: '#33353d' },
            { x: x - 0.07 * h, y: yy - 0.5 * h, ang: UP + 0.06 * dir, len: 0.52 * h, w: 0.17 * h, color: coat, color2: '#55586a' },
            { x: x + 0.07 * h, y: yy - 0.5 * h, ang: UP + 0.06 * dir, len: 0.52 * h, w: 0.17 * h, color: '#34363f', color2: coat },
            { x: x + 0.02 * dir * h, y: yy - 0.5 * h, ang: UP - st * 0.3, len: 0.34 * h, w: 0.065 * h, color: '#2f3139' },
            { x: x + 0.03 * dir * h, y: yy - 0.86 * h, ang: UP, len: 0.15 * h, w: 0.12 * h, color: '#9a8478', color2: '#7f6c62' },
            { x: x - 0.01 * dir * h, y: yy - 0.93 * h, ang: 0, len: 0.17 * h, w: 0.075 * h, color: '#3a3430' },
        ];
        if (umb) {
            const ux = x + 0.1 * dir * h, uy = yy - 1.12 * h;
            m.push({ x: ux - 0.2 * h, y: uy + 0.05 * h, ang: -0.42, len: 0.34 * h, w: 0.13 * h, color: '#34495a', color2: '#4a6074' });
            m.push({ x: ux + 0.2 * h, y: uy + 0.05 * h, ang: 0.42, len: 0.34 * h, w: 0.13 * h, color: '#2a3c4c', color2: '#34495a' });
            m.push({ x: ux, y: uy - 0.02 * h, ang: 0, len: 0.36 * h, w: 0.14 * h, color: '#3d5468', color2: '#566e84' });
        }
        return soft(m);
    }
    // A car going by, nose to the left: a dark body, glass, two wheels, lights. Out of focus.
    function car(x, y, s) {
        return soft([
            { x: x + 150 * s, y: y + 8 * s, ang: 0, len: 330 * s, w: 16 * s, color: '#4a4848' },
            { x: x + 150 * s, y: y - 42 * s, ang: 0, len: 320 * s, w: 60 * s, color: '#48505a', color2: '#5c6672' },
            { x: x + 60 * s, y: y - 50 * s, ang: 0, len: 130 * s, w: 44 * s, color: '#525b66' },
            { x: x + 170 * s, y: y - 96 * s, ang: 0, len: 190 * s, w: 46 * s, color: '#3a424b', color2: '#262c33' },
            { x: x + 170 * s, y: y - 118 * s, ang: 0, len: 170 * s, w: 12 * s, color: '#a9b0b6' },
            { x: x + 70 * s, y: y - 6 * s, ang: 0, len: 58 * s, w: 52 * s, color: '#232324' },
            { x: x + 246 * s, y: y - 6 * s, ang: 0, len: 58 * s, w: 52 * s, color: '#232324' },
            { x: x + 4 * s, y: y - 50 * s, ang: 1.57, len: 22 * s, w: 12 * s, color: '#e6e2c8' },
            { x: x + 306 * s, y: y - 56 * s, ang: 1.57, len: 22 * s, w: 10 * s, color: '#a8322c' },
        ]);
    }
    return { girl, passer, car };
})();
