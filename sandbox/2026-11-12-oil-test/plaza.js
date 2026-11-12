// The square the old man looks at, as two studies on the same geometry: «now» (an overcast
// winter morning: the shop shut, a car parked in front, the plane tree bare) and «then»
// (a summer noon in 1974: the shop open under its awning, the tree in leaf, a bicycle
// against it, her at the door of the house). Oil.lay turns each into brush strokes.
const Plaza = (() => {
    const BOX = { x: -230, y: -30, w: 2060, h: 960 }; // wider than the frame: the head turns
    const GROUND = 600; // foot of the buildings
    const VP = [800, 500];

    // the present is painted out of focus (Oil.lay's blur) and with wide brushes only: it
    // never gets finished
    const NOW = [
        { w: 96, len: 2.4, gap: 0.5, tol: 0, edge: 60, jit: [0.05, 4, 0.1, 0], load: 1.3 },
        { w: 50, len: 2.6, gap: 0.55, tol: 7, edge: 40, jit: [0.05, 4, 0.1, 0], load: 1.15 },
        { w: 27, len: 2.8, gap: 0.6, tol: 10, edge: 30, jit: [0.045, 4, 0.1, 0], load: 1 },
    ];

    const poly = (g, pts) => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.fill();
    };
    const ell = (g, x, y, a, b, rot = 0) => {
        g.beginPath();
        g.ellipse(x, y, a, b, rot, 0, 7);
        g.fill();
    };
    const grad = (g, x0, y0, x1, y1, stops) => {
        const gr = g.createLinearGradient(x0, y0, x1, y1);
        stops.forEach(([o, c]) => gr.addColorStop(o, c));
        return gr;
    };
    const circle = (cx, cy, r, n = 18, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(a0 + ((a1 - a0) * i) / n) * r, cy + Math.sin(a0 + ((a1 - a0) * i) / n) * r]);

    const WINDOWS = [830, 1210, 1575];
    const BRANCHES = [
        [[352, 338], [302, 250], [242, 170], [182, 78]], [[358, 338], [412, 240], [472, 150], [542, 58]], [[354, 332], [350, 220], [338, 110], [330, 8]],
        [[272, 212], [202, 200], [128, 168]], [[242, 170], [252, 100], [236, 26]], [[440, 196], [522, 190], [596, 158]], [[472, 150], [452, 80], [462, 6]], [[345, 172], [390, 110], [422, 38]],
        [[302, 250], [226, 262], [160, 244]], [[412, 240], [486, 262], [552, 250]],
    ];
    const BW = [22, 20, 18, 10, 9, 10, 8, 8, 9, 9];

    function sky(st, T) {
        st.paint({ dir: 0.1 }, (g) => {
            g.fillStyle = T ? grad(g, 0, -30, 0, 560, [[0, '#3f84cc'], [0.55, '#86b8e0'], [1, '#d3e2e0']]) : grad(g, 0, -30, 0, 560, [[0, '#b4b5b8'], [0.6, '#c4c3c0'], [1, '#cfccc4']]);
            g.fillRect(-230, -30, 880, 640);
        });
        st.paint({ dir: 0.05, dab: 0.45 }, (g) => {
            if (T) {
                g.fillStyle = '#cfd6e6';
                [[6, 368, 110, 17], [470, 330, 150, 20]].forEach((e) => ell(g, ...e));
                g.fillStyle = '#f2ebdc';
                [[-4, 356, 96, 16], [62, 366, 58, 12], [480, 318, 120, 16], [560, 330, 64, 12]].forEach((e) => ell(g, ...e));
            } else {
                g.fillStyle = '#a6a7ab';
                [[120, 120, 260, 46], [520, 250, 210, 34], [60, 330, 180, 28]].forEach((e) => ell(g, ...e));
                g.fillStyle = '#d6d4cd';
                [[380, 180, 170, 26], [200, 400, 220, 20]].forEach((e) => ell(g, ...e));
            }
        });
    }

    function farHouses(st, T) {
        const c = (now, then) => (T ? then : now);
        const houses = [[-230, -84, 452, 418], [-90, 112, 440, 402], [185, 332, 456, 424], [330, 482, 432, 396], [480, 626, 466, 438]];
        const walls = T ? ['#eadcc0', '#f4ead2', '#ead8b4', '#f6eedb', '#e9c9a2'] : ['#8f8d90', '#99979a', '#8d8a8a', '#a09d9c', '#88858a'];
        st.paint({ dir: 1.5 }, (g) => {
            // the tower of the church
            g.fillStyle = c('#8a888f', '#e8d6ae');
            g.fillRect(130, 372, 56, 228);
            g.fillStyle = c('#77767e', '#b8aecb');
            g.fillRect(168, 372, 18, 228);
            houses.forEach(([x0, x1, y], i) => {
                g.fillStyle = walls[i];
                g.fillRect(x0, y, x1 - x0, GROUND - y);
            });
        });
        st.paint({ dir: 0.05 }, (g) => {
            g.fillStyle = c('#6f6a70', '#c06f48');
            poly(g, [[122, 374], [194, 374], [158, 318]]);
            houses.forEach(([x0, x1, y, yr]) => {
                g.fillStyle = c('#77706f', '#c97b4e');
                poly(g, [[x0 - 6, y], [x1 + 6, y], [x1 - 8, yr], [x0 + 8, yr]]);
                g.fillStyle = c('#6b676b', '#a89cc0'); // the eaves' shadow
                g.fillRect(x0, y, x1 - x0, T ? 9 : 6);
            });
            // windows, doors
            g.fillStyle = c('#5d5b62', '#3c4656');
            [[-190, 490, 22, 34], [-140, 490, 22, 34], [-40, 480, 22, 34], [10, 480, 22, 34], [62, 480, 22, 34], [222, 490, 24, 36], [282, 490, 24, 36], [372, 464, 24, 36], [432, 464, 24, 36], [520, 500, 22, 32], [576, 500, 22, 32]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
            g.fillStyle = c('#66626a', '#3f7d6e');
            [[30, 548, 30, 52], [244, 552, 30, 48]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
            g.fillStyle = c('#64606a', '#9a4f33');
            g.fillRect(396, 548, 32, 52);
        });
        // a garden wall with a bougainvillea pouring over it
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = c('#827f80', '#efe3c6');
            g.fillRect(452, 536, 172, 64);
            g.fillStyle = c('#706d70', '#a79dc2');
            g.fillRect(452, 588, 172, 12);
        });
        st.paint({ dab: 1 }, (g) => {
            const rn = Motion.rng('bougainvillea');
            for (let i = 0; i < 46; i++) {
                const x = 470 + rn() * 150, y = 506 + rn() * rn() * 70;
                g.fillStyle = T ? ['#c8328a', '#e0559c', '#a02474', '#3d7a48', '#5c9a4e'][Math.floor(rn() * 5)] : ['#6e6a66', '#5d5a58', '#7b756e'][Math.floor(rn() * 3)];
                ell(g, x, y, 9 + rn() * 9, 6 + rn() * 6, rn() * 3);
            }
        });
    }

    function ground(st, T) {
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = T ? grad(g, 0, GROUND, 0, 930, [[0, '#dfcb9c'], [0.5, '#d6bd88'], [1, '#c9a974']]) : grad(g, 0, GROUND, 0, 930, [[0, '#9a9893'], [0.5, '#8d8a86'], [1, '#7a7774']]);
            g.fillRect(-230, GROUND, 2060, 330);
            g.fillStyle = T ? '#b7a57f' : '#5f5c5a'; // where wall meets ground
            g.fillRect(-230, GROUND - 2, 2060, 7);
        });
        if (T) {
            // flagstones running to the vanishing point
            for (let x = -800; x <= 2400; x += 200) {
                const a = [VP[0] + (x - VP[0]) * 0.26, 612], b = [x, 930];
                st.line([a, b], '#bfa675', 3, { level: 3 });
            }
            [[636, 3], [690, 3.5], [776, 4]].forEach(([y, w]) => st.line([[-230, y], [1830, y]], '#bda472', w, { level: 3 }));
            // warm patches where the sun bounces
            st.paint({ dir: 0.03, dab: 0.2 }, (g) => {
                g.fillStyle = '#ecd9a6';
                [[1250, 700, 210, 22], [1480, 820, 180, 26], [120, 720, 150, 18]].forEach((e) => ell(g, ...e));
                g.fillStyle = '#cdb07c';
                [[980, 870, 240, 24], [300, 880, 220, 20]].forEach((e) => ell(g, ...e));
            });
        } else {
            // a wet morning: pale sky lying on the paving, darker under the car and the tree
            st.paint({ dir: 1.52, dab: 0.1 }, (g) => {
                g.fillStyle = '#a9a8a4';
                [[160, 720, 170, 60], [520, 800, 150, 54], [1420, 760, 200, 66]].forEach((e) => ell(g, ...e));
                g.fillStyle = '#b9b8b3';
                [[150, 716, 90, 34], [1440, 756, 110, 36]].forEach((e) => ell(g, ...e));
                g.fillStyle = '#5c5a59';
                [[980, 720, 250, 50], [360, 700, 70, 30]].forEach((e) => ell(g, ...e));
            });
            st.paint({ dir: 0.01 }, (g) => {
                g.fillStyle = '#978b5c'; // the yellow line along the kerb
                g.fillRect(660, 676, 700, 9);
            });
        }
    }

    function wall(st, T) {
        const c = (now, then) => (T ? then : now);
        st.paint({ dir: 1.45, dab: 0.12 }, (g) => {
            g.fillStyle = T ? grad(g, 0, -30, 0, 600, [[0, '#e4dac2'], [1, '#ebddb8']]) : grad(g, 0, -30, 0, 600, [[0, '#958d82'], [1, '#9d9588']]);
            g.fillRect(622, -30, 1210, 630);
            // lime-wash laid on unevenly; damp and soot now
            g.globalAlpha = 0.5;
            const rn = Motion.rng('wall-patches');
            for (let i = 0; i < 20; i++) {
                g.fillStyle = T ? ['#f2e8cc', '#ecd3b8', '#dcdfd6', '#f0e0ac'][i % 4] : ['#8b847b', '#b0a89b', '#928a7f', '#7f7972'][i % 4];
                ell(g, 660 + rn() * 1150, -10 + rn() * 520, 60 + rn() * 90, 30 + rn() * 60, rn() * 3);
            }
            g.globalAlpha = 1;
            if (!T) {
                g.fillStyle = '#7a746d'; // rain streaks under the balconies and the cornice
                [[790, 250, 16, 36], [868, 250, 12, 30], [1170, 250, 14, 34], [1246, 250, 12, 30], [1000, 296, 20, 30]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
            }
        });
        st.paint({ dir: 0.02 }, (g) => {
            // the corner of the building against the sky
            g.fillStyle = c('#7e7870', '#b9b0cb');
            g.fillRect(622, -30, 12, 630);
            // string course
            g.fillStyle = c('#b3ab9d', '#f3ead2');
            g.fillRect(622, 282, 1210, 9);
            g.fillStyle = c('#76716b', '#aba1c4');
            g.fillRect(622, 291, 1210, 6);
            // plinth
            g.fillStyle = c('#77726c', '#c99c58');
            g.fillRect(622, 546, 1210, 54);
            g.fillStyle = c('#8a847c', '#ddb573');
            g.fillRect(622, 546, 1210, 6);
        });
    }

    function balcony(st, T, cx, sign) {
        const c = (now, then) => (T ? then : now);
        const x0 = cx - 55, x1 = cx + 55;
        if (T) {
            st.paint({ dir: 0.5 }, (g) => {
                g.fillStyle = '#b5abcb'; // shadow of the slab and the shutter, thrown right and down
                poly(g, [[cx - 78, 248], [cx + 78, 248], [cx + 112, 282], [cx - 44, 282]]);
                poly(g, [[x1 + 50, 62], [x1 + 76, 84], [x1 + 76, 236], [x1 + 50, 236]]);
            });
        } else {
            st.paint({ dir: 1.5 }, (g) => {
                g.fillStyle = '#b3aa9b'; // paler wall where the shutters hung
                g.fillRect(x0 - 50, 60, 48, 176);
                g.fillRect(x1 + 2, 60, 48, 176);
            });
        }
        st.paint({ dir: 1.55 }, (g) => {
            g.fillStyle = c('#c0b7a6', '#f4ecd8'); // stone surround
            g.fillRect(x0 - 7, 52, 124, 190);
            if (T) {
                g.fillStyle = '#26323d';
                g.fillRect(x0, 60, 110, 176);
                g.fillStyle = '#ece8dc'; // a lace curtain, half drawn
                g.fillRect(x0, 60, 48, 176);
                g.fillStyle = '#c6c5d2';
                [x0 + 12, x0 + 27, x0 + 40].forEach((x) => g.fillRect(x, 60, 5, 176));
                g.fillStyle = '#4b5d6c';
                g.fillRect(x0 + 48, 60, 62, 60);
            } else {
                g.fillStyle = '#8f8b80'; // the blind down
                g.fillRect(x0, 60, 110, 176);
                g.fillStyle = '#7c786f';
                for (let y = 72; y < 236; y += 22) g.fillRect(x0, y, 110, 5);
            }
        });
        if (T) {
            st.paint({ dir: 0.03 }, (g) => {
                // shutters folded back against the wall, slatted
                [[x0 - 52, '#438a5c', '#2f6a45'], [x1 + 2, '#4a9464', '#357550']].forEach(([x, a, b]) => {
                    g.fillStyle = a;
                    g.fillRect(x, 60, 50, 176);
                    g.fillStyle = b;
                    for (let y = 68; y < 232; y += 11) g.fillRect(x + 4, y, 42, 4);
                    g.fillRect(x + 46, 60, 4, 176);
                });
            });
        }
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = c('#89837a', '#e9dcbc'); // the slab
            g.fillRect(cx - 78, 236, 156, 12);
            g.fillStyle = c('#625e5a', '#9d93b6');
            g.fillRect(cx - 78, 244, 156, 5);
        });
        // iron rail
        if (T) {
            for (let x = cx - 74; x <= cx + 74; x += 13) st.line([[x, 184], [x, 236]], '#2b2a2e', 2.6, { level: 4 });
            st.line([[cx - 77, 182], [cx + 77, 182]], '#2b2a2e', 4.5, { level: 3 });
        } else {
            // without his glasses the bars are one dark veil
            st.paint({ dir: 0.02 }, (g) => {
                g.fillStyle = 'rgba(70, 64, 60, 0.55)';
                g.fillRect(cx - 77, 186, 154, 50);
                g.fillStyle = '#4b4541';
                g.fillRect(cx - 79, 178, 158, 9);
            });
        }
        if (T) {
            // geraniums in pots hung from the rail
            st.paint({ dab: 1 }, (g) => {
                const rn = Motion.rng('geranium' + cx);
                [cx - 54, cx - 8, cx + 44].forEach((px) => {
                    g.fillStyle = '#b8603a';
                    poly(g, [[px - 13, 204], [px + 13, 204], [px + 9, 228], [px - 9, 228]]);
                    g.fillStyle = '#8f4428';
                    poly(g, [[px + 3, 204], [px + 13, 204], [px + 9, 228], [px + 3, 228]]);
                    for (let i = 0; i < 16; i++) {
                        g.fillStyle = ['#3f8a45', '#2f6f3c', '#63a650'][i % 3];
                        ell(g, px + (rn() - 0.5) * 44, 196 - rn() * 22, 8, 5, rn() * 3);
                    }
                    for (let i = 0; i < 9; i++) {
                        g.fillStyle = ['#e23a2e', '#f0584a', '#c9202a', '#f49ab0'][i % 4];
                        ell(g, px + (rn() - 0.5) * 40, 186 - rn() * 26, 5.5, 4.5, rn() * 3);
                    }
                });
            });
        } else if (sign) {
            st.paint({ dir: 0.02 }, (g) => {
                g.fillStyle = '#b97f34'; // SE VENDE
                g.fillRect(cx - 52, 188, 104, 42);
                g.fillStyle = '#3d3229';
                g.fillRect(cx - 42, 196, 84, 9);
                g.fillRect(cx - 36, 213, 72, 7);
            });
        }
    }

    function shop(st, T) {
        const X0 = 730, X1 = 1110, Y0 = 330;
        // signboard
        st.paint({ dir: 0.01 }, (g) => {
            g.fillStyle = T ? '#2d5a45' : '#8b857a';
            g.fillRect(792, 298, 258, 26);
            g.fillStyle = T ? '#f2e6c4' : '#9a9488';
            const rn = Motion.rng('letters');
            for (let x = 808; x < 1036; x += 19) g.fillRect(x + rn() * 3, 304, 10 + rn() * 4, 14);
        });
        if (!T) {
            st.paint({ dir: 0.01 }, (g) => {
                g.fillStyle = '#a8a196'; // stone surround
                g.fillRect(X0 - 10, Y0 - 8, X1 - X0 + 20, 278);
                g.fillStyle = '#70757a'; // the metal shutter, down
                g.fillRect(X0, Y0, X1 - X0, 270);
                g.fillStyle = '#62676c';
                for (let y = Y0 + 12; y < 600; y += 20) g.fillRect(X0, y, X1 - X0, 6);
                g.fillStyle = '#55595d';
                g.fillRect(X0, 584, X1 - X0, 16);
            });
            // somebody's tag across it
            st.line([[770, 500], [800, 430], [826, 500], [858, 436], [886, 496], [930, 470], [900, 440], [960, 430]], '#8a5a86', 9, { level: 2 });
            st.line([[980, 500], [1010, 440], [1050, 494], [1070, 450]], '#5f7f96', 8, { level: 2 });
            return;
        }
        st.paint({ dir: 1.55 }, (g) => {
            g.fillStyle = '#f3ead2'; // surround
            g.fillRect(X0 - 10, Y0 - 8, X1 - X0 + 20, 278);
            g.fillStyle = grad(g, 0, Y0, 0, 600, [[0, '#181b2a'], [1, '#322a36']]);
            g.fillRect(X0, Y0, X1 - X0, 270);
            // the floor inside catches some light at the way in
            g.fillStyle = '#6d5540';
            poly(g, [[1000, 600], [1104, 600], [1090, 566], [1014, 566]]);
            g.fillStyle = '#3d3442';
            g.fillRect(940, 430, 150, 136); // a doorway to the back room
            g.fillStyle = '#7a8b8e';
            g.fillRect(1010, 448, 44, 56); // its window, far away
        });
        // shelves with tins and jars
        st.paint({ dir: 1.55 }, (g) => {
            const rn = Motion.rng('tins');
            [420, 462, 504].forEach((y) => {
                for (let x = 752; x < 926; x += 13 + rn() * 6) {
                    const h = 16 + rn() * 14;
                    g.fillStyle = ['#d8b23a', '#b8452e', '#d9d2bd', '#5d8f6a', '#c97f2e', '#8fa9b8', '#e8dfc9'][Math.floor(rn() * 7)];
                    g.fillRect(x, y - h, 9 + rn() * 3, h);
                }
            });
        });
        [420, 462, 504].forEach((y) => st.line([[748, y + 2], [930, y + 2]], '#a37a44', 3.5, { level: 3 }));
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = '#5f4129'; // counter
            g.fillRect(748, 520, 196, 80);
            g.fillStyle = '#b98a55';
            g.fillRect(744, 516, 204, 7);
            g.fillStyle = '#c9c2a8'; // the scales on it
            ell(g, 900, 506, 20, 5);
            g.fillRect(897, 482, 5, 26);
        });
        // a string of dried peppers by the door
        st.paint({ dab: 1 }, (g) => {
            const rn = Motion.rng('peppers');
            for (let i = 0; i < 16; i++) {
                g.fillStyle = ['#b22a22', '#d4402c', '#8f1f1e'][i % 3];
                ell(g, 1094 + (rn() - 0.5) * 12, 412 + i * 6.5, 6, 4, rn() * 3);
            }
        });
        st.paint({ dir: 1.55 }, (g) => {
            g.fillStyle = '#3f8058'; // door posts
            g.fillRect(X0 - 4, Y0, 12, 270);
            g.fillRect(X1 - 8, Y0, 12, 270);
            g.fillStyle = '#5aa371';
            g.fillRect(X0 - 4, Y0, 4, 270);
            g.fillRect(X1 - 8, Y0, 4, 270);
        });
        // crates of fruit on trestles, in the sun
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = '#9086ab'; // their shadow on the ground
            poly(g, [[742, 600], [1000, 600], [1040, 628], [790, 628]]);
        });
        [[744, 548], [770, 590], [960, 548], [986, 590]].forEach(([x, y]) => st.line([[x, y], [x + (y > 560 ? 0 : 26), y > 560 ? 604 : 590]], '#4a3524', 4, { level: 3 }));
        const fruit = [['#f08a1e', '#f6a93a', '#d96c12'], ['#f2d43a', '#f8e77a', '#cdb02a'], ['#d83a2a', '#ee5a40', '#5b9a45']];
        [744, 830, 916].forEach((x0, k) => {
            st.paint({ dir: 0.02 }, (g) => {
                g.fillStyle = '#c79a5c';
                poly(g, [[x0, 538], [x0 + 76, 538], [x0 + 82, 590], [x0 - 6, 590]]);
                g.fillStyle = '#8d6738';
                poly(g, [[x0 - 4, 574], [x0 + 80, 574], [x0 + 82, 590], [x0 - 6, 590]]);
                g.fillStyle = '#e0b877';
                g.fillRect(x0, 536, 76, 5);
            });
            st.paint({ dab: 1 }, (g) => {
                const rn = Motion.rng('fruit' + k);
                for (let i = 0; i < 22; i++) {
                    g.fillStyle = fruit[k][Math.floor(rn() * 3)];
                    ell(g, x0 + 9 + rn() * 58, 546 + rn() * 24, 7.5, 7, 0);
                }
                // a light on each
                g.fillStyle = k === 1 ? '#fdf6c0' : '#fbd2a0';
                for (let i = 0; i < 7; i++) ell(g, x0 + 9 + rn() * 58, 546 + rn() * 20, 2.6, 2.2, 0);
            });
        });
        // the awning: cream and green stripes, a scalloped valance, shade under it
        st.paint({ dir: 0.9 }, (g) => {
            g.fillStyle = '#aba1c6';
            poly(g, [[1118, 336], [1160, 402], [1204, 436], [1204, 546], [1118, 546]]);
            g.fillStyle = '#8f7f9e';
            poly(g, [[1118, 546], [1204, 546], [1204, 600], [1118, 600]]);
        });
        const n = 12, top = [706, 1134, 322], front = [682, 1158, 398];
        st.paint({ dir: 1.35 }, (g) => {
            for (let i = 0; i < n; i++) {
                const a = i / n, b = (i + 1) / n;
                const tx0 = top[0] + (top[1] - top[0]) * a, tx1 = top[0] + (top[1] - top[0]) * b, fx0 = front[0] + (front[1] - front[0]) * a, fx1 = front[0] + (front[1] - front[0]) * b;
                g.fillStyle = i % 2 ? '#4d9265' : '#f1e7cc';
                poly(g, [[tx0, top[2]], [tx1 + 0.5, top[2]], [fx1 + 0.5, front[2]], [fx0, front[2]]]);
                g.fillStyle = i % 2 ? '#3a7650' : '#d8cfb6';
                g.beginPath();
                g.moveTo(fx0, front[2] - 1);
                g.lineTo(fx1 + 0.5, front[2] - 1);
                g.lineTo(fx1 + 0.5, front[2] + 12);
                g.quadraticCurveTo((fx0 + fx1) / 2, front[2] + 26, fx0, front[2] + 12);
                g.fill();
            }
        });
        st.line([[682, 398], [1158, 398]], '#f6eedc', 3, { level: 4 });
    }

    function door(st, T) {
        const X0 = 1250, X1 = 1400, Y0 = 344;
        st.paint({ dir: 1.55 }, (g) => {
            g.fillStyle = T ? '#f3ead2' : '#b5ad9f';
            g.fillRect(X0 - 12, Y0 - 12, X1 - X0 + 24, 268);
            if (T) {
                // one leaf open onto the dark hall, the other shut
                g.fillStyle = grad(g, 0, Y0, 0, 600, [[0, '#161a28'], [1, '#2b2733']]);
                g.fillRect(X0, Y0, 78, 256);
                g.fillStyle = '#57606e'; // the patio at the far end of the hall
                g.fillRect(X0 + 22, 430, 30, 60);
                g.fillStyle = '#8a7a6a';
                poly(g, [[X0, 600], [X0 + 78, 600], [X0 + 60, 578], [X0 + 14, 578]]);
                g.fillStyle = '#3f736c';
                g.fillRect(X0 + 78, Y0, 72, 256);
                g.fillStyle = '#2f5a55';
                [[X0 + 88, Y0 + 14, 52, 96], [X0 + 88, Y0 + 124, 52, 118]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
                g.fillStyle = '#4f8a82';
                [[X0 + 92, Y0 + 18, 44, 88], [X0 + 92, Y0 + 128, 44, 110]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
                g.fillStyle = '#d9b24a';
                ell(g, X0 + 90, 478, 4.5, 6);
            } else {
                g.fillStyle = '#5c564e';
                g.fillRect(X0, Y0, 150, 256);
                g.fillStyle = '#4b463f';
                [[X0 + 10, Y0 + 14, 56, 228], [X0 + 84, Y0 + 14, 56, 228]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
                g.fillStyle = '#676157';
                [[X0 + 16, Y0 + 20, 44, 216], [X0 + 90, Y0 + 20, 44, 216]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
            }
        });
        if (T) {
            st.paint({ dir: 0.02 }, (g) => {
                g.fillStyle = '#4f79b5'; // the house number, a blue tile
                g.fillRect(1424, 392, 22, 22);
                g.fillStyle = '#f3ecd8';
                g.fillRect(1430, 397, 10, 12);
            });
        }
        // the street lamp on its bracket
        const iron = T ? '#26252a' : '#4a4643';
        st.line([[1196, 296], [1196, 262], [1168, 262]], iron, T ? 4 : 7, { level: T ? 3 : 2 });
        st.paint({ dir: 1.5 }, (g) => {
            g.fillStyle = iron;
            poly(g, [[1156, 262], [1180, 262], [1176, 302], [1160, 302]]);
            g.fillStyle = T ? '#dfe6e2' : '#8f8d88';
            poly(g, [[1161, 268], [1175, 268], [1173, 296], [1163, 296]]);
        });
    }

    // She stands in the doorway, a basket on her arm, a hand shading her eyes: looking this way.
    function woman(st, x, y) {
        const skin = '#f0c8a2', skinS = '#c9957a', dress = '#f3e6ac', dressS = '#d8b96c', dressV = '#b9a2b4';
        st.paint({ dir: 0.5 }, (g) => {
            g.fillStyle = '#8d82a8'; // her shadow, thrown right
            poly(g, [[x - 8, y - 2], [x + 14, y - 2], [x + 96, y + 20], [x + 66, y + 24]]);
        });
        st.paint({ dir: 1.5 }, (g) => {
            // legs and shoes
            g.fillStyle = skin;
            poly(g, [[x - 11, y - 44], [x - 3, y - 44], [x - 4, y - 5], [x - 10, y - 5]]);
            g.fillStyle = skinS;
            poly(g, [[x + 3, y - 44], [x + 11, y - 44], [x + 10, y - 5], [x + 4, y - 5]]);
            g.fillStyle = '#3a2a24';
            ell(g, x - 8, y - 2, 7, 3.5);
            ell(g, x + 8, y - 2, 7, 3.5);
            // skirt, then bodice: lit from the left
            g.fillStyle = dress;
            poly(g, [[x - 14, y - 118], [x + 14, y - 118], [x + 30, y - 42], [x - 29, y - 42]]);
            g.fillStyle = dressS;
            poly(g, [[x + 3, y - 118], [x + 14, y - 118], [x + 30, y - 42], [x + 8, y - 42]]);
            g.fillStyle = dressV;
            poly(g, [[x + 13, y - 100], [x + 19, y - 96], [x + 30, y - 42], [x + 21, y - 42]]);
            g.fillStyle = '#fbf3d2';
            poly(g, [[x - 13, y - 112], [x - 6, y - 112], [x - 15, y - 46], [x - 26, y - 46]]);
            g.fillStyle = dress;
            poly(g, [[x - 18, y - 164], [x + 18, y - 164], [x + 14, y - 116], [x - 14, y - 116]]);
            g.fillStyle = dressS;
            poly(g, [[x + 4, y - 164], [x + 18, y - 164], [x + 14, y - 116], [x + 6, y - 116]]);
            g.fillStyle = '#b8563e'; // a belt
            g.fillRect(x - 14, y - 121, 28, 5);
            // neck and head
            g.fillStyle = skinS;
            g.fillRect(x - 4, y - 174, 9, 12);
            g.fillStyle = skin;
            ell(g, x, y - 184, 11, 13.5);
            g.fillStyle = skinS;
            g.beginPath();
            g.ellipse(x, y - 184, 11, 13.5, 0, -1.3, 1.5);
            g.fill();
            // dark hair gathered in a bun
            g.fillStyle = '#3b2a22';
            g.beginPath();
            g.ellipse(x + 1, y - 188, 12.5, 13, 0, Math.PI * 0.95, Math.PI * 2.25);
            g.fill();
            ell(g, x + 12, y - 190, 6.5, 6);
            g.fillStyle = '#6a4a36';
            ell(g, x - 3, y - 197, 6, 2.6, -0.3);
        });
        // the arm that holds the basket
        st.line([[x + 17, y - 160], [x + 24, y - 132], [x + 20, y - 108]], skinS, 7.5, { level: 4 });
        st.paint({ dir: 0.3, dab: 0.3 }, (g) => {
            g.fillStyle = '#b98a48';
            poly(g, [[x + 6, y - 104], [x + 40, y - 104], [x + 35, y - 80], [x + 11, y - 80]]);
            g.fillStyle = '#8d6430';
            poly(g, [[x + 24, y - 104], [x + 40, y - 104], [x + 35, y - 80], [x + 25, y - 80]]);
            g.fillStyle = '#e7d9b5'; // a loaf and some greens
            ell(g, x + 18, y - 107, 9, 4.5, -0.2);
            g.fillStyle = '#5c9a4a';
            ell(g, x + 32, y - 109, 6, 5);
        });
        st.line([[x + 8, y - 104], [x + 22, y - 116], [x + 38, y - 104]], '#8d6430', 2.6, { level: 4 });
        // the arm raised to her brow, sleeve first
        st.paint({ dir: 0.8 }, (g) => {
            g.fillStyle = dress;
            poly(g, [[x - 19, y - 165], [x - 9, y - 160], [x - 22, y - 148], [x - 30, y - 156]]);
        });
        st.line([[x - 26, y - 152], [x - 31, y - 170], [x - 17, y - 192], [x - 8, y - 196]], skin, 6.5, { level: 4 });
        st.line([[x - 12, y - 196], [x - 2, y - 197]], skin, 5, { level: 4 });
    }

    function bicycle(st, x, y) {
        const ink = '#25262b', r = 44;
        st.paint({ dir: 0.4 }, (g) => {
            g.fillStyle = '#857b9f';
            poly(g, [[x - 60, y + r], [x + 110, y + r], [x + 190, y + r + 26], [x + 10, y + r + 26]]);
        });
        [x - 62, x + 62].forEach((cx) => {
            st.line(circle(cx, y, r, 22), ink, 4, { level: 4 });
            st.line(circle(cx, y, r - 4, 22), '#9b9aa0', 1.8, { level: 4 });
            for (let i = 0; i < 6; i++) st.line([[cx + Math.cos(i * 1.05 + 0.3) * (r - 5), y + Math.sin(i * 1.05 + 0.3) * (r - 5)], [cx - Math.cos(i * 1.05 + 0.3) * (r - 5), y - Math.sin(i * 1.05 + 0.3) * (r - 5)]], '#8c8b92', 1.3, { level: 4 });
        });
        const seat = [x - 30, y - 62], bars = [x + 44, y - 70], crank = [x - 6, y + 2];
        [[[x - 62, y], seat], [seat, crank], [crank, [x - 62, y]], [seat, [x + 36, y - 54]], [crank, [x + 36, y - 54]], [[x + 36, y - 54], bars], [[x + 40, y - 62], [x + 62, y]]].forEach((l) => st.line(l, '#1f4f8f', 4.5, { level: 4 }));
        st.line([[seat[0] - 14, seat[1] - 4], [seat[0] + 12, seat[1] - 5]], '#4a2c1c', 6, { level: 4 });
        st.line([bars, [bars[0] + 16, bars[1] - 8], [bars[0] + 22, bars[1] + 2]], ink, 3.6, { level: 4 });
        st.line([[crank[0] - 9, crank[1] - 9], [crank[0] + 9, crank[1] + 9]], ink, 3.4, { level: 4 });
    }

    function tree(st, T) {
        const rn = Motion.rng('plane-tree');
        const trunk = [[336, 656], [388, 656], [374, 520], [368, 400], [374, 332], [334, 332], [340, 420], [344, 540]];
        if (T) {
            // its shade on the ground, full of holes
            st.paint({ dir: 0.02, dab: 0.3 }, (g) => {
                g.fillStyle = '#9186ae';
                [[560, 700, 330, 46], [420, 668, 150, 26], [760, 760, 260, 50], [330, 740, 170, 30]].forEach((e) => ell(g, ...e));
                g.fillStyle = '#7d7399';
                [[520, 706, 180, 22], [760, 770, 150, 24]].forEach((e) => ell(g, ...e));
                g.fillStyle = '#e6d3a0';
                for (let i = 0; i < 34; i++) ell(g, 300 + rn() * 680, 668 + rn() * 130, 10 + rn() * 26, 4 + rn() * 7, 0);
            });
        }
        st.paint({ dir: 1.5 }, (g) => {
            g.fillStyle = T ? '#a39d80' : '#3f3936';
            poly(g, trunk);
            g.fillStyle = T ? '#6a6456' : '#2e2927'; // the side away from the light
            poly(g, [[366, 656], [388, 656], [374, 520], [368, 400], [374, 332], [360, 332], [358, 420], [360, 540]]);
            // plane bark comes off in plates
            for (let i = 0; i < 20; i++) {
                g.fillStyle = T ? ['#d2cba6', '#7f7a5e', '#bfc09a', '#8f8f6c'][i % 4] : ['#6b655f', '#3f3936', '#5a544f'][i % 3];
                ell(g, 342 + rn() * 34, 345 + rn() * 300, 5 + rn() * 7, 10 + rn() * 16, (rn() - 0.5) * 0.4);
            }
        });
        if (!T) {
            // the twigs are a grey-violet haze against the sky; a few leaves held on
            st.paint({ dab: 1 }, (g) => {
                g.globalAlpha = 0.55;
                BRANCHES.forEach((b) => {
                    const [ex, ey] = b[b.length - 1];
                    g.fillStyle = ['#8f8b8d', '#99949a', '#858183'][Math.floor(rn() * 3)];
                    ell(g, ex + (rn() - 0.5) * 30, ey + (rn() - 0.5) * 20 - 10, 70 + rn() * 30, 46 + rn() * 20, rn() * 3);
                });
                g.globalAlpha = 1;
                for (let i = 0; i < 12; i++) {
                    g.fillStyle = ['#7a6248', '#84683f', '#665247'][i % 3];
                    ell(g, 120 + rn() * 480, 20 + rn() * 260, 11, 8, rn() * 3);
                }
            });
            BRANCHES.forEach((b, i) => st.line(b, i % 2 ? '#4b4541' : '#413a37', BW[i] * 1.7, { level: i < 3 ? 1 : 2, taper: 0.4, seed: 'br' + i }));
            return;
        }
        // in leaf: the boughs only show below the crown and through a few gaps
        st.paint({ dir: 1.2, dab: 0.2 }, (g) => {
            [[[346, 340], [312, 276], 24], [[362, 340], [402, 264], 22], [[354, 334], [352, 262], 20]].forEach(([a, b, w], i) => {
                const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = (-dy / l) * (w / 2), ny = (dx / l) * (w / 2);
                g.fillStyle = '#a39d80';
                poly(g, [[a[0] - nx, a[1] - ny], [a[0] + nx, a[1] + ny], [b[0] + nx * 0.8, b[1] + ny * 0.8], [b[0] - nx * 0.8, b[1] - ny * 0.8]]);
                g.fillStyle = '#6a6456'; // the underside, away from the light
                const s = i === 0 ? -1 : 1;
                poly(g, [[a[0] + nx * s, a[1] + ny * s], [a[0] + nx * s * 0.2, a[1] + ny * s * 0.2], [b[0] + nx * s * 0.16, b[1] + ny * s * 0.16], [b[0] + nx * s * 0.8, b[1] + ny * s * 0.8]]);
                for (let k = 0; k < 5; k++) {
                    const u = 0.1 + rn() * 0.8, v = (rn() - 0.5) * 1.2;
                    g.fillStyle = ['#d2cba6', '#7f7a5e', '#bfc09a'][k % 3];
                    ell(g, a[0] + dx * u + nx * v, a[1] + dy * u + ny * v, 3.4 + rn() * 3, 6 + rn() * 5, Math.atan2(dy, dx) + 1.57);
                }
            });
        });
        st.paint({ dab: 1 }, (g) => {
            const mass = (list, cols, n, a, b) => list.forEach(([cx, cy, rx, ry]) => {
                for (let i = 0; i < n; i++) {
                    const an = rn() * 6.283, rr = Math.sqrt(rn());
                    g.fillStyle = cols[Math.floor(rn() * cols.length)];
                    ell(g, cx + Math.cos(an) * rx * rr, cy + Math.sin(an) * ry * rr, a + rn() * a, b + rn() * b, rn() * 3);
                }
            });
            const crown = [[200, 150, 150, 110], [360, 90, 190, 110], [520, 150, 140, 110], [300, 230, 150, 70], [450, 240, 130, 60], [585, 235, 70, 50]];
            g.fillStyle = '#22463f';
            crown.forEach(([cx, cy, rx, ry]) => ell(g, cx, cy, rx, ry));
            mass(crown, ['#22463f', '#1d3d3c', '#2d5a45', '#28505a', '#324f6a'], 26, 18, 12);
            // what the sun reaches: the top and the left of every clump
            const lit = [[170, 110, 110, 60], [330, 40, 150, 60], [500, 100, 110, 60], [260, 200, 100, 36], [430, 205, 90, 30]];
            mass(lit, ['#4f8a4a', '#5f9a52', '#3f7a55', '#6aa24a', '#4a8a78'], 30, 14, 9);
            mass(lit.map(([cx, cy, rx, ry]) => [cx - rx * 0.25, cy - ry * 0.35, rx * 0.6, ry * 0.5]), ['#9cc060', '#b5cf72', '#86b65a', '#d2d98a'], 14, 9, 6);
            // holes of sky
            g.fillStyle = '#8fbbe0';
            [[258, 140, 12, 8], [420, 150, 10, 7], [345, 185, 9, 6], [520, 215, 9, 6], [210, 215, 8, 5]].forEach((e) => ell(g, ...e));
        });
    }

    function car(st) {
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = '#3c3b3c';
            ell(g, 985, 668, 220, 16);
        });
        st.paint({ dir: 0.04 }, (g) => {
            // a hatchback seen from the side, nose to the left
            g.fillStyle = '#48505a';
            g.beginPath();
            g.moveTo(786, 646);
            g.lineTo(784, 606);
            g.quadraticCurveTo(800, 588, 880, 582);
            g.lineTo(934, 538);
            g.quadraticCurveTo(1010, 526, 1092, 534);
            g.lineTo(1150, 578);
            g.quadraticCurveTo(1182, 584, 1184, 606);
            g.lineTo(1182, 646);
            g.closePath();
            g.fill();
            g.fillStyle = '#a9b0b6'; // the light along the top
            poly(g, [[936, 538], [1090, 534], [1096, 541], [932, 546]]);
            poly(g, [[800, 592], [880, 584], [884, 592], [802, 600]]);
            g.fillStyle = '#262c33'; // glass
            poly(g, [[896, 580], [940, 546], [1006, 542], [1006, 580]]);
            poly(g, [[1016, 542], [1086, 542], [1134, 580], [1016, 580]]);
            g.fillStyle = '#7f8a92';
            poly(g, [[912, 574], [944, 550], [968, 549], [934, 574]]);
            g.fillStyle = '#343a41'; // the sill, darker
            poly(g, [[786, 628], [1182, 628], [1182, 646], [786, 646]]);
            g.fillStyle = '#2c2b2c';
            ell(g, 862, 646, 31, 31);
            ell(g, 1104, 646, 31, 31);
            g.fillStyle = '#8d8f90';
            ell(g, 862, 646, 15, 15);
            ell(g, 1104, 646, 15, 15);
            g.fillStyle = '#c9cdc8';
            ell(g, 792, 606, 6, 9);
            g.fillStyle = '#a8322c';
            ell(g, 1180, 600, 5, 10);
        });
    }

    function extras(st, T) {
        if (T) return;
        // an air conditioner and the cables that came with the years
        st.paint({ dir: 0.02 }, (g) => {
            g.fillStyle = '#b6b3ab';
            g.fillRect(1440, 300, 78, 52);
            g.fillStyle = '#6d6b68';
            ell(g, 1468, 326, 18, 18);
            g.fillStyle = '#8a8782';
            g.fillRect(1440, 346, 78, 6);
        });
        st.line([[622, 270], [800, 286], [1000, 272], [1200, 288], [1440, 274], [1650, 290], [1830, 276]], '#5a5552', 6, { level: 2 });
        st.line([[1478, 352], [1482, 440], [1470, 546]], '#45413f', 5, { level: 2 });
    }

    // PlazaDetail (detail.js) goes over each element of the memory right after it is laid
    function paint(st, era) {
        const T = era === 'then', D = T ? PlazaDetail : null;
        sky(st, T);
        farHouses(st, T);
        if (T) D.village(st);
        ground(st, T);
        if (T) D.ground(st);
        wall(st, T);
        if (T) D.wall(st);
        WINDOWS.forEach((cx, i) => {
            balcony(st, T, cx, i === 0);
            if (T) D.balcony(st, cx, i);
        });
        shop(st, T);
        if (T) D.shop(st);
        door(st, T);
        if (T) {
            D.door(st);
            D.lamp(st);
        }
        extras(st, T);
        tree(st, T);
        if (T) {
            D.tree(st);
            D.bicycle(st, 392, 612);
            D.woman(st, 1292, 602);
        } else car(st);
    }

    return { BOX, NOW, paint };
})();
