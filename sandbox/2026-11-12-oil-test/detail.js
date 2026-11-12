// The detail pass over the memory («then»): every element of the square taken apart into
// its real pieces, down to what the finest brush (1.5 units) can hold. Each function
// paints on top of what Plaza laid for that element, in the same coordinates.
// PlazaDetail.live(d) returns what moves inside the memory, as hand-placed strokes.
const PlazaDetail = (() => {
    const poly = (g, pts) => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.fill();
    };
    const ell = (g, x, y, a, b, rot = 0, a0 = 0, a1 = 7) => {
        g.beginPath();
        g.ellipse(x, y, a, b, rot, a0, a1);
        g.fill();
    };
    const arc = (cx, cy, rx, ry, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(a0 + ((a1 - a0) * i) / n) * rx, cy + Math.sin(a0 + ((a1 - a0) * i) / n) * ry]);
    const FINE = 5, SMALL = 4;

    // --- the village behind the tree ---------------------------------------------------
    function village(st) {
        const rn = Motion.rng('village');
        const roofs = [[-236, -78, 452, 418], [-96, 118, 440, 402], [179, 338, 456, 424], [324, 488, 432, 396], [474, 632, 466, 438]];
        // rows of curved tiles down every roof, a lighter ridge, a chimney
        roofs.forEach(([x0, x1, y, yr], i) => {
            for (let k = 1; k < 4; k++) {
                const yy = yr + ((y - yr) * k) / 4, inset = 8 * (1 - k / 4);
                st.line([[x0 + inset, yy], [x1 - inset, yy]], k % 2 ? '#a85a38' : '#e09a6a', 2.2, { level: FINE });
            }
            for (let x = x0 + 14; x < x1 - 10; x += 13) st.line([[x + 3, yr + 2], [x, y - 2]], '#b4633f', 1.6, { level: FINE });
            st.line([[x0 + 8, yr], [x1 - 8, yr]], '#f0b98c', 3, { level: SMALL });
            if (i === 2 || i === 3) {
                const cx = x0 + (x1 - x0) * (i === 2 ? 0.3 : 0.7);
                st.paint({ dir: 1.5 }, (g) => {
                    g.fillStyle = '#eadfc6';
                    g.fillRect(cx - 7, yr - 20, 14, 24);
                    g.fillStyle = '#aba0c2';
                    g.fillRect(cx + 2, yr - 20, 5, 24);
                    g.fillStyle = '#b8603c';
                    g.fillRect(cx - 9, yr - 24, 18, 5);
                });
            }
        });
        // television aerials: it is 1974
        [[250, 424], [420, 396]].forEach(([x, y]) => {
            st.line([[x, y], [x, y - 38]], '#4a4a52', 1.6, { level: FINE });
            [[-30, 12], [-22, 9], [-14, 6]].forEach(([dy, w]) => st.line([[x - w, y + dy], [x + w, y + dy]], '#4a4a52', 1.5, { level: FINE }));
        });
        // windows: frame, shutters, a sill with a pot; doors with a step
        const wins = [[-190, 490], [-140, 490], [-40, 480], [10, 480], [62, 480], [222, 490], [282, 490], [372, 464], [432, 464], [520, 500], [576, 500]];
        st.paint({ dir: 1.55 }, (g) => {
            wins.forEach(([x, y], i) => {
                const w = 22 + (i > 4 ? 2 : 0), h = 34 + (i > 4 ? 2 : 0);
                g.fillStyle = '#fbf4de';
                g.fillRect(x - 3, y - 3, w + 6, h + 7);
                g.fillStyle = '#2c3a4c';
                g.fillRect(x, y, w, h);
                g.fillStyle = i % 3 ? '#e9e5da' : '#55687c'; // a curtain, or the room's dark
                g.fillRect(x, y, w * 0.45, h);
                g.fillStyle = ['#3f7d6e', '#4f79a8', '#8a5a3c'][i % 3]; // an open shutter
                g.fillRect(x + w, y - 1, 7, h + 2);
                g.fillStyle = '#a79dc2';
                g.fillRect(x - 3, y + h + 4, w + 9, 3);
                if (i % 2 === 0) {
                    g.fillStyle = '#b8603a';
                    g.fillRect(x + 3, y + h - 3, 9, 7);
                    g.fillStyle = '#d83a34';
                    ell(g, x + 6, y + h - 6, 4, 3);
                    g.fillStyle = '#3f8a45';
                    ell(g, x + 11, y + h - 5, 4, 3);
                }
            });
            [[30, 548, '#3f7d6e'], [244, 552, '#3f7d6e'], [396, 548, '#9a4f33']].forEach(([x, y, c]) => {
                g.fillStyle = '#fbf4de';
                g.fillRect(x - 4, y - 4, 38, GROUND - y + 4);
                g.fillStyle = c;
                g.fillRect(x, y, 30, GROUND - y);
                g.fillStyle = '#243b3a';
                g.fillRect(x + 14, y, 2, GROUND - y);
                g.fillStyle = '#d9cfb8';
                g.fillRect(x - 6, GROUND - 5, 42, 5);
            });
        });
        // the belfry: an arch with its bell, a stork's nest on the roof and the stork on it
        st.paint({ dir: 1.5 }, (g) => {
            g.fillStyle = '#2c3442';
            g.beginPath();
            g.moveTo(146, 444); g.lineTo(146, 410); g.quadraticCurveTo(158, 394, 170, 410); g.lineTo(170, 444);
            g.fill();
            g.fillStyle = '#a8843a';
            poly(g, [[153, 434], [163, 434], [161, 418], [155, 418]]);
            g.fillStyle = '#e0c060';
            g.fillRect(155, 420, 2, 12);
            g.fillStyle = '#d9cdb0'; // a cornice under the roof
            g.fillRect(126, 370, 64, 5);
        });
        st.paint({ dab: 0.8 }, (g) => {
            g.fillStyle = '#6a5238';
            ell(g, 158, 318, 22, 7);
            g.fillStyle = '#8f7350';
            ell(g, 152, 315, 14, 4);
        });
        for (let i = 0; i < 9; i++) st.line([[138 + rn() * 40, 316 + rn() * 5], [134 + rn() * 48, 312 + rn() * 8]], i % 2 ? '#4f3c28' : '#a08660', 1.5, { level: FINE });
        st.line([[156, 312], [155, 298]], '#c8402c', 1.6, { level: FINE });
        st.line([[162, 312], [162, 298]], '#c8402c', 1.6, { level: FINE });
        st.paint({ dir: 0.3 }, (g) => {
            g.fillStyle = '#f6f1e4';
            ell(g, 160, 290, 13, 7.5, -0.25);
            g.fillStyle = '#1f2026';
            poly(g, [[160, 288], [176, 292], [173, 298], [158, 295]]);
            g.fillStyle = '#f6f1e4';
            poly(g, [[150, 288], [147, 270], [152, 269], [156, 286]]);
            ell(g, 149, 268, 4.5, 4);
        });
        st.line([[146, 268], [133, 271]], '#d2452c', 2, { level: FINE });
        // washing hung between two houses
        const line = arc(410, 380, 90, 62, Math.PI * 0.86, Math.PI * 0.14, 10);
        st.line(line, '#6b6a70', 1.5, { level: FINE });
        st.paint({ dir: 1.5 }, (g) => {
            [[352, 30, 34, '#fbf7ea'], [386, 22, 30, '#5f86c0'], [414, 14, 22, '#e8c04a'], [432, 16, 26, '#d8563e'], [452, 24, 30, '#fbf7ea']].forEach(([x, w, h, c], i) => {
                const y = 380 + 62 * Math.sin(Math.acos(Math.max(-1, Math.min(1, (x + w / 2 - 410) / 90)))) - 2;
                g.fillStyle = c;
                poly(g, [[x, y], [x + w, y + (i - 2) * 0.6], [x + w - 2, y + h], [x + 2, y + h - 2]]);
                g.fillStyle = 'rgba(120, 108, 160, 0.45)';
                poly(g, [[x + w * 0.62, y + 1], [x + w, y + 1], [x + w - 2, y + h], [x + w * 0.7, y + h - 1]]);
            });
        });
        // the garden wall: a coping of tiles, a green gate, a dog asleep in its shade
        st.line([[450, 536], [626, 536]], '#c9744a', 4, { level: SMALL });
        st.line([[450, 532], [626, 532]], '#e8a070', 1.8, { level: FINE });
        st.paint({ dir: 1.5 }, (g) => {
            g.fillStyle = '#3f6f52';
            g.fillRect(466, 548, 30, 52);
            g.fillStyle = '#2a4f3a';
            [470, 478, 486].forEach((x) => g.fillRect(x, 552, 3, 46));
        });
        st.paint({ dir: 0.1 }, (g) => {
            g.fillStyle = '#8f84aa';
            ell(g, 560, 602, 44, 6);
            g.fillStyle = '#c99a5e';
            ell(g, 556, 596, 18, 7);
            ell(g, 574, 598, 7, 5);
            g.fillStyle = '#9a6f3c';
            ell(g, 548, 598, 9, 4);
            poly(g, [[577, 594], [581, 590], [582, 596]]);
            g.fillStyle = '#2a2020';
            ell(g, 580, 600, 1.6, 1.3);
        });
    }
    const GROUND = 600;

    // --- the plane tree ----------------------------------------------------------------
    function tree(st) {
        const rn = Motion.rng('tree-detail');
        // the pit it grows from: a ring of stones round dark earth
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = '#6f5a4a';
            ell(g, 362, 658, 62, 13);
            g.fillStyle = '#8a7260';
            ell(g, 350, 656, 30, 6);
        });
        arc(362, 658, 64, 14, 0, Math.PI * 2, 20).forEach(([x, y], i) => {
            st.paint({ dir: 0.02 }, (g) => {
                g.fillStyle = i % 2 ? '#d9cdb0' : '#bfb294';
                ell(g, x, y, 7, 3.4);
                g.fillStyle = '#9d92b0';
                ell(g, x + 1.5, y + 1.8, 6, 1.6);
            });
        });
        // somebody cut a heart into the bark
        st.line([[364, 512], [357, 503], [357, 496], [361, 494], [364, 498], [367, 494], [371, 496], [371, 503], [364, 512]], '#ded5ae', 1.6, { level: FINE });
        st.line([[352, 510], [376, 498]], '#ded5ae', 1.5, { level: FINE });
        // leaves one by one at the edge of the crown, where they show against the sky
        st.paint({ dab: 1 }, (g) => {
            for (let i = 0; i < 90; i++) {
                const a = rn() * Math.PI * 2, e = [[200, 150, 150, 110], [360, 90, 190, 110], [520, 150, 140, 110], [300, 230, 150, 70], [450, 240, 130, 60], [585, 235, 70, 50]][i % 6];
                const x = e[0] + Math.cos(a) * e[2] * (0.92 + rn() * 0.16), y = e[1] + Math.sin(a) * e[3] * (0.92 + rn() * 0.16), r = rn() * 3;
                const c = ['#3f7a45', '#5f9a52', '#86b65a', '#2d5a45', '#a8c868'][Math.floor(rn() * 5)];
                if (x > 118 && x < 196 && y > 236) continue; // not across the stork
                g.fillStyle = c;
                ell(g, x, y, 6.5, 3.6, r);
                ell(g, x + Math.cos(r + 0.9) * 4, y + Math.sin(r + 0.9) * 4, 4.5, 2.6, r + 0.9);
                ell(g, x + Math.cos(r - 0.9) * 4, y + Math.sin(r - 0.9) * 4, 4.5, 2.6, r - 0.9);
            }
        });
        // its seed balls, each hanging on a thread
        for (let i = 0; i < 16; i++) {
            const x = 130 + rn() * 470, y = 262 + rn() * 46 + (Math.abs(x - 360) < 120 ? 28 : 0), l = 10 + rn() * 9;
            st.line([[x, y - l], [x + 1, y]], '#6a6a45', 1.5, { level: FINE });
            st.paint({ dab: 1 }, (g) => {
                g.fillStyle = '#8a7440';
                ell(g, x + 1, y + 3, 3.6, 3.6);
                g.fillStyle = '#b9a060';
                ell(g, x, y + 2, 1.7, 1.7);
            });
        }
        // two sparrows on the lowest bough
        [[318, 268, 1], [408, 258, -1]].forEach(([x, y, f]) => {
            st.paint({ dir: 0.3 }, (g) => {
                g.fillStyle = '#7a5a40';
                ell(g, x, y, 6.5, 4.6, -0.3 * f);
                g.fillStyle = '#c9b89a';
                ell(g, x + 1.5 * f, y + 1.8, 4, 2.6);
                g.fillStyle = '#5a3f2c';
                ell(g, x + 5 * f, y - 3.5, 3.4, 3);
                poly(g, [[x - 6 * f, y], [x - 12 * f, y + 2], [x - 6 * f, y + 3]]);
            });
            st.line([[x + 8 * f, y - 3.5], [x + 10.5 * f, y - 3]], '#3a3030', 1.5, { level: FINE });
        });
    }

    // --- the bicycle against the trunk --------------------------------------------------
    function bicycle(st, x, y) {
        const ink = '#22232a', blue = '#1f4f8f', blueL = '#5f8fd0', steel = '#aab0b8', r = 44;
        const rear = [x - 62, y], front = [x + 62, y], seat = [x - 30, y - 62], head = [x + 38, y - 56], bars = [x + 44, y - 72], crank = [x - 6, y + 2];
        // its shadow, wheels and all
        st.paint({ dir: 0.3 }, (g) => {
            g.fillStyle = '#857b9f';
            poly(g, [[x - 70, y + r], [x + 100, y + r], [x + 196, y + r + 26], [x + 20, y + r + 26]]);
            g.fillStyle = '#e0cb98';
            ell(g, x + 40, y + r + 14, 30, 5);
            ell(g, x + 136, y + r + 15, 28, 5);
        });
        [rear, front].forEach(([cx, cy], w) => {
            st.line(arc(cx, cy, r, r, 0, Math.PI * 2, 26), ink, 4.2, { level: SMALL });
            st.line(arc(cx, cy, r - 2.2, r - 2.2, Math.PI * 1.05, Math.PI * 1.7, 8), '#e8dcc0', 1.6, { level: FINE }); // cream tyre walls catching the sun
            st.line(arc(cx, cy, r - 5, r - 5, 0, Math.PI * 2, 24), steel, 1.6, { level: FINE });
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * Math.PI * 2 + w * 0.2;
                st.line([[cx + Math.cos(a) * 4, cy + Math.sin(a) * 4], [cx + Math.cos(a + 0.12) * (r - 6), cy + Math.sin(a + 0.12) * (r - 6)]], i % 2 ? '#8c8b92' : '#c9ccd2', 1.5, { level: FINE });
            }
            st.paint({ dir: 0 }, (g) => {
                g.fillStyle = steel;
                ell(g, cx, cy, 4.5, 4.5);
                g.fillStyle = ink;
                ell(g, cx, cy, 1.8, 1.8);
            });
            // mudguard: a blue arc over the top of the wheel, a stay down to the hub
            st.line(arc(cx, cy, r + 4.5, r + 4.5, Math.PI * (w ? 1.15 : 0.95), Math.PI * (w ? 1.95 : 1.8), 12), blue, 3.2, { level: SMALL });
            st.line(arc(cx, cy, r + 5.5, r + 5.5, Math.PI * 1.25, Math.PI * 1.6, 6), blueL, 1.5, { level: FINE });
            st.line([[cx + (w ? 1 : -1) * (r + 3), cy - 12], [cx, cy]], steel, 1.5, { level: FINE });
        });
        // frame: every tube with a light along its top
        [[rear, seat], [seat, crank], [crank, rear], [seat, head], [crank, head], [head, [x + 60, y - 2]], [head, bars]].forEach(([a, b]) => {
            st.line([a, b], blue, 4.4, { level: SMALL });
            st.line([[a[0], a[1] - 1.4], [b[0], b[1] - 1.4]], blueL, 1.5, { level: FINE });
        });
        // chain guard, chain, crank and pedals
        st.paint({ dir: 0.05 }, (g) => {
            g.fillStyle = '#17407a';
            poly(g, [[x - 60, y - 6], [x - 4, y - 9], [x + 6, y - 2], [x + 4, y + 9], [x - 60, y + 5]]);
            g.fillStyle = steel;
            ell(g, crank[0], crank[1], 8, 8);
            g.fillStyle = ink;
            ell(g, crank[0], crank[1], 3, 3);
        });
        st.line([[x - 58, y - 4], [x - 6, y - 7]], blueL, 1.5, { level: FINE });
        st.line([[crank[0] - 10, crank[1] - 11], [crank[0] + 10, crank[1] + 11]], steel, 2.6, { level: SMALL });
        st.line([[crank[0] - 16, crank[1] - 12], [crank[0] - 5, crank[1] - 11]], ink, 3.4, { level: SMALL });
        st.line([[crank[0] + 5, crank[1] + 12], [crank[0] + 16, crank[1] + 11]], ink, 3.4, { level: SMALL });
        // saddle on its springs, a rack with a parcel tied on
        st.paint({ dir: 0.05 }, (g) => {
            g.fillStyle = '#5a341f';
            g.beginPath();
            g.moveTo(seat[0] - 17, seat[1] - 5); g.quadraticCurveTo(seat[0] - 2, seat[1] - 12, seat[0] + 15, seat[1] - 7); g.lineTo(seat[0] + 13, seat[1] - 2); g.lineTo(seat[0] - 15, seat[1]);
            g.fill();
            g.fillStyle = '#9a6238';
            poly(g, [[seat[0] - 12, seat[1] - 7], [seat[0] + 10, seat[1] - 8.5], [seat[0] + 8, seat[1] - 6.5], [seat[0] - 10, seat[1] - 5]]);
            g.fillStyle = '#c9a56a'; // the parcel
            g.fillRect(x - 94, y - 60, 30, 14);
            g.fillStyle = '#a27f48';
            g.fillRect(x - 74, y - 60, 10, 14);
        });
        st.line([[seat[0] - 12, seat[1]], [seat[0] - 12, seat[1] + 5]], steel, 1.6, { level: FINE });
        st.line([[x - 98, y - 45], [x - 58, y - 45]], ink, 2.2, { level: FINE });
        st.line([[x - 96, y - 45], [x - 66, y - 4]], ink, 1.6, { level: FINE });
        st.line([[x - 80, y - 61], [x - 80, y - 46]], '#7a4a2a', 1.5, { level: FINE });
        // handlebars with grips, a brake lever and its cable, a bell, a lamp
        st.line([bars, [bars[0] + 14, bars[1] - 8], [bars[0] + 22, bars[1] + 2]], steel, 3, { level: SMALL });
        st.line([[bars[0] + 17, bars[1] - 5], [bars[0] + 23, bars[1] + 3]], ink, 4.4, { level: SMALL });
        st.line([[bars[0] + 12, bars[1] - 5], [bars[0] + 22, bars[1] + 9]], steel, 1.5, { level: FINE });
        st.line([[bars[0] + 8, bars[1] - 3], [head[0] + 4, head[1] + 16], [x + 58, y - 30]], ink, 1.5, { level: FINE });
        st.paint({ dir: 0 }, (g) => {
            g.fillStyle = '#d8dce0';
            ell(g, bars[0] + 4, bars[1] - 7, 4.2, 3.4);
            g.fillStyle = '#ffffff';
            ell(g, bars[0] + 3, bars[1] - 8.5, 1.6, 1.2);
            g.fillStyle = '#c9ccd2';
            poly(g, [[head[0] + 6, head[1] + 2], [head[0] + 17, head[1] - 1], [head[0] + 17, head[1] + 10], [head[0] + 6, head[1] + 8]]);
            g.fillStyle = '#f3e08a';
            ell(g, head[0] + 17, head[1] + 4.5, 2.4, 5);
            g.fillStyle = '#c8322c'; // rear reflector
            ell(g, x - 108, y - 22, 3, 4);
        });
    }

    // --- the ground ---------------------------------------------------------------------
    function ground(st) {
        const rn = Motion.rng('ground-detail');
        // flagstones are not one colour, and their joints hold shade and weeds
        st.paint({ dir: 0.02 }, (g) => {
            g.globalAlpha = 0.5;
            for (let i = 0; i < 40; i++) {
                const y = 612 + rn() * rn() * 300, s = (y - 560) / 340;
                g.fillStyle = ['#e9d6a8', '#c9ae7c', '#dcc08e', '#d4c3a4', '#e4c998'][i % 5];
                const x = -200 + rn() * 2000, w = 90 * (0.5 + s), h = 26 * (0.4 + s);
                poly(g, [[x, y], [x + w, y], [x + w + 6, y + h], [x + 4, y + h]]);
            }
            g.globalAlpha = 1;
        });
        for (let i = 0; i < 26; i++) {
            const x = -150 + rn() * 1900, y = 615 + rn() * 290;
            st.paint({ dab: 1 }, (g) => {
                g.fillStyle = i % 3 ? '#7f9a52' : '#a8873a';
                ell(g, x, y, 3.4, 1.6, rn());
            });
        }
        // the gutter along the foot of the wall, a drain
        st.line([[622, 606], [1830, 606]], '#a8946a', 2.4, { level: FINE });
        st.line([[622, 610], [1830, 610]], '#f1e2b8', 1.6, { level: FINE });
        st.paint({ dir: 0 }, (g) => {
            g.fillStyle = '#8a7d68';
            g.fillRect(1180, 607, 34, 9);
            g.fillStyle = '#5a5046';
            [1184, 1191, 1198, 1205].forEach((x) => g.fillRect(x, 608.5, 3, 6));
        });
        // sparrows after the crumbs by the crates
        [[1060, 626, 1], [1088, 634, -1], [1120, 624, 1]].forEach(([x, y, f]) => {
            st.paint({ dir: 0.2 }, (g) => {
                g.fillStyle = '#8f84aa';
                ell(g, x + 7, y + 4, 8, 1.8);
                g.fillStyle = '#7a5a40';
                ell(g, x, y, 6, 4.2, 0.25 * f);
                g.fillStyle = '#cdbd9e';
                ell(g, x + 1.5 * f, y + 1.6, 3.6, 2.3);
                g.fillStyle = '#5a3f2c';
                ell(g, x + 5 * f, y - 2.6, 3, 2.7);
                poly(g, [[x - 5 * f, y - 1], [x - 11 * f, y - 3], [x - 5 * f, y + 2]]);
            });
        });
    }

    // --- the wall, its lamp, the pipe, the wires ---------------------------------------
    function wall(st) {
        const rn = Motion.rng('wall-detail');
        // cracks in the lime-wash, a patch where it fell and the ochre render shows
        [[[1500, 300], [1508, 336], [1496, 372], [1504, 410]], [[690, 110], [700, 150], [692, 196]], [[1040, 60], [1052, 110], [1046, 150], [1058, 200]], [[1660, 380], [1650, 430], [1662, 470]]].forEach((c) => st.line(c, '#b7ab90', 1.5, { level: FINE }));
        st.paint({ dir: 0.6, dab: 0.3 }, (g) => {
            g.fillStyle = '#d9b47a';
            poly(g, [[1520, 470], [1556, 462], [1574, 486], [1560, 516], [1528, 510]]);
            g.fillStyle = '#c29a62';
            poly(g, [[1532, 488], [1552, 480], [1560, 500], [1540, 506]]);
            g.fillStyle = '#b5abcb';
            poly(g, [[1520, 470], [1556, 462], [1558, 466], [1524, 474]]);
        });
        // two wires on porcelain insulators under the string course
        [270, 276].forEach((y, k) => st.line(Array.from({ length: 12 }, (_, i) => [640 + i * 108, y + (i % 2 ? 2.4 : 0)]), '#2f2c30', 1.5, { level: FINE, seed: 'wire' + k }));
        st.paint({ dir: 1.5 }, (g) => {
            for (let x = 640; x < 1830; x += 216) {
                g.fillStyle = '#f6f2e6';
                g.fillRect(x - 3, 264, 6, 16);
                g.fillStyle = '#b9b2c8';
                g.fillRect(x + 1, 264, 2, 16);
            }
        });
        // the drainpipe, with its brackets and its shadow
        st.paint({ dir: 1.55 }, (g) => {
            g.fillStyle = '#b3a9c9';
            g.fillRect(1466, -30, 7, 590);
            g.fillStyle = '#8f9a9c';
            g.fillRect(1452, -30, 12, 590);
            g.fillStyle = '#c9d2d0';
            g.fillRect(1452, -30, 3.4, 590);
            g.fillStyle = '#5f696c';
            [80, 220, 380, 520].forEach((y) => g.fillRect(1449, y, 18, 4));
            poly(g, [[1452, 560], [1464, 560], [1474, 584], [1462, 586]]);
        });
    }

    function lamp(st) {
        // the lamp: scrolled bracket, a lantern with four panes and a cap
        st.line([[1198, 300], [1198, 258], [1168, 258]], '#232228', 4, { level: SMALL });
        st.line(arc(1186, 272, 11, 11, Math.PI * 1.5, Math.PI * 3.1, 10), '#232228', 2, { level: FINE });
        st.line(arc(1190, 290, 6, 6, Math.PI * 0.5, Math.PI * 2.2, 8), '#232228', 1.6, { level: FINE });
        st.paint({ dir: 1.5 }, (g) => {
            g.fillStyle = '#b5abcb'; // its shadow on the wall
            poly(g, [[1196, 286], [1224, 300], [1222, 344], [1200, 334]]);
            g.fillStyle = '#232228';
            poly(g, [[1152, 264], [1184, 264], [1179, 304], [1157, 304]]);
            poly(g, [[1150, 264], [1186, 264], [1168, 250]]);
            g.fillStyle = '#cfe0de';
            poly(g, [[1158, 269], [1166.5, 269], [1166.5, 299], [1161, 299]]);
            g.fillStyle = '#9fb6bc';
            poly(g, [[1169.5, 269], [1178, 269], [1175, 299], [1169.5, 299]]);
            g.fillStyle = '#ffffff';
            g.fillRect(1160, 272, 2.4, 12);
            g.fillStyle = '#e8d9a0';
            ell(g, 1168, 290, 3, 5);
            g.fillStyle = '#232228';
            ell(g, 1168, 247, 3, 3.4);
        });
    }

    // --- balconies ------------------------------------------------------------------------
    function balcony(st, cx, i) {
        const rn = Motion.rng('balcony-detail' + cx);
        const x0 = cx - 55;
        // lace: a pattern of holes and a scalloped hem; the room behind has a lamp and a picture
        st.paint({ dir: 1.55 }, (g) => {
            g.fillStyle = '#4b5d6c';
            g.fillRect(x0 + 48, 60, 62, 176);
            g.fillStyle = '#26323d';
            g.fillRect(x0 + 48, 122, 62, 114);
            g.fillStyle = '#c9a25a';
            g.fillRect(x0 + 70, 84, 22, 28);
            g.fillStyle = '#6a7f6a';
            g.fillRect(x0 + 74, 88, 14, 20);
            g.fillStyle = '#b7b6c6';
            for (let y = 70; y < 224; y += 9) for (let x = x0 + 5; x < x0 + 46; x += 8) ell(g, x + ((y / 9) % 2) * 4, y, 1.7, 1.7);
            g.fillStyle = '#ece8dc';
            for (let x = x0 + 4; x < x0 + 48; x += 8) ell(g, x, 236, 4, 3.4);
        });
        // shutters: every slat lit along its top
        [x0 - 52, cx + 57].forEach((x) => {
            for (let y = 68; y < 232; y += 11) st.line([[x + 5, y - 0.6], [x + 45, y - 0.6]], '#7cc090', 1.5, { level: FINE });
            st.paint({ dir: 0 }, (g) => {
                g.fillStyle = '#1f1f24';
                [92, 200].forEach((y) => g.fillRect(x + (x < cx ? 46 : 0), y, 5, 7));
            });
        });
        // the rail: a band of scrolls under the handrail, light on the handrail
        for (let x = cx - 70; x < cx + 66; x += 13) st.line(arc(x + 6.5, 193, 5, 5, 0, Math.PI * 2, 10), '#2b2a2e', 1.5, { level: FINE });
        st.line([[cx - 76, 200], [cx + 76, 200]], '#2b2a2e', 2, { level: FINE });
        st.line([[cx - 76, 180], [cx + 76, 180]], '#7b7a86', 1.6, { level: FINE });
        // geranium leaves round and scalloped, pots with a rim and a saucer
        st.paint({ dab: 1 }, (g) => {
            [cx - 54, cx - 8, cx + 44].forEach((px) => {
                g.fillStyle = '#d0784c';
                g.fillRect(px - 15, 201, 30, 5);
                g.fillStyle = '#e39a70';
                g.fillRect(px - 15, 201, 12, 2);
                for (let k = 0; k < 10; k++) {
                    const x = px + (rn() - 0.5) * 46, y = 197 - rn() * 24;
                    g.fillStyle = k % 2 ? '#4f9a4e' : '#2f6f3c';
                    ell(g, x, y, 5.5, 4.6);
                    g.fillStyle = '#7fb866';
                    ell(g, x - 1, y - 1, 2.4, 1.8);
                }
                for (let k = 0; k < 7; k++) {
                    const x = px + (rn() - 0.5) * 40, y = 184 - rn() * 26;
                    g.fillStyle = ['#e23a2e', '#f0584a', '#c9202a'][k % 3];
                    for (let p = 0; p < 4; p++) ell(g, x + Math.cos(p * 1.6) * 2.6, y + Math.sin(p * 1.6) * 2.6, 2.4, 2.4);
                    g.fillStyle = '#ffd0c0';
                    ell(g, x, y, 1.1, 1.1);
                }
            });
        });
        if (i === 1) {
            // a canary's cage hung in the sun
            const bx = cx + 30, by = 120;
            st.line([[bx, 62], [bx, by - 26]], '#3a3a40', 1.5, { level: FINE });
            st.paint({ dir: 1.5 }, (g) => {
                g.fillStyle = '#3d4854';
                poly(g, [[bx - 15, by + 22], [bx + 15, by + 22], [bx + 15, by - 12], [bx, by - 26], [bx - 15, by - 12]]);
                g.fillStyle = '#f2d43a';
                ell(g, bx - 1, by + 6, 5, 3.6, -0.3);
                ell(g, bx + 3, by + 2, 2.7, 2.5);
                g.fillStyle = '#e08a2a';
                poly(g, [[bx + 5.5, by + 1.5], [bx + 8.5, by + 2.5], [bx + 5.5, by + 3.5]]);
                g.fillStyle = '#8a6a3a';
                g.fillRect(bx - 16, by + 21, 32, 4);
            });
            for (let x = bx - 15; x <= bx + 15; x += 5) st.line([[x, by + 22], [x, by - 12], [bx, by - 26]], '#c9c2a0', 1.5, { level: FINE });
            st.line([[bx - 10, by + 10], [bx + 10, by + 10]], '#8a6a3a', 1.5, { level: FINE });
        }
        if (i === 0) {
            // a towel put out to dry over the rail
            st.paint({ dir: 1.5 }, (g) => {
                g.fillStyle = '#fbf7ea';
                poly(g, [[cx + 22, 178], [cx + 62, 178], [cx + 60, 232], [cx + 24, 230]]);
                g.fillStyle = '#c9c4d6';
                poly(g, [[cx + 48, 180], [cx + 62, 178], [cx + 60, 232], [cx + 50, 231]]);
                g.fillStyle = '#5f86c0';
                g.fillRect(cx + 24, 214, 37, 3.4);
                g.fillRect(cx + 24, 221, 37, 2);
            });
        }
    }

    // --- the shop --------------------------------------------------------------------------
    function shop(st) {
        const rn = Motion.rng('shop-detail');
        // the sign, lettered
        st.paint({ dir: 0.01 }, (g) => {
            g.fillStyle = '#254c3a';
            g.fillRect(790, 296, 262, 30);
            g.fillStyle = '#2f5f48';
            g.fillRect(794, 300, 254, 22);
            g.fillStyle = '#f4e8c4';
            g.font = '21px Fell';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText('ULTRAMARINOS', 921, 312);
        });
        st.line([[794, 299], [1048, 299]], '#e0cf9c', 1.5, { level: FINE });
        st.line([[794, 323], [1048, 323]], '#e0cf9c', 1.5, { level: FINE });
        // the back doorway, plain dark: things hang in front of it
        st.paint({ dir: 1.55 }, (g) => {
            g.fillStyle = '#322a3c';
            g.fillRect(940, 426, 150, 140);
            g.fillStyle = '#463a4e';
            g.fillRect(940, 426, 4, 140);
        });
        // the shelves again, every tin with its label and a light on its shoulder
        [420, 462, 504].forEach((y, row) => {
            let x = 752;
            while (x < 924) {
                const kind = rn(), w = kind < 0.3 ? 7 : 10 + rn() * 3, h = kind < 0.3 ? 26 + rn() * 6 : 15 + rn() * 12;
                const body = ['#d8b23a', '#b8452e', '#e3dcc6', '#5d8f6a', '#c97f2e', '#8fa9b8', '#3f5f8a'][Math.floor(rn() * 7)];
                st.paint({ dir: 1.55 }, (g) => {
                    g.fillStyle = body;
                    if (kind < 0.3) {
                        // a bottle: shoulders, a neck, a cork
                        g.fillStyle = ['#2f5a3a', '#6a3a24', '#3a4a5a'][Math.floor(rn() * 3)];
                        g.fillRect(x, y - h + 9, w, h - 9);
                        g.fillRect(x + 2.2, y - h, w - 4.4, 10);
                        g.fillStyle = '#e8dfc8';
                        g.fillRect(x, y - h * 0.5, w, 7);
                        g.fillStyle = '#c9a86a';
                        g.fillRect(x + 2.2, y - h - 2, w - 4.4, 3);
                    } else {
                        g.fillRect(x, y - h, w, h);
                        g.fillStyle = ['#f6efd8', '#2a2a30', '#c8322c', '#f2d43a'][Math.floor(rn() * 4)];
                        g.fillRect(x, y - h * 0.68, w, h * 0.36);
                        g.fillStyle = '#8a8478';
                        g.fillRect(x, y - h, w, 2);
                    }
                    g.fillStyle = 'rgba(255, 244, 214, 0.75)';
                    g.fillRect(x + 1.2, y - h + 3, 1.7, h - 6);
                });
                x += w + 2.5 + rn() * 3;
            }
            st.line([[748, y + 2], [930, y + 2]], '#b98a4f', 3.4, { level: SMALL, seed: 'shelf' + row });
            st.line([[748, y + 0.4], [930, y + 0.4]], '#e0b878', 1.5, { level: FINE, seed: 'shelfl' + row });
        });
        // hung from a rail under the lintel: two sides of salt cod, a braid of garlic, sausages
        st.line([[944, 430], [1052, 430]], '#9a948a', 2, { level: FINE });
        st.paint({ dir: 1.5 }, (g) => {
            [958, 988].forEach((x) => {
                g.fillStyle = '#e9dfc2';
                poly(g, [[x, 433], [x + 12, 446], [x + 9, 486], [x, 494], [x - 9, 486], [x - 12, 446]]);
                g.fillStyle = '#c4b89a';
                poly(g, [[x, 433], [x + 12, 446], [x + 9, 486], [x, 494]]);
                g.fillStyle = '#a89c80';
                g.fillRect(x - 0.8, 438, 1.6, 50);
            });
        });
        st.paint({ dab: 1 }, (g) => {
            for (let i = 0; i < 8; i++) {
                g.fillStyle = i % 2 ? '#f3ecd8' : '#d9cfb6';
                ell(g, 1014 + (i % 2 ? 3.4 : -3.4), 438 + i * 6.2, 4.6, 4);
                g.fillStyle = '#b7a8c0';
                ell(g, 1016 + (i % 2 ? 3.4 : -3.4), 440 + i * 6.2, 2.2, 1.8);
            }
        });
        st.line(arc(1038, 432, 8, 40, 0.1, Math.PI - 0.1, 12), '#8a2a22', 4.6, { level: SMALL });
        st.line(arc(1038, 432, 8, 40, 0.3, Math.PI - 0.3, 10), '#c0503a', 1.5, { level: FINE });
        // the strip curtain of the back room, half drawn
        st.paint({ dir: 1.5 }, (g) => {
            ['#c95a3a', '#e6d7a8', '#3f7d8a', '#d9a43a', '#e6d7a8', '#c95a3a'].forEach((c, i) => {
                g.fillStyle = c;
                g.fillRect(1058 + i * 5, 430, 3.2, 130 - i * 3);
            });
        });
        // the counter: a marble top, panelled front, the scales, a jar of sweets, paper
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = '#e6e0d2';
            g.fillRect(742, 514, 208, 7);
            g.fillStyle = '#a9a3b4';
            g.fillRect(742, 520, 208, 2.4);
            g.fillStyle = '#4a3222';
            [[756, 532, 52, 56], [820, 532, 52, 56], [884, 532, 52, 56]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
            g.fillStyle = '#7a5636';
            [[759, 535, 46, 50], [823, 535, 46, 50], [887, 535, 46, 50]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
            // scales: a cream body with a dial, a brass pan
            g.fillStyle = '#e8dfc6';
            poly(g, [[884, 514], [916, 514], [911, 486], [889, 486]]);
            g.fillStyle = '#b9ae98';
            poly(g, [[904, 514], [916, 514], [911, 486], [905, 486]]);
            g.fillStyle = '#fbf7ea';
            ell(g, 900, 497, 8, 8);
            g.fillStyle = '#c9a23a';
            ell(g, 900, 482, 21, 4.4);
            g.fillStyle = '#f3dc8a';
            ell(g, 894, 480.6, 10, 1.7);
            // sweets in a glass jar
            g.fillStyle = '#9fb9be';
            g.fillRect(770, 488, 20, 26);
            g.fillStyle = '#d6e4e2';
            g.fillRect(772, 490, 3, 22);
            g.fillStyle = '#b8452e';
            g.fillRect(768, 484, 24, 5);
            ['#e8785a', '#f2d43a', '#6fa85a', '#e8a0b8', '#f6efd8', '#e8785a', '#f2d43a'].forEach((c, i) => { g.fillStyle = c; ell(g, 776 + (i % 3) * 5, 496 + Math.floor(i / 3) * 6, 2.4, 2.2); });
            // a roll of wrapping paper on its stand
            g.fillStyle = '#d9c9a0';
            g.fillRect(820, 500, 36, 12);
            g.fillStyle = '#b8a67c';
            ell(g, 856, 506, 3.4, 6);
        });
        st.line([[900, 497], [905, 491.5]], '#b8322c', 1.5, { level: FINE });
        // crates: slats with a gap, every fruit round, lit and shadowed; price cards
        const fruit = [['#f08a1e', '#c96a10', '#ffc070'], ['#f2d43a', '#c9aa22', '#fff2a0'], ['#d83a2a', '#a32820', '#ff8a70']];
        [744, 830, 916].forEach((x0, k) => {
            st.paint({ dir: 0.02 }, (g) => {
                g.fillStyle = '#3a2a2a';
                poly(g, [[x0 + 2, 540], [x0 + 74, 540], [x0 + 79, 572], [x0 - 3, 572]]);
            });
            st.paint({ dab: 1 }, (g) => {
                for (let j = 0; j < 3; j++) {
                    for (let i = 0; i < 7; i++) {
                        const x = x0 + 8 + i * 10.2 + (j % 2) * 4 + rn() * 2, y = 548 + j * 8.5 + rn() * 2, rr = 5.4 + rn() * 0.8;
                        g.fillStyle = fruit[k][1];
                        ell(g, x, y, rr, rr * (k === 1 ? 0.84 : 0.96));
                        g.fillStyle = fruit[k][0];
                        ell(g, x - 0.9, y - 0.9, rr * 0.82, rr * 0.78);
                        g.fillStyle = fruit[k][2];
                        ell(g, x - 2, y - 2.2, 1.7, 1.4);
                        if (k === 2 && (i + j) % 2) { g.fillStyle = '#3f7a3a'; ell(g, x + 0.6, y - rr + 1, 2.2, 1.2); }
                        if (k === 0 && (i * 3 + j) % 5 === 0) { g.fillStyle = '#3f7a3a'; ell(g, x + 3, y - rr + 0.5, 3.4, 1.6, 0.5); }
                    }
                }
            });
            st.paint({ dir: 0.02 }, (g) => {
                // the near side: two boards with a gap, corner posts, nail heads
                g.fillStyle = '#d2a868';
                poly(g, [[x0 - 4, 570], [x0 + 80, 570], [x0 + 81, 579], [x0 - 5, 579]]);
                poly(g, [[x0 - 5, 582], [x0 + 81, 582], [x0 + 82, 591], [x0 - 6, 591]]);
                g.fillStyle = '#a57c44';
                g.fillRect(x0 - 5, 577.4, 86, 1.8);
                g.fillRect(x0 - 6, 589.4, 88, 1.8);
                g.fillStyle = '#b98d54';
                g.fillRect(x0 - 6, 566, 6, 26);
                g.fillRect(x0 + 76, 566, 6, 26);
                g.fillStyle = '#5a4026';
                [[x0 - 3, 574], [x0 + 79, 574], [x0 - 3, 586], [x0 + 79, 586]].forEach(([x, y]) => ell(g, x, y, 1.1, 1.1));
                // a price on a card stuck in the fruit
                g.fillStyle = '#fbf6e4';
                poly(g, [[x0 + 50, 528], [x0 + 68, 526], [x0 + 69, 540], [x0 + 51, 542]]);
            });
            st.line([[x0 + 60, 541], [x0 + 60, 552]], '#8a6a3a', 1.5, { level: FINE });
            st.line([[x0 + 54, 531], [x0 + 58, 537], [x0 + 55, 537]], '#2a2a30', 1.5, { level: FINE });
            st.line([[x0 + 61, 530], [x0 + 65, 530], [x0 + 62, 537]], '#2a2a30', 1.5, { level: FINE });
        });
        // by the way in: two sacks open at the neck (chickpeas, lentils) with a scoop
        [[1012, '#e0c88a', '#c9ae6a'], [1056, '#8a6a4a', '#6f5238']].forEach(([x, top, sh], i) => {
            st.paint({ dir: 1.4, dab: 0.2 }, (g) => {
                g.fillStyle = '#b9a078';
                g.beginPath();
                g.moveTo(x - 20, 600); g.quadraticCurveTo(x - 25, 574, x - 17, 560); g.lineTo(x + 17, 560); g.quadraticCurveTo(x + 25, 574, x + 20, 600);
                g.fill();
                g.fillStyle = '#93805c';
                g.beginPath();
                g.moveTo(x + 6, 600); g.quadraticCurveTo(x + 12, 578, x + 8, 562); g.lineTo(x + 17, 560); g.quadraticCurveTo(x + 25, 574, x + 20, 600);
                g.fill();
                g.fillStyle = '#d6c096'; // the rolled rim
                ell(g, x, 560, 18.5, 5.4);
                g.fillStyle = sh;
                ell(g, x, 560, 15, 3.8);
                g.fillStyle = top;
                ell(g, x - 2, 559, 11, 2.6);
            });
            if (!i) {
                st.line([[x + 4, 558], [x + 16, 544]], '#9aa0a6', 2.4, { level: FINE });
                st.paint({ dir: 0.8 }, (g) => { g.fillStyle = '#c9d0d4'; ell(g, x + 2, 559, 5, 3, -0.8); });
            }
        });
        // a rush-seated chair out in the sun, a broom against the post
        const cxh = 1136, cy = 600;
        st.paint({ dir: 0.3 }, (g) => {
            g.fillStyle = '#8f84aa';
            poly(g, [[cxh - 14, cy], [cxh + 22, cy], [cxh + 70, cy + 16], [cxh + 30, cy + 18]]);
        });
        [[cxh - 15, cy, cxh - 13, cy - 78], [cxh + 15, cy, cxh + 17, cy - 78], [cxh - 9, cy + 6, cxh - 9, cy - 36], [cxh + 23, cy + 6, cxh + 23, cy - 36]].forEach(([a, b, c, d]) => {
            st.line([[a, b], [c, d]], '#8a5a30', 3.2, { level: SMALL });
            st.line([[a - 0.9, b], [c - 0.9, d]], '#c99a5a', 1.5, { level: FINE });
        });
        [-72, -58, -46].forEach((dy) => st.line([[cxh - 13, cy + dy], [cxh + 17, cy + dy]], '#9a6a3a', 2.4, { level: FINE }));
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = '#e3c66a';
            poly(g, [[cxh - 15, cy - 38], [cxh + 17, cy - 38], [cxh + 25, cy - 30], [cxh - 9, cy - 30]]);
            g.fillStyle = '#c4a548';
            poly(g, [[cxh + 1, cy - 38], [cxh + 17, cy - 38], [cxh + 25, cy - 30], [cxh + 8, cy - 30]]);
        });
        for (let i = 0; i < 5; i++) st.line([[cxh - 13 + i * 7, cy - 37.4], [cxh - 7 + i * 7.4, cy - 30.6]], '#a8893a', 1.5, { level: FINE });
        st.line([[cxh - 9, cy - 14], [cxh + 23, cy - 14]], '#8a5a30', 2, { level: FINE });
        st.line([[716, 380], [708, 590]], '#b98d54', 3, { level: SMALL });
        st.paint({ dir: 1.4, dab: 0.2 }, (g) => {
            g.fillStyle = '#d9b860';
            poly(g, [[700, 566], [716, 566], [722, 602], [694, 602]]);
            g.fillStyle = '#b3923f';
            poly(g, [[709, 566], [716, 566], [722, 602], [710, 602]]);
            g.fillStyle = '#8a3a2a';
            g.fillRect(700, 564, 16, 4);
        });
        // the awning, last: it hangs in front of everything inside. Each stripe is a
        // little darker by the wall; the valance is scalloped and bound in red braid
        const top = [706, 1134, 322], front = [682, 1158, 398];
        st.paint({ dir: 1.35 }, (g) => {
            for (let i = 0; i < 12; i++) {
                const a = i / 12, b = (i + 1) / 12;
                const tx0 = top[0] + (top[1] - top[0]) * a, tx1 = top[0] + (top[1] - top[0]) * b, fx0 = front[0] + (front[1] - front[0]) * a, fx1 = front[0] + (front[1] - front[0]) * b;
                g.fillStyle = i % 2 ? '#4d9265' : '#f1e7cc';
                poly(g, [[tx0, top[2]], [tx1 + 0.5, top[2]], [fx1 + 0.5, front[2]], [fx0, front[2]]]);
                g.fillStyle = i % 2 ? '#3f7d57' : '#dcd2ba';
                poly(g, [[tx0, top[2]], [tx1 + 0.5, top[2]], [tx1 + (fx1 - tx1) * 0.28 + 0.5, top[2] + 21], [tx0 + (fx0 - tx0) * 0.28, top[2] + 21]]);
                g.fillStyle = i % 2 ? '#3a7650' : '#d8cfb6';
                g.beginPath();
                g.moveTo(fx0, front[2] - 1);
                g.lineTo(fx1 + 0.5, front[2] - 1);
                g.lineTo(fx1 + 0.5, front[2] + 12);
                g.quadraticCurveTo((fx0 + fx1) / 2, front[2] + 26, fx0, front[2] + 12);
                g.fill();
            }
        });
        for (let i = 0; i < 12; i++) {
            const fx0 = front[0] + ((front[1] - front[0]) * i) / 12, fx1 = front[0] + ((front[1] - front[0]) * (i + 1)) / 12;
            st.line([[fx0, 410.5], [fx0 + (fx1 - fx0) * 0.25, 415.6], [(fx0 + fx1) / 2, 417.6], [fx1 - (fx1 - fx0) * 0.25, 415.6], [fx1, 410.5]], '#c8322c', 1.6, { level: FINE, seed: 'braid' + i });
        }
        st.line([[682, 398], [1158, 398]], '#fffaf0', 2.4, { level: FINE });
        [[706, 360, 684, 398], [1134, 360, 1156, 398]].forEach(([a, b, c, d]) => {
            st.line([[a, b], [c, d]], '#232228', 2.4, { level: FINE });
            st.line(arc(a + (c > a ? 6 : -6), b + 12, 6, 6, 0, Math.PI * 2, 8), '#232228', 1.5, { level: FINE });
        });
        st.line([[1150, 424], [1152, 462]], '#c9b88a', 1.5, { level: FINE });
        st.paint({ dab: 1 }, (g) => { g.fillStyle = '#a8322c'; ell(g, 1152, 466, 2.4, 4.4); });
        // the doormat
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = '#b3924a';
            poly(g, [[1000, 606], [1100, 606], [1108, 620], [996, 620]]);
            g.fillStyle = '#8a6f34';
            [609, 613, 617].forEach((y) => g.fillRect(998, y, 108, 1.5));
        });
    }

    // --- the house door ---------------------------------------------------------------------
    function door(st) {
        const X0 = 1250, MID = 1328, X1 = 1400, Y0 = 344;
        st.paint({ dir: 1.55 }, (g) => {
            // mouldings: the reveal in shade on the left, a lintel with its keystone
            g.fillStyle = '#b8aecd';
            g.fillRect(X0 - 4, Y0 - 3, 4, 259);
            g.fillRect(X0 - 4, Y0 - 4, X1 - X0 + 4, 4);
            g.fillStyle = '#fffaf0';
            g.fillRect(X0 - 12, Y0 - 12, 3, 268);
            g.fillStyle = '#e2d6ba';
            poly(g, [[1316, 332], [1334, 332], [1330, 344], [1320, 344]]);
            // the hall: a tiled floor running back, a coat on its hook, the patio beyond
            g.fillStyle = '#20263a';
            g.fillRect(X0, Y0, MID - X0, 256);
            g.fillStyle = '#2f3550';
            g.fillRect(X0, Y0, 22, 256);
            for (let r = 0; r < 5; r++) {
                const y0 = 560 + r * 8, y1 = y0 + 8, sp = 12 + r * 2.4;
                for (let c = -1; c < 8; c++) {
                    g.fillStyle = (r + c) % 2 ? '#b39a84' : '#6a4f48';
                    poly(g, [[X0 + 10 + c * (sp - 2.4), y0], [X0 + 10 + (c + 1) * (sp - 2.4), y0], [X0 + 6 + (c + 1) * sp, y1], [X0 + 6 + c * sp, y1]]);
                }
            }
            g.fillStyle = '#20263a';
            g.fillRect(X0 - 2, 556, 3, 44);
            g.fillStyle = '#9fb0c2'; // the patio: light, a wall, a plant
            g.fillRect(1276, 426, 30, 66);
            g.fillStyle = '#e9e2cc';
            g.fillRect(1276, 458, 30, 34);
            g.fillStyle = '#3f8a4a';
            ell(g, 1284, 462, 7, 9);
            ell(g, 1294, 452, 5, 7);
            g.fillStyle = '#b8603a';
            g.fillRect(1280, 472, 12, 10);
            g.fillStyle = '#463a52';
            poly(g, [[1310, 390], [1324, 392], [1326, 452], [1308, 450]]);
            // the edge of the open leaf and the shut one
            g.fillStyle = '#6fa89c';
            g.fillRect(MID - 3, Y0, 3.4, 256);
            g.fillStyle = '#3f736c';
            g.fillRect(MID, Y0, X1 - MID, 256);
            // her shadow thrown on the shut leaf
            g.fillStyle = '#2c5653';
            g.beginPath();
            g.moveTo(MID, 600); g.lineTo(MID, 470); g.quadraticCurveTo(1336, 432, 1342, 420); g.quadraticCurveTo(1352, 404, 1358, 424); g.quadraticCurveTo(1366, 470, 1364, 600);
            g.fill();
            // two panels, bevelled: light on the top and left edges, dark below and right
            [[MID + 10, Y0 + 14, 52, 96], [MID + 10, Y0 + 124, 52, 118]].forEach(([x, y, w, h]) => {
                g.fillStyle = '#264f4b';
                g.fillRect(x, y, w, h);
                g.fillStyle = '#4f8a82';
                g.fillRect(x + 4, y + 4, w - 8, h - 8);
                g.fillStyle = '#7fb8ac';
                g.fillRect(x + 4, y + 4, w - 8, 2);
                g.fillRect(x + 4, y + 4, 2, h - 8);
                g.fillStyle = '#356660';
                g.fillRect(x + 4, y + h - 6, w - 8, 2);
            });
            // hinges, a letter slot, the lock with its key, a knocker shaped like a hand
            g.fillStyle = '#1b2a2c';
            [372, 474, 574].forEach((y) => g.fillRect(X1 - 6, y, 6, 12));
            g.fillStyle = '#c9a23a';
            g.fillRect(MID + 22, 452, 26, 5.4);
            g.fillStyle = '#1b2a2c';
            g.fillRect(MID + 25, 454, 20, 1.7);
            g.fillStyle = '#c9a23a';
            g.fillRect(MID + 5, 494, 6, 15);
            ell(g, MID + 8, 512, 3.6, 3.6);
            g.fillStyle = '#f3dc8a';
            g.fillRect(MID + 5.6, 495, 1.7, 12);
            g.fillStyle = '#d9b24a';
            ell(g, MID + 36, 430, 4, 3);
            poly(g, [[MID + 33, 431], [MID + 39, 431], [MID + 38, 443], [MID + 34, 443]]);
            ell(g, MID + 36, 445, 4.4, 3.4);
            g.fillStyle = '#fff0b0';
            ell(g, MID + 35, 444, 1.7, 1.3);
            // the step: worn pale in the middle
            g.fillStyle = '#d9cdb0';
            g.fillRect(X0 - 14, 598, X1 - X0 + 28, 9);
            g.fillStyle = '#f1e8d0';
            g.fillRect(X0 + 30, 598, 80, 4);
            g.fillStyle = '#9d92b0';
            g.fillRect(X0 - 14, 606, X1 - X0 + 28, 2.4);
        });
        // grain in the wood, studs along the rails
        for (let i = 0; i < 4; i++) st.line([[MID + 12 + i * 17, Y0 + 4], [MID + 13.4 + i * 17, Y0 + 252]], i % 2 ? '#386a64' : '#467c74', 1.5, { level: FINE, seed: 'grain' + i });
        st.paint({ dir: 0 }, (g) => {
            g.fillStyle = '#1b2a2c';
            for (let x = MID + 8; x < X1 - 4; x += 12) [Y0 + 7, Y0 + 117, Y0 + 249].forEach((y) => ell(g, x, y, 1.5, 1.5));
        });
        // the fly curtain of coloured strips, gathered against the jamb
        ['#c95a3a', '#e6d7a8', '#3f7d8a', '#d9a43a', '#e6d7a8', '#c95a3a', '#3f7d8a'].forEach((c, i) => {
            const x = X0 + 2 + i * 2.6;
            st.line([[x, Y0 + 2], [x - 0.6 * i * 0.2, 450], [X0 + 3 + i * 1.2, 470], [x - 1, 590 - i * 3]], c, 2.2, { level: FINE, seed: 'strip' + i });
        });
        st.line([[X0, 468], [X0 + 16, 472]], '#8a3a2a', 2.4, { level: FINE });
        // the number, a bell push, a pot of aspidistra, the cat on the step
        st.paint({ dir: 0 }, (g) => {
            g.fillStyle = '#3f6fb5';
            g.fillRect(1423, 391, 24, 24);
            g.fillStyle = '#f6f0de';
            g.fillRect(1426.4, 394.4, 17.2, 17.2);
            g.fillStyle = '#c9a23a';
            g.fillRect(1428, 436, 9, 13);
            g.fillStyle = '#3a2a22';
            ell(g, 1432.5, 442.5, 2.2, 2.2);
        });
        st.line([[1431, 399], [1439.5, 399], [1434, 409]], '#2f5aa0', 2, { level: FINE });
        st.paint({ dir: 1.5 }, (g) => {
            g.fillStyle = '#9d92b0';
            ell(g, 1452, 602, 26, 4.4);
            g.fillStyle = '#b8603a';
            poly(g, [[1426, 566], [1456, 566], [1451, 600], [1431, 600]]);
            g.fillStyle = '#8f4428';
            poly(g, [[1444, 566], [1456, 566], [1451, 600], [1444, 600]]);
            g.fillStyle = '#d98058';
            g.fillRect(1424, 564, 34, 5);
        });
        [[-26, -58], [-12, -74], [2, -80], [16, -70], [28, -52], [-20, -40], [22, -36]].forEach(([dx, dy], i) => {
            const p = [[1441, 566], [1441 + dx * 0.55, 566 + dy * 0.7], [1441 + dx, 566 + dy]];
            st.line(p, i % 2 ? '#2f6f3c' : '#245a34', 6, { level: SMALL, taper: 0.6, seed: 'asp' + i });
            st.line(p, '#6fb060', 1.5, { level: FINE, seed: 'aspm' + i });
        });
        st.paint({ dir: 0.1 }, (g) => {
            // an orange cat asleep on the warm step
            const cx = 1374, cy = 592;
            g.fillStyle = '#9d92b0';
            ell(g, cx + 6, cy + 6, 22, 3);
            g.fillStyle = '#d98a3a';
            ell(g, cx, cy, 17, 8.5);
            ell(g, cx - 13, cy + 1, 7.4, 6.4);
            poly(g, [[cx - 18, cy - 3], [cx - 17, cy - 9], [cx - 13, cy - 5]]);
            poly(g, [[cx - 12, cy - 5], [cx - 9, cy - 10], [cx - 7, cy - 4]]);
            g.fillStyle = '#b06a2c';
            ell(g, cx - 8, cy + 1.6, 2, 5.4);
            g.fillStyle = '#9a5220';
            [cx - 4, cx + 3, cx + 10].forEach((x) => poly(g, [[x, cy - 8], [x + 3, cy - 8], [x + 1, cy - 1], [x - 1, cy - 1]]));
            g.fillStyle = '#f3c88a';
            ell(g, cx - 2, cy + 4, 11, 3);
            g.fillStyle = '#d98a3a';
            g.beginPath();
            g.moveTo(cx + 15, cy + 2); g.quadraticCurveTo(cx + 26, cy + 8, cx + 4, cy + 8.5); g.lineTo(cx + 4, cy + 5.5); g.quadraticCurveTo(cx + 18, cy + 5, cx + 13, cy - 1);
            g.fill();
        });
        st.line([[1359, 594], [1363, 594.6]], '#5a3418', 1.5, { level: FINE });
    }

    // --- her --------------------------------------------------------------------------------
    // In the doorway, a basket on her left arm, her right hand flat over her eyes against
    // the sun: looking this way. Lit from the upper left.
    function woman(st, x, y) {
        const skin = '#f2caa4', skinS = '#c9957a', skinD = '#a8745e', dress = '#f3e6ac', dressS = '#d8b96c', dressV = '#b9a2b4', dressL = '#fbf3d2';
        const rn = Motion.rng('her-dress');
        st.paint({ dir: 0.5 }, (g) => {
            g.fillStyle = '#8d82a8'; // her shadow across the step
            poly(g, [[x - 8, y - 2], [x + 14, y - 2], [x + 40, y + 4], [x + 22, y + 6]]);
        });
        st.paint({ dir: 1.5 }, (g) => {
            // legs: calf, ankle; the far one in her own shade
            g.fillStyle = skin;
            poly(g, [[x - 12, y - 46], [x - 3, y - 46], [x - 3.4, y - 26], [x - 4.4, y - 8], [x - 9, y - 8], [x - 11.6, y - 26]]);
            g.fillStyle = '#fbdcbc';
            poly(g, [[x - 11, y - 44], [x - 8.6, y - 44], [x - 9.6, y - 12], [x - 10.6, y - 26]]);
            g.fillStyle = skinS;
            poly(g, [[x + 3, y - 46], [x + 12, y - 46], [x + 11.6, y - 26], [x + 9, y - 8], [x + 4.4, y - 8], [x + 3.4, y - 26]]);
            g.fillStyle = skinD;
            poly(g, [[x + 8.6, y - 46], [x + 12, y - 46], [x + 11.6, y - 26], [x + 9, y - 8], [x + 7.6, y - 8]]);
            // espadrilles: navy canvas on a rope sole, ribbons round the ankle
            [x - 7.6, x + 7.4].forEach((sx, i) => {
                g.fillStyle = '#d9c7a0';
                ell(g, sx - 1, y - 1.6, 8.4, 2.6);
                g.fillStyle = i ? '#232c44' : '#2f3c5c';
                g.beginPath();
                g.ellipse(sx - 1, y - 3.4, 7.6, 3.6, 0, Math.PI, Math.PI * 2);
                g.fill();
            });
        });
        st.line([[x - 9.6, y - 12], [x - 4.6, y - 14]], '#2f3c5c', 1.5, { level: FINE });
        st.line([[x + 4.6, y - 12], [x + 9.4, y - 14]], '#232c44', 1.5, { level: FINE });
        st.paint({ dir: 1.5 }, (g) => {
            // skirt: three folds from the belt, lit left, a paler hem
            g.fillStyle = dress;
            poly(g, [[x - 14, y - 118], [x + 14, y - 118], [x + 31, y - 44], [x - 30, y - 44]]);
            g.fillStyle = dressL;
            poly(g, [[x - 13, y - 114], [x - 7, y - 114], [x - 17, y - 47], [x - 27, y - 47]]);
            g.fillStyle = dressS;
            poly(g, [[x + 3, y - 118], [x + 14, y - 118], [x + 31, y - 44], [x + 8, y - 44]]);
            poly(g, [[x - 6, y - 112], [x - 3, y - 112], [x - 6, y - 46], [x - 12, y - 46]]);
            g.fillStyle = dressV;
            poly(g, [[x + 12, y - 104], [x + 18, y - 98], [x + 31, y - 44], [x + 21, y - 44]]);
            poly(g, [[x + 2, y - 108], [x + 5, y - 108], [x + 9, y - 46], [x + 3, y - 46]]);
            g.fillStyle = '#fffbe6';
            poly(g, [[x - 30, y - 47], [x + 31, y - 47], [x + 31, y - 43.4], [x - 30, y - 43.4]]);
            // bodice: collar, a row of buttons, the bust turning from the light
            g.fillStyle = dress;
            poly(g, [[x - 18, y - 165], [x + 18, y - 165], [x + 14, y - 117], [x - 14, y - 117]]);
            g.fillStyle = dressL;
            poly(g, [[x - 16, y - 162], [x - 8, y - 163], [x - 9, y - 124], [x - 13, y - 122]]);
            g.fillStyle = dressS;
            poly(g, [[x + 5, y - 165], [x + 18, y - 165], [x + 14, y - 117], [x + 7, y - 117]]);
            g.fillStyle = dressV;
            poly(g, [[x + 13, y - 160], [x + 18, y - 164], [x + 14.6, y - 120], [x + 12, y - 122]]);
            g.fillStyle = '#fffdf2';
            poly(g, [[x - 9, y - 167], [x, y - 156], [x - 2, y - 153], [x - 12, y - 162]]);
            poly(g, [[x + 9, y - 167], [x, y - 156], [x + 2, y - 153], [x + 12, y - 162]]);
            g.fillStyle = skinS;
            poly(g, [[x - 5, y - 167], [x + 5, y - 167], [x, y - 158]]);
            // belt and buckle
            g.fillStyle = '#b8563e';
            g.fillRect(x - 14.4, y - 121.4, 28.8, 5.6);
            g.fillStyle = '#8f3a2a';
            g.fillRect(x + 4, y - 121.4, 10.4, 5.6);
            g.fillStyle = '#e8c860';
            g.fillRect(x - 3.4, y - 122, 6, 6.8);
            g.fillStyle = '#b8563e';
            g.fillRect(x - 1.7, y - 120.2, 2.6, 3.2);
        });
        // the print of the dress: small sprigs, coral and blue
        st.paint({ dab: 1 }, (g) => {
            for (let i = 0; i < 34; i++) {
                const v = rn(), yy = y - 160 + v * 112, half = yy < y - 118 ? 15 : 14 + ((yy - (y - 118)) / 74) * 15, xx = x + (rn() * 2 - 1) * (half - 3);
                if (yy > y - 124 && yy < y - 114) continue;
                g.fillStyle = ['#e8785a', '#6f8fc2', '#e8785a', '#7fa860'][i % 4];
                ell(g, xx, yy, 1.7, 1.5);
                if (i % 2) { g.fillStyle = '#7fa860'; ell(g, xx + 1.8, yy + 1.2, 1.2, 0.9); }
            }
            g.fillStyle = '#fffdf2';
            [-150, -143, -136, -129].forEach((dy) => ell(g, x, y + dy, 1.2, 1.2));
        });
        st.paint({ dir: 1.5 }, (g) => {
            // neck, a thin chain with a medal
            g.fillStyle = skinS;
            poly(g, [[x - 4.4, y - 176], [x + 5, y - 176], [x + 5.6, y - 164], [x - 5, y - 164]]);
            g.fillStyle = skinD;
            poly(g, [[x + 1, y - 176], [x + 5, y - 176], [x + 5.6, y - 164], [x + 2, y - 166]]);
            g.fillStyle = '#e8c860';
            ell(g, x, y - 159.4, 1.4, 1.4);
            // head: the face, the far cheek turning, hair gathered in a bun
            g.fillStyle = skin;
            ell(g, x, y - 185, 11, 13.6);
            g.fillStyle = skinS;
            g.beginPath();
            g.ellipse(x, y - 185, 11, 13.6, 0, -1.25, 1.5);
            g.lineTo(x + 4, y - 174);
            g.quadraticCurveTo(x + 6.5, y - 185, x + 3, y - 197);
            g.fill();
            g.fillStyle = '#f3b79a';
            ell(g, x - 5, y - 180.6, 3.2, 2.2);
            // her hand's shade lies across brow and eyes
            g.fillStyle = '#b98674';
            poly(g, [[x - 10.4, y - 192], [x + 10, y - 193], [x + 10.6, y - 185.4], [x - 10.8, y - 184.6]]);
            g.fillStyle = '#34221f'; // eyes, in that shade
            ell(g, x - 4.6, y - 187.2, 2, 1.2);
            ell(g, x + 4, y - 187.4, 1.8, 1.1);
            g.fillStyle = skinD;
            poly(g, [[x - 0.6, y - 186], [x + 1.2, y - 186], [x + 2.2, y - 179.4], [x - 0.4, y - 179.8]]);
            g.fillStyle = '#b8665a';
            ell(g, x - 0.4, y - 175.8, 2.5, 1);
            g.fillStyle = skinS; // ear, an earring
            ell(g, x + 10.4, y - 184, 2.2, 3.6);
            g.fillStyle = '#f3dc8a';
            ell(g, x + 10.8, y - 179.4, 1.3, 1.3);
            g.fillStyle = '#33231c';
            g.beginPath();
            g.ellipse(x + 0.6, y - 189, 12.6, 13, 0, Math.PI * 0.98, Math.PI * 2.22);
            g.lineTo(x + 9, y - 190);
            g.quadraticCurveTo(x, y - 197, x - 11.4, y - 190);
            g.fill();
            ell(g, x + 12.6, y - 192, 6.6, 6.2);
            g.fillStyle = '#6a4630';
            poly(g, [[x - 8, y - 198], [x + 2, y - 201], [x + 3, y - 199], [x - 7, y - 196]]);
            ell(g, x + 11.6, y - 194.4, 3, 2);
        });
        st.line([[x - 9.6, y - 191.6], [x - 11.4, y - 183]], '#33231c', 1.6, { level: FINE });
        // the arm with the basket: sleeve, upper arm, forearm, the hand closed on the handle
        st.paint({ dir: 1.2 }, (g) => {
            g.fillStyle = dressS;
            poly(g, [[x + 13, y - 165], [x + 22, y - 160], [x + 25, y - 146], [x + 15, y - 145]]);
            g.fillStyle = '#fffbe6';
            poly(g, [[x + 15.4, y - 147], [x + 25, y - 148], [x + 25.2, y - 145.4], [x + 15.4, y - 144.6]]);
        });
        st.line([[x + 20, y - 146], [x + 25, y - 128], [x + 22.4, y - 112]], skinS, 7.4, { level: SMALL });
        st.line([[x + 18.4, y - 144], [x + 23, y - 128], [x + 20.6, y - 114]], skin, 2.2, { level: FINE });
        // the basket: ribs and weave, a rim, the handle; bread scored on top, greens, tomatoes
        st.paint({ dir: 0.05 }, (g) => {
            g.fillStyle = '#c0914c';
            poly(g, [[x + 5, y - 104], [x + 41, y - 104], [x + 36, y - 79], [x + 10, y - 79]]);
            g.fillStyle = '#8d6430';
            poly(g, [[x + 26, y - 104], [x + 41, y - 104], [x + 36, y - 79], [x + 27, y - 79]]);
            g.fillStyle = '#e8d9b0';
            g.beginPath();
            g.ellipse(x + 17, y - 108, 10.4, 5, -0.25, 0, 7);
            g.fill();
            g.fillStyle = '#c9a66a';
            g.beginPath();
            g.ellipse(x + 19, y - 106.4, 8, 3, -0.25, 0, Math.PI);
            g.fill();
            g.fillStyle = '#4f9048';
            ell(g, x + 31, y - 110, 6.4, 5.4);
            g.fillStyle = '#7fb860';
            ell(g, x + 29, y - 112, 3.4, 2.6);
            g.fillStyle = '#d83a2a';
            ell(g, x + 36.6, y - 106, 3.2, 3);
            g.fillStyle = '#ff9a80';
            ell(g, x + 35.8, y - 107, 1.1, 0.9);
        });
        [-98, -92, -86].forEach((dy, i) => st.line([[x + 6.4 + i, y + dy], [x + 39.6 - i, y + dy]], i % 2 ? '#e0b877' : '#7a5628', 1.5, { level: FINE }));
        [10, 17, 24, 31].forEach((dx) => st.line([[x + dx, y - 103], [x + dx + (dx < 20 ? 1.4 : -1.4), y - 80]], '#a87a3a', 1.5, { level: FINE }));
        st.line([[x + 4.4, y - 104], [x + 41.6, y - 104]], '#e0b877', 2.4, { level: FINE });
        [[x + 12, y - 110.6], [x + 16.4, y - 111.6], [x + 20.6, y - 112.4]].forEach(([a, b]) => st.line([[a, b], [a + 2.6, b + 3.4]], '#a8834a', 1.5, { level: FINE }));
        st.line(arc(x + 23, y - 104, 15.6, 13, Math.PI * 1.04, Math.PI * 1.96, 10), '#8d6430', 2.6, { level: FINE });
        st.paint({ dir: 0.2 }, (g) => {
            g.fillStyle = skinS; // knuckles over the handle, the thumb round it
            ell(g, x + 22.4, y - 115.4, 4.4, 3.6);
            g.fillStyle = skin;
            ell(g, x + 21, y - 116.6, 2.6, 1.7);
        });
        [[x + 20.4, 0], [x + 22.4, 0.3], [x + 24.4, 0.8]].forEach(([a, d]) => st.line([[a, y - 117.4 + d], [a + 0.4, y - 113.6 + d]], skinD, 1.5, { level: FINE }));
        // the arm raised: sleeve, upper arm out to the elbow, forearm back up to the brow
        st.paint({ dir: 0.8 }, (g) => {
            g.fillStyle = dress;
            poly(g, [[x - 18, y - 166], [x - 9, y - 161], [x - 20, y - 150], [x - 30, y - 158]]);
            g.fillStyle = dressL;
            poly(g, [[x - 18, y - 166], [x - 13, y - 163.4], [x - 26, y - 153], [x - 30, y - 158]]);
            g.fillStyle = '#fffbe6';
            poly(g, [[x - 30.6, y - 158.6], [x - 20, y - 150], [x - 21.6, y - 148.4], [x - 32, y - 157]]);
        });
        st.line([[x - 25, y - 154], [x - 33, y - 168], [x - 22, y - 190]], skin, 6.6, { level: SMALL });
        st.line([[x - 23, y - 155], [x - 29.6, y - 167], [x - 19.6, y - 187]], skinS, 2, { level: FINE });
        st.paint({ dir: 0.1 }, (g) => {
            // the hand, palm down, fingers together pointing across the brow; thumb under
            g.fillStyle = skinS;
            poly(g, [[x - 21, y - 190], [x - 6, y - 191.4], [x - 5, y - 189.4], [x - 20, y - 187.4]]);
            g.fillStyle = skin;
            g.beginPath();
            g.moveTo(x - 24, y - 192.6); g.quadraticCurveTo(x - 20, y - 198, x - 8, y - 197.4); g.quadraticCurveTo(x - 2.4, y - 197, x - 2, y - 194.6); g.quadraticCurveTo(x - 3, y - 192.6, x - 9, y - 192.6); g.lineTo(x - 21, y - 190.4);
            g.fill();
            g.fillStyle = '#fbdcbc';
            poly(g, [[x - 20, y - 196.4], [x - 8, y - 197], [x - 8.4, y - 195.6], [x - 19.6, y - 195]]);
        });
        st.line([[x - 9, y - 195], [x - 2.6, y - 194.8]], skinS, 1.5, { level: FINE });
        st.line([[x - 15, y - 190.6], [x - 9.4, y - 189.6]], skinD, 1.5, { level: FINE });
    }

    // What moves inside the memory, as strokes placed by hand for drawing d: swallows
    // hunting over the roofs, leaves of the plane tree turning in the light.
    function live(d) {
        const out = [], t = d / 12;
        for (let i = 0; i < 6; i++) {
            const ph = i * 1.37, sp = 0.5 + (i % 3) * 0.13;
            const x = 300 + 330 * Math.sin(t * sp + ph) + 60 * Math.sin(t * sp * 2.3 + ph * 2), y = 352 + 26 * Math.sin(t * sp * 1.7 + ph * 3) - (i % 2) * 26;
            const vx = Math.cos(t * sp + ph), flap = Math.sin(d * 2.1 + i) * 0.5, dir = vx > 0 ? 1 : -1;
            out.push({ x: x - 3.4 * dir, y: y - 1.5 - flap, ang: (0.5 + flap) * dir, len: 8, w: 1.8, color: '#1d2233', kind: 1 });
            out.push({ x: x + 3.4 * dir, y: y - 1.5 - flap, ang: -(0.5 + flap) * dir, len: 8, w: 1.8, color: '#1d2233', kind: 1 });
            out.push({ x, y, ang: 0, len: 5, w: 2.2, color: '#2a3048', kind: 1 });
        }
        const rn = Motion.rng('shimmer');
        for (let i = 0; i < 70; i++) {
            const e = [[170, 110, 110, 60], [330, 40, 150, 60], [500, 100, 110, 60], [260, 200, 100, 36], [430, 205, 90, 30]][i % 5];
            const a = rn() * 6.283, rr = Math.sqrt(rn()), x = e[0] + Math.cos(a) * e[2] * rr, y = e[1] + Math.sin(a) * e[3] * rr, f = 1.2 + rn() * 2.2, p = rn() * 6.283, ang = rn() * 3;
            if (Math.sin(t * f + p) > 0.35) out.push({ x, y, ang, len: 9, w: 4.4, color: ['#c4dd7c', '#d8e69a', '#a9cf63'][i % 3], color2: '#86b65a' });
        }
        return out;
    }

    return { village, tree, bicycle, ground, wall, lamp, balcony, shop, door, woman, live };
})();
