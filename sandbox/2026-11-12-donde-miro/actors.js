// The people of 1974 who move: each is painted into its own small study for every
// drawing (Oil.sprite) and stamped over the memory. Poses come from the drawing index d.
const Actors = (() => {
    const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
    const ell = (g, x, y, a, b, rot = 0) => { g.beginPath(); g.ellipse(x, y, a, b, rot, 0, 7); g.fill(); };

    // A donkey trotting left with a cart of oranges and its driver. (x, y): where the
    // donkey's fore hooves touch the ground; s: size.
    function cart(st, x, y, s, d) {
        const P = (px, py) => [x + px * s, y + py * s], ph = d * 1.05, bob = Math.sin(ph * 2) * 2.2;
        const grey = '#8f8478', greyD = '#5f574f', greyL = '#bfb3a2', wood = '#b07c42', woodD = '#7d5529';
        st.paint({ dir: 0.05 }, (g) => {
            g.fillStyle = '#857b9f'; // one shadow under the lot: it is noon
            ell(g, ...P(110, 2), 190 * s, 9 * s);
        });
        // far legs first, then the body, then the near legs: each swings from its own joint
        const leg = (hx, hy, phase, col, w) => {
            const a = Math.sin(ph + phase) * 0.55, k = Math.max(0, Math.sin(ph + phase + 1.1)) * 0.7;
            const knee = [hx + Math.sin(a) * 30, hy + Math.cos(a) * 30], hoof = [knee[0] + Math.sin(a - k) * 30, knee[1] + Math.cos(a - k) * 30];
            st.line([P(hx, hy + bob), P(...knee), P(...hoof)], col, w * s, { level: 1, seed: 'leg' + hx + phase });
            st.line([P(hoof[0] - 2, hoof[1] - 1), P(hoof[0] + 3, hoof[1] + 2)], '#2a2622', 6 * s, { level: 2, seed: 'hoof' + hx + phase });
        };
        leg(18, -62, 0, greyD, 9);
        leg(92, -60, Math.PI, greyD, 10);
        st.paint({ dir: 0.1, dab: 0.2 }, (g) => {
            const b = bob * s;
            g.fillStyle = grey; // barrel, rump, neck
            ell(g, x + 58 * s, y - 78 * s + b, 58 * s, 25 * s);
            ell(g, x + 100 * s, y - 80 * s + b, 26 * s, 24 * s);
            poly(g, [P(4, -84 + bob), P(30, -98 + bob), P(8, -132 + bob), P(-16, -122 + bob)]);
            g.fillStyle = greyL; // belly and the light along the back
            ell(g, x + 56 * s, y - 62 * s + b, 44 * s, 9 * s);
            ell(g, x + 60 * s, y - 97 * s + b, 46 * s, 6 * s);
            g.fillStyle = greyD;
            ell(g, x + 108 * s, y - 70 * s + b, 16 * s, 16 * s);
            g.fillStyle = grey; // head: long, dipping as it trots
            const hy = bob * 1.6;
            poly(g, [P(-12, -134 + hy), P(8, -128 + hy), P(-34, -86 + hy), P(-52, -92 + hy)]);
            g.fillStyle = '#e0d6c4';
            ell(g, x - 44 * s, y - 91 * s + hy * s, 11 * s, 8.4 * s, 0.7);
            g.fillStyle = '#2a2622';
            ell(g, x - 22 * s, y - 116 * s + hy * s, 2.6 * s, 2.6 * s);
            ell(g, x - 50 * s, y - 91 * s + hy * s, 1.8 * s, 1.5 * s);
            g.fillStyle = greyD; // ears, one forward one back; the mane
            poly(g, [P(-10, -132 + hy), P(-4, -166 + hy), P(4, -134 + hy)]);
            poly(g, [P(0, -132 + hy), P(16, -160 + hy), P(12, -130 + hy)]);
            poly(g, [P(4, -134 + bob), P(12, -130 + bob), P(32, -100 + bob), P(26, -98 + bob)]);
            g.fillStyle = '#b23a2e'; // the collar, a tassel on the brow
            poly(g, [P(14, -118 + bob), P(26, -112 + bob), P(16, -84 + bob), P(2, -90 + bob)]);
            ell(g, x - 14 * s, y - 130 * s + hy * s, 3.4 * s, 4.4 * s);
        });
        st.line([P(128, -84 + bob), P(140, -62), P(136 + Math.sin(ph * 2) * 5, -36)], greyD, 4 * s, { level: 2, seed: 'tail' });
        leg(10, -62, Math.PI, grey, 10);
        leg(100, -60, 0, grey, 11);
        // the shafts, the cart, its load of oranges, the wheel turning
        st.line([P(20, -92 + bob), P(150, -74)], woodD, 4.4 * s, { level: 2, seed: 'shaft' });
        st.paint({ dir: 0.03 }, (g) => {
            g.fillStyle = wood;
            poly(g, [P(146, -104), P(300, -104), P(296, -58), P(150, -58)]);
            g.fillStyle = woodD;
            poly(g, [P(146, -70), P(298, -70), P(296, -58), P(150, -58)]);
            g.fillStyle = '#d2a868';
            poly(g, [P(146, -104), P(300, -104), P(300, -98), P(146, -98)]);
            g.fillStyle = woodD;
            [176, 208, 240, 272].forEach((px) => poly(g, [P(px, -98), P(px + 3, -98), P(px + 3, -70), P(px, -70)]));
        });
        st.paint({ dab: 1 }, (g) => {
            const rn = Motion.rng('cart-oranges');
            for (let i = 0; i < 46; i++) {
                const px = 196 + rn() * 96, py = -108 - rn() * rn() * 34 * (1 - Math.abs(px - 244) / 60);
                g.fillStyle = '#c96a10';
                ell(g, ...P(px, py), 6.4 * s, 6.2 * s);
                g.fillStyle = ['#f08a1e', '#f6a93a', '#e87a14'][i % 3];
                ell(g, ...P(px - 1, py - 1), 5 * s, 4.8 * s);
                g.fillStyle = '#ffd08a';
                ell(g, ...P(px - 2.2, py - 2.4), 1.6 * s, 1.3 * s);
            }
        });
        const wc = P(232, -40), R = 40 * s, rot = -ph * 0.9;
        st.paint({ dir: 0 }, (g) => { g.fillStyle = '#d9c9a4'; ell(g, wc[0], wc[1], R - 3 * s, R - 3 * s); });
        for (let i = 0; i < 8; i++) {
            const a = rot + (i * Math.PI) / 4;
            st.line([[wc[0], wc[1]], [wc[0] + Math.cos(a) * (R - 3 * s), wc[1] + Math.sin(a) * (R - 3 * s)]], woodD, 3.4 * s, { level: 2, seed: 'spoke' + i });
        }
        st.line(Array.from({ length: 25 }, (_, i) => [wc[0] + Math.cos((i / 24) * 6.2832) * R, wc[1] + Math.sin((i / 24) * 6.2832) * R]), '#3a2c22', 5.4 * s, { level: 2, seed: 'rim' });
        st.paint({ dir: 0 }, (g) => { g.fillStyle = '#3a2c22'; ell(g, wc[0], wc[1], 6 * s, 6 * s); });
        // the driver on the board: beret, blue smock, the reins in one fist, a switch in the other
        const db = Math.sin(ph * 2 + 0.6) * 2;
        st.paint({ dir: 1.4 }, (g) => {
            g.fillStyle = '#3a3f4c';
            poly(g, [P(160, -104), P(184, -104), P(176, -76), P(156, -80)]);
            g.fillStyle = '#4a6a92';
            poly(g, [P(158, -152 + db), P(190, -150 + db), P(192, -104), P(156, -104)]);
            g.fillStyle = '#35507a';
            poly(g, [P(178, -150 + db), P(190, -150 + db), P(192, -104), P(180, -104)]);
            g.fillStyle = '#d9a886';
            ell(g, ...P(170, -164 + db), 10 * s, 11.4 * s);
            g.fillStyle = '#b98468';
            ell(g, ...P(175, -162 + db), 5 * s, 9 * s);
            g.fillStyle = '#1f1d22';
            ell(g, ...P(171, -174 + db), 13.4 * s, 5.6 * s, -0.12);
            g.fillStyle = '#3a2a22';
            ell(g, ...P(163, -160 + db), 4.4 * s, 1.7 * s);
        });
        st.line([P(162, -138 + db), P(140, -120 + db), P(128, -112 + db)], '#4a6a92', 7 * s, { level: 2, seed: 'arm' });
        st.paint({ dir: 0 }, (g) => { g.fillStyle = '#d9a886'; ell(g, ...P(126, -111 + db), 4.6 * s, 4 * s); });
        st.line([P(126, -111 + db), P(60, -104 + bob), P(-8, -112 + bob * 1.6)], '#3a2c22', 1.7 * s, { level: 3, seed: 'reins' });
        st.line([P(176, -136 + db), P(150, -160 + db + Math.sin(ph) * 6), P(96, -176 + Math.sin(ph) * 14)], '#6a4a2a', 1.8 * s, { level: 3, seed: 'switch' });
    }

    // Anselmo at the door of his shop: apron, moustache, a hand on his hip and the other
    // waving. wave 0..1 raises the arm; d swings it.
    function anselmo(st, x, y, wave, d) {
        const sw = Math.sin(d * 1.5) * wave;
        st.paint({ dir: 0.4 }, (g) => { g.fillStyle = '#8d82a8'; poly(g, [[x - 12, y - 2], [x + 16, y - 2], [x + 64, y + 10], [x + 38, y + 13]]); });
        st.paint({ dir: 1.5 }, (g) => {
            g.fillStyle = '#3a3a48'; // trousers, shoes
            poly(g, [[x - 15, y - 84], [x + 15, y - 84], [x + 13, y - 6], [x + 2, y - 6], [x, y - 60], [x - 2, y - 6], [x - 13, y - 6]]);
            g.fillStyle = '#231f1e';
            ell(g, x - 9, y - 3, 9, 4);
            ell(g, x + 9, y - 3, 9, 4);
            g.fillStyle = '#a9c2d8'; // shirt, a belly
            poly(g, [[x - 21, y - 166], [x + 21, y - 166], [x + 23, y - 100], [x - 23, y - 100]]);
            g.fillStyle = '#86a2bc';
            poly(g, [[x + 6, y - 166], [x + 21, y - 166], [x + 23, y - 100], [x + 10, y - 100]]);
            g.fillStyle = '#f4eedd'; // the apron, tied at the waist, a pencil in its pocket
            poly(g, [[x - 14, y - 150], [x + 14, y - 150], [x + 20, y - 30], [x - 20, y - 30]]);
            g.fillStyle = '#d2cbbb';
            poly(g, [[x + 5, y - 150], [x + 14, y - 150], [x + 20, y - 30], [x + 9, y - 30]]);
            g.fillStyle = '#c9c2b0';
            g.fillRect(x - 21, y - 112, 42, 4);
            g.fillRect(x - 9, y - 96, 18, 16);
            g.fillStyle = '#d8a02a';
            g.fillRect(x - 5, y - 104, 2.4, 12);
            // neck, head: bald on top, a grey moustache, a grin
            g.fillStyle = '#c99278';
            g.fillRect(x - 6, y - 176, 12, 12);
            g.fillStyle = '#e0ac8c';
            ell(g, x, y - 190, 13.4, 15.4);
            g.fillStyle = '#c08a6e';
            g.beginPath();
            g.ellipse(x, y - 190, 13.4, 15.4, 0, -1.2, 1.5);
            g.fill();
            g.fillStyle = '#f4c8a8';
            ell(g, x - 3, y - 201, 7, 4);
            g.fillStyle = '#8a857e';
            ell(g, x - 12.4, y - 190, 3.4, 7);
            ell(g, x + 12.4, y - 190, 3.4, 7);
            g.fillStyle = '#2f2622';
            ell(g, x - 5, y - 192, 1.8, 1.6);
            ell(g, x + 4.4, y - 192, 1.7, 1.5);
            g.fillStyle = '#6a625c';
            ell(g, x - 0.4, y - 183.4, 8, 2.6);
            g.fillStyle = '#fbf6ea';
            ell(g, x - 0.4, y - 179.6, 4.6, 1.5);
        });
        // the arm on the hip
        st.line([[x + 20, y - 160], [x + 34, y - 132], [x + 20, y - 110]], '#86a2bc', 9, { level: 1, seed: 'hip' });
        st.paint({ dir: 0 }, (g) => { g.fillStyle = '#c99278'; ell(g, x + 19, y - 109, 5, 4.4); });
        // the arm that waves: rolled sleeve to the elbow, bare forearm, an open hand
        const up = wave, el = [x - 30 - 6 * up, y - 150 - 22 * up], a = -1.35 - 0.2 * up + sw * 0.5, wr = [el[0] + Math.cos(a) * 30 * (0.4 + 0.6 * up), el[1] + Math.sin(a) * 30 * (0.4 + 0.6 * up) + (1 - up) * 26];
        st.line([[x - 20, y - 160], el], '#a9c2d8', 9.4, { level: 1, seed: 'up' });
        st.line([el, wr], '#e0ac8c', 7, { level: 1, seed: 'fore' });
        const hx = wr[0] + Math.cos(a) * 7, hy = wr[1] + Math.sin(a) * 7;
        st.paint({ dir: 1.5 }, (g) => { g.fillStyle = '#e0ac8c'; g.beginPath(); g.ellipse(hx, hy, 6.4, 7.4, a + 1.57, 0, 7); g.fill(); });
        [-0.5, -0.17, 0.17, 0.5].forEach((f, i) => st.line([[hx + Math.cos(a + f) * 6, hy + Math.sin(a + f) * 6], [hx + Math.cos(a + f) * (13.4 - Math.abs(f) * 4), hy + Math.sin(a + f) * (13.4 - Math.abs(f) * 4)]], i % 2 ? '#e0ac8c' : '#f4c8a8', 2.4, { level: 3, seed: 'f' + i }));
    }

    // The street sweeper under the plane tree: cap, blue overall, a broom of twigs that
    // goes back and forth, a little dust at its end.
    function sweeper(st, x, y, d) {
        const sw = Math.sin(d * 0.9), lean = 0.1 + sw * 0.04;
        st.paint({ dir: 0.4 }, (g) => { g.fillStyle = '#8d82a8'; poly(g, [[x - 12, y - 2], [x + 16, y - 2], [x + 70, y + 10], [x + 40, y + 13]]); });
        st.paint({ dir: 1.5 }, (g) => {
            g.fillStyle = '#46597a'; // overall: legs apart, the body leaning into the broom
            poly(g, [[x - 16, y - 92], [x + 12, y - 92], [x + 16, y - 6], [x + 4, y - 6], [x - 1, y - 62], [x - 8, y - 6], [x - 20, y - 6]]);
            g.fillStyle = '#231f1e';
            ell(g, x - 15, y - 3, 9, 4);
            ell(g, x + 11, y - 3, 9, 4);
            g.fillStyle = '#5a7096';
            poly(g, [[x - 20 - lean * 60, y - 172], [x + 14 - lean * 60, y - 172], [x + 14, y - 90], [x - 18, y - 90]]);
            g.fillStyle = '#46597a';
            poly(g, [[x + 2 - lean * 60, y - 172], [x + 14 - lean * 60, y - 172], [x + 14, y - 90], [x + 4, y - 90]]);
            const hx = x - 6 - lean * 80, hy = y - 190;
            g.fillStyle = '#c99278';
            g.fillRect(hx - 5, hy + 10, 11, 10);
            g.fillStyle = '#dba888';
            ell(g, hx, hy, 12, 14);
            g.fillStyle = '#b98468';
            g.beginPath(); g.ellipse(hx, hy, 12, 14, 0, -1.2, 1.5); g.fill();
            g.fillStyle = '#3d4a66'; // a peaked cap pulled down
            ell(g, hx, hy - 9, 13.4, 6.4);
            poly(g, [[hx - 22, hy - 5], [hx - 4, hy - 8], [hx - 4, hy - 4]]);
            g.fillStyle = '#2f2622';
            ell(g, hx - 5, hy + 1, 1.7, 1.5);
            g.fillStyle = '#6a625c';
            ell(g, hx - 3, hy + 8, 6, 2);
        });
        // the broom: a long stick held in both hands, a head of twigs sweeping left and back
        const top = [x - 4 - lean * 60, y - 150], tip = [x - 86 + sw * 34, y - 14];
        st.line([top, tip], '#8a6a3a', 4, { level: 2, seed: 'stick' });
        for (let i = 0; i < 7; i++) st.line([tip, [tip[0] - 20 + i * 4 + sw * 6, tip[1] + 14 - Math.abs(i - 3) * 1.5]], i % 2 ? '#b08a3a' : '#8a6a2a', 2.4, { level: 3, seed: 'twig' + i });
        const h1 = [top[0] + (tip[0] - top[0]) * 0.18, top[1] + (tip[1] - top[1]) * 0.18], h2 = [top[0] + (tip[0] - top[0]) * 0.46, top[1] + (tip[1] - top[1]) * 0.46];
        st.line([[x - 18 - lean * 60, y - 160], [h1[0] - 6, h1[1] - 14], h1], '#5a7096', 8.4, { level: 1, seed: 'a1' });
        st.line([[x + 10 - lean * 60, y - 160], [h2[0] + 16, h2[1] - 22], h2], '#46597a', 8.4, { level: 1, seed: 'a2' });
        st.paint({ dir: 0 }, (g) => {
            g.fillStyle = '#dba888';
            ell(g, h1[0], h1[1], 5, 4.4);
            ell(g, h2[0], h2[1], 5, 4.4);
            g.fillStyle = '#e9dcc0'; // dust lifting where the twigs pass
            for (let i = 0; i < 5; i++) ell(g, tip[0] - 24 - i * 9 + sw * 10, tip[1] + 8 - i * 3 - Math.abs(sw) * 6, 5 - i * 0.6, 3.4 - i * 0.4);
        });
    }

    // A boy running to the right behind his hoop, driving it with a stick. s: size.
    function boy(st, x, y, s, d) {
        const P = (px, py) => [x + px * s, y + py * s], ph = d * 1.55, up = Math.abs(Math.sin(ph)) * 7;
        st.paint({ dir: 0.2 }, (g) => { g.fillStyle = '#8d82a8'; ell(g, ...P(22, 2), 62 * s, 6 * s); });
        const leg = (phase, col, shoe) => {
            const a = Math.sin(ph + phase) * 0.95, k = Math.max(0, -Math.sin(ph + phase - 0.6)) * 1.3;
            const knee = [Math.sin(a) * 30, -62 - up + Math.cos(a) * 30], foot = [knee[0] + Math.sin(a - k) * 32, knee[1] + Math.cos(a - k) * 32];
            st.line([P(0, -62 - up), P(...knee), P(...foot)], col, 8.4 * s, { level: 1, seed: 'bl' + phase });
            st.line([P(foot[0] - 2, foot[1]), P(foot[0] + 8, foot[1] + 1)], shoe, 5.4 * s, { level: 2, seed: 'bs' + phase });
        };
        leg(Math.PI, '#c9957a', '#5a4032');
        st.paint({ dir: 1.4 }, (g) => {
            g.fillStyle = '#5a6a8a'; // short trousers, a white shirt flying, braces
            poly(g, [P(-12, -84 - up), P(13, -84 - up), P(15, -56 - up), P(-13, -56 - up)]);
            g.fillStyle = '#f6f1e2';
            poly(g, [P(-12, -132 - up), P(16, -128 - up), P(14, -82 - up), P(-18, -82 - up)]);
            g.fillStyle = '#cfc9d8';
            poly(g, [P(-18, -100 - up), P(-12, -132 - up), P(-4, -130 - up), P(-8, -82 - up), P(-18, -82 - up)]);
            g.fillStyle = '#8a3a2a';
            poly(g, [P(2, -130 - up), P(6, -130 - up), P(8, -84 - up), P(4, -84 - up)]);
            g.fillStyle = '#e6b494'; // head forward, mouth open, hair blown back
            ell(g, ...P(10, -148 - up), 12.4 * s, 13.4 * s);
            g.fillStyle = '#3a2a20';
            g.beginPath(); g.ellipse(...P(7, -152 - up), 13 * s, 12 * s, -0.3, Math.PI * 0.75, Math.PI * 1.9); g.fill();
            poly(g, [P(-4, -160 - up), P(-20, -156 - up), P(-4, -150 - up)]);
            ell(g, ...P(16, -150 - up), 1.7 * s, 1.6 * s);
            g.fillStyle = '#8a3a34';
            ell(g, ...P(18, -141 - up), 2.6 * s, 2 * s);
        });
        leg(0, '#e6b494', '#3a2a22');
        // the arm with the stick, and the hoop bowling along ahead of him
        st.line([P(4, -124 - up), P(26, -108 - up), P(44, -100 - up)], '#f6f1e2', 7 * s, { level: 1, seed: 'barm' });
        st.paint({ dir: 0 }, (g) => { g.fillStyle = '#e6b494'; ell(g, ...P(46, -99 - up), 4.4 * s, 4 * s); });
        st.line([P(46, -99 - up), P(86, -52)], '#7a5a34', 2.4 * s, { level: 3, seed: 'bstick' });
        const hc = P(104, -38 - Math.abs(Math.sin(ph * 0.7)) * 3), R = 38 * s;
        st.line(Array.from({ length: 27 }, (_, i) => [hc[0] + Math.cos((i / 26) * 6.2832) * R, hc[1] + Math.sin((i / 26) * 6.2832) * R]), '#3a3238', 3.6 * s, { level: 2, seed: 'hoop' });
        st.line(Array.from({ length: 8 }, (_, i) => [hc[0] + Math.cos(-2.4 + (i / 7) * 1.1) * (R - 1.6 * s), hc[1] + Math.sin(-2.4 + (i / 7) * 1.1) * (R - 1.6 * s)]), '#b9b4c0', 1.5 * s, { level: 3, seed: 'hoopl' });
    }

    return { cart, anselmo, sweeper, boy };
})();
