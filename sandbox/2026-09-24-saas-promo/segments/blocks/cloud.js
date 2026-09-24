// Block «cloud» of the edit (6–10 s, see ../../scene.js EDIT). Defines Shots.cloud(g, lt, env).
// Uses Chaos (chaos.js): the same set, the pile as it was left at 6 s.
//
// 0–0.5    the cloud's shadow falls over the wall, the top sheets tremble, Laura looks up
// 0.5      the brand cloud (BRAND.mark, cut big at its own scale) drops in on the beat, squash
// 1.0–2.4  it swallows the pile: sheets peel off the top one at a time on twos, spin up along a
//          stream into its underside (suction streaks, a gulp on each); the loose sheets in
//          the air are pulled in too; Laura's hands let go («whoa»), her hair lifts
// 2.5      the sticky note peels off her forehead, the last to go; she sighs, relieved
// 2.0      title BRAND.copy.onePlace
// 3.0–3.5  the cloud dives into the laptop and becomes the sticker on its lid (pop on 3.5);
//          the camera pushes towards the laptop: ready to cut to the POV (Shots.issue)
(() => {
    const P = Paper, D = PaperDetail, E = Ease, C = Chaos;
    const drawing = C.drawing, q = C.q;
    const CLOUD = { x: 1010, y: 204, s: 4.0 }; // resting place and scale (the mark is ~100 wide)
    const MOUTH = [1010, 292];
    const STICKER = { x: 728, y: 574, s: 0.3, rot: -0.12 }; // the brand sticker on the laptop lid
    const LX = C.LX, LY = C.LY, LS = C.LS;

    // the order the pile goes: from the top down, the forehead sticky last
    const pileItems = C.ITEMS.filter((it) => !it.face);
    const ORDER = [...pileItems].reverse();
    const REAM_N = C.REAM.length;
    // departures on twos from 1.0; the ream goes a few sheets at a time at the end
    const DEP = new Map(ORDER.map((it, i) => [it, 1.0 + Math.round(i * 1.15) / 12]));
    const REAM_T0 = 1.0 + Math.round(ORDER.length * 1.15) / 12; // ≈ 2.25
    const FLY = 0.5;
    const FACE_T = 2.5;

    // the big cloud: BRAND.mark cut at its own scale (so the torn edge and the texture have the
    // proportions of a real piece of paper, not a scaled-up sticker). One flat coral piece with
    // fibres and flecks: extra light/dark layers inside blurred the logo's lobes into a mound
    // (the client's logo must read as itself)
    function cloudSprite() {
        const S = CLOUD.s;
        return C.sprite('cloud-big', { x: -80 * S, y: -70 * S, w: 160 * S, h: 140 * S }, (c) => {
            BRAND.mark(c, (cc, pts, col, key) => {
                const big = pts.map(([x, y]) => [x * S, y * S]);
                const [bx0, by0, bx1, by1] = big.reduce(([a, b, e, f], [x, y]) => [Math.min(a, x), Math.min(b, y), Math.max(e, x), Math.max(f, y)], [1e9, 1e9, -1e9, -1e9]);
                const cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2, H = by1 - by0;
                P.cutout(cc, big, col, key + '-big', {
                    border: 5, borderVar: 0.5, jag: 1.2, step: 3, shadow: 0.24, tex: { alpha: [0.25, 0.5], len: [30, 90], h: [8, 16] },
                    inner: (c2, box) => {
                        // paper fibres (long light strands) and a few pale flecks
                        const r = P.rng('cloudfib' + key);
                        for (let k = 0; k < 22; k++) {
                            const x = box.x + r() * box.w, y = box.y + r() * box.h;
                            P.markerStroke(c2, [[x, y], [x + 18 + r() * 40, y + (r() - 0.5) * 14]], D.shade(col, 22), 1.2, 'cf' + key + k, 0.3);
                        }
                        c2.fillStyle = '#f7d9cc';
                        for (let k = 0; k < 30; k++) {
                            c2.globalAlpha = 0.35 + r() * 0.3;
                            c2.beginPath();
                            c2.ellipse(box.x + r() * box.w, box.y + r() * box.h, 1 + r() * 1.6, 0.7 + r(), r() * 3, 0, 7);
                            c2.fill();
                        }
                        c2.globalAlpha = 1;
                    },
                });
            });
        }, 1.3);
    }
    // the cloud's shadow on the wall and the pile before it drops (flat translucent tissue)
    function cloudShadow(g, u) {
        if (u <= 0) return;
        const S = CLOUD.s;
        const sp = C.sprite('cloud-shadow', { x: -80 * S, y: -70 * S, w: 160 * S, h: 140 * S }, (c) => {
            BRAND.mark(c, (cc, pts, col, key) => P.cutout(cc, pts.map(([x, y]) => [x * S, y * S]), '#5b3b4a', key + '-shadow', { border: 0, shadow: 0, jag: 1.4, step: 3, tex: false }));
        }, 0.8);
        g.save();
        g.globalAlpha = 0.16 * u;
        g.translate(CLOUD.x + 30, CLOUD.y + 40 - (1 - u) * 120);
        g.scale(0.8 + 0.2 * u, 0.8 + 0.2 * u);
        sp.draw(g);
        g.restore();
    }

    // where the cloud is: drop on the beat (0.5), squash, float and gulp, dive into the laptop
    function cloudState(lt) {
        const tq = q(lt);
        if (tq < 0.25) return null;
        let x = CLOUD.x, y = CLOUD.y, s = 1, sx = 1, sy = 1, rot = 0;
        if (tq < 0.5) y = E.lerp(-360, CLOUD.y + 16, E.in(E.seg(tq, 0.25, 0.5)));
        else {
            const j = drawing(lt - 0.5);
            [sx, sy] = j === 0 ? [1.1, 0.86] : j === 1 ? [0.95, 1.07] : j === 2 ? [1.02, 0.98] : [1, 1];
            y = CLOUD.y + (j === 0 ? 16 : j === 1 ? -8 : 0) + Math.sin(drawing(lt) * 0.55) * 4;
            // a gulp each time something reaches it
            const gulps = [...DEP.values()].map((t) => t + FLY).concat([FACE_T + 0.4]);
            const last = gulps.filter((t) => tq >= t).pop();
            if (last != null && tq - last < 0.25) {
                const k = drawing(tq - last);
                sx *= k === 0 ? 1.05 : k === 1 ? 0.98 : 1;
                sy *= k === 0 ? 0.96 : k === 1 ? 1.02 : 1;
            }
        }
        if (tq >= 3.0) {
            // anticipation (a little rise), then the dive into the lid
            if (tq < 3.5) {
                const a = E.seg(tq, 3.0, 3.17), b = E.in(E.seg(tq, 3.17, 3.5));
                x = E.lerp(CLOUD.x, STICKER.x, b);
                y = E.lerp(CLOUD.y - 26 * a, STICKER.y, b);
                s = E.lerp(1, STICKER.s / CLOUD.s, b);
                rot = STICKER.rot * b;
                sx = 1 - 0.08 * b;
                sy = 1 + 0.12 * b * (1 - b) * 4;
            } else return null;
        }
        return { x, y, s, sx, sy, rot };
    }

    // a pile item's state: resting until it leaves, then flying into the cloud's mouth
    function flight(it, lt, x0, y0, rot0, k) {
        const t0 = DEP.get(it), tq = q(lt);
        if (tq < t0) {
            // the sheets on top tremble before they go (suction), on twos
            const near = t0 - tq < 0.34 ? 1 : 0;
            const w = near * (drawing(lt) % 2 ? 1 : -1);
            return { x: x0, y: y0 - near * 3, rot: rot0 + w * 0.025, sx: 1, sy: 1, landed: true };
        }
        const u = (tq - t0) / FLY;
        if (u >= 1) return null;
        const e = Math.pow(u, 1.5), sd = k % 2 ? 1 : -1;
        const mx = MOUTH[0] + ((k * 37) % 5 - 2) * 26, my = MOUTH[1];
        const cx = E.lerp(x0, mx, 0.35) - 60 * sd, cy = Math.min(y0, my) - 170 - (k % 3) * 40;
        const px = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * cx + e * e * mx;
        const py = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * cy + e * e * my;
        const ph = u * Math.PI * 3 + k;
        return { x: px, y: py, rot: rot0 + sd * u * Math.PI * (1.4 + (k % 3) * 0.4), sx: 1, sy: 0.4 + 0.6 * Math.abs(Math.cos(ph)), s: 1 - e * 0.7 };
    }

    // the ream goes as a fan of loose sheets once the rest is gone
    function reamSheets(g, lt) {
        const tq = q(lt);
        for (let i = 0; i < REAM_N; i++) {
            const t0 = REAM_T0 + i / 24, u = (tq - t0) / FLY;
            if (u < 0 || u >= 1) continue;
            const e = Math.pow(u, 1.5), x0 = 482 + ((i * 53) % 9 - 4) * 12, y0 = 630 - i * 4, sd = i % 2 ? 1 : -1;
            const cx = 640 - 50 * sd, cy = 360 - (i % 3) * 40;
            const px = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * cx + e * e * (MOUTH[0] + (i % 3 - 1) * 30);
            const py = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * cy + e * e * MOUTH[1];
            const col = C.REAM[i][0];
            const sp = C.sprite('ream-sheet' + i, { x: -90, y: -70, w: 180, h: 140 }, (c) => {
                C.cut(c, [[-70, -50], [70, -48], [71, 50], [-69, 49]], col, 'rs' + i, {
                    border: 1.8, paper: '#ffffff', shadow: 0.2, tex: { alpha: [0.06, 0.16] },
                    inner: (cc) => (col === '#fbfaf5' || col === '#f3eee2' || col === '#f6f1e6' || col === '#efe9da') && D.wordBars(cc, { x: -58, y: -40, w: 116, h: 80 }, { cols: 116, rowH: 7, barH: 2.6, ink: '#8b8780', seed: 'rsw' + i }),
                });
            }, 1.4);
            g.save();
            g.translate(px, py);
            g.rotate(sd * u * Math.PI * 1.6);
            const sc = 1 - e * 0.7;
            g.scale(sc, sc * (0.4 + 0.6 * Math.abs(Math.cos(u * 9 + i))));
            sp.draw(g);
            g.restore();
        }
    }

    // suction streaks: fixed marker strokes that travel along the stream and fade (never
    // redrawn), three of them staggered, 0.9–2.9
    function streaks(g, lt) {
        const tq = q(lt);
        if (tq < 0.9 || tq > 2.9) return;
        for (let k = 0; k < 4; k++) {
            const life = 0.5, age = (tq - 0.9 + k * 0.125) % life, u = age / life;
            const sp = C.sprite('streak' + k, { x: -120, y: -40, w: 240, h: 80 }, (c) => {
                const pts = D.spline([[-100, 20 - k * 4], [-40, -4], [30, -12], [100, -26 + k * 6]], 8, false);
                P.markerStroke(c, pts, '#fffaf0', 5 - k * 0.6, 'stk' + k, 0.8);
            }, 1.4);
            const x = E.lerp(560 + k * 30, 900, u), y = E.lerp(380 - k * 30, 280, u);
            g.save();
            g.globalAlpha = Math.sin(u * Math.PI) * 0.8;
            g.translate(x, y);
            g.rotate(-0.25 + k * 0.08);
            sp.draw(g);
            g.restore();
        }
    }

    // messy hair: tufts pulled up towards the cloud during the suction (two drawings), then
    // left sticking up (a third drawing). Drawn over the head, in its tilted frame.
    // three drawings per strand, in the head's frame (fringe top ≈ y -140): [lifted hard,
    // lifted, left messy]. Short tapered strands rooted under the fringe's edge.
    const TUFTS = [
        [[[-34, -128], [-30, -160], [-8, -182]], [[-34, -128], [-34, -156], [-18, -174]], [[-34, -128], [-40, -150], [-30, -164]]],
        [[[2, -138], [16, -170], [44, -186]], [[2, -138], [10, -166], [32, -180]], [[2, -138], [6, -160], [22, -168]]],
        [[[38, -126], [62, -150], [92, -156]], [[38, -126], [56, -146], [80, -150]], null],
    ];
    function hair(lt) {
        const tq = q(lt);
        if (tq < 0.9) return null;
        const state = tq < 2.6 ? (drawing(lt) % 4 < 2 ? 0 : 1) : 2;
        return (g, tilt) => {
            const sp = C.sprite('tufts' + state, { x: -140, y: -250, w: 280, h: 200 }, (c) => {
                TUFTS.forEach((drawings, i) => {
                    const pts = drawings[state];
                    if (!pts) return;
                    P.cutout(c, D.taper(pts, [9, 6, 1.5], 8), i === 1 ? Laura.COL.hairLight : Laura.COL.hair, 'tuft' + state + i, {
                        border: 1.8, shadow: 0.12, tex: false,
                        inner: (cc, box) => D.strands(cc, box, Laura.COL.hair, { seed: 'tuft' + i, angle: -1.2 }),
                    });
                });
            }, 1.6);
            g.save();
            g.translate(LX, LY - 424 * LS);
            g.scale(LS, LS);
            g.rotate(tilt);
            sp.draw(g);
            g.restore();
        };
    }

    function face(lt) {
        const tq = q(lt);
        if (tq < 0.5) return { eyes: 'open', look: [0.8, -1], mouth: 'o', tilt: 0.04 };
        if (tq < 0.584) return { eyes: 'closed', look: [0, 0], mouth: 'o', tilt: 0.02 };
        if (tq < 2.5) return { eyes: 'open', look: [1, tq < 1.5 ? -1 : -0.6], mouth: 'o', tilt: 0.05 };
        if (tq < 2.6) return { eyes: 'closed', look: [0, 0], mouth: 'o', tilt: 0.02 };
        if (tq < 3.0) return { eyes: 'closed', look: [0, 0], mouth: 'smile', tilt: -0.06 };
        if (tq < 3.5) return { eyes: 'open', look: [1, 0.6], mouth: 'o', tilt: 0.03 };
        return { eyes: 'happy', look: [1, 0.6], mouth: 'grin', tilt: 0.05 };
    }
    function armsAt(lt) {
        const tq = q(lt);
        if (tq < 1.0) return C.armPose('clutch', 290);
        if (tq < 1.25) return C.armPose('clutch', 318);
        if (tq < 2.25) return C.armPose('whoa');
        return null;
    }

    function camera(g, lt) {
        // from the chaos framing (1.1 about (480, 400)) out to the full set as the cloud comes,
        // then a push towards the laptop for the cut to the POV
        const a = E.inOut(E.seg(lt, 0.1, 0.7)), b = E.inOut(E.seg(lt, 3.0, 4.0));
        const s1 = E.lerp(1.1, 1, a);
        g.translate(480, 400);
        g.scale(s1, s1);
        g.translate(-480, -400);
        const s2 = 1 + 0.2 * b;
        g.translate(716, 580);
        g.scale(s2, s2);
        g.translate(-716, -580);
    }

    function mark(g, lt) {
        if (lt < 3.5) return;
        const p = E.back(E.seg(lt, 3.5, 3.8));
        Props.kit.sprite('brand-mark', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'set'), 2).draw((g.save(), g.translate(1500, 820), g.scale(0.55 * p, 0.55 * p), g));
        g.restore();
    }

    Shots.cloud = (g, lt, env) => {
        const T = 6 + lt, tq = q(lt);
        g.save();
        camera(g, lt);
        const pull = { x: MOUTH[0], y: MOUTH[1], u: (i) => E.seg(tq, 0.9 + (i % 4) * 0.12, 1.5 + (i % 4) * 0.12) };
        C.set(g, T, { face: face(lt), arms: armsAt(lt), pull, hair: hair(lt) });
        cloudShadow(g, E.seg(tq, 0, 0.5) * (tq < 3.0 ? 1 : 1 - E.seg(tq, 3.0, 3.3)));
        streaks(g, lt);
        // the pile: resting items tremble, then fly; the ream is replaced by its loose sheets
        C.pile(g, 6, T, (it) => {
            if (it.kind === 'ream') {
                const gone = C.REAM.map((_, i) => tq >= REAM_T0 + i / 24).filter(Boolean).length;
                return gone >= REAM_N ? null : { x: it.x, y: it.y, rot: 0, sx: 1, sy: 1, landed: true, n: REAM_N - gone };
            }
            return flight(it, lt, it.x, it.y, it.rot, ORDER.indexOf(it));
        });
        reamSheets(g, lt);
        C.hands(g, T, armsAt(lt));
        // the sticky note on her forehead: peels off at 2.5 and flies in last
        const face15 = C.ITEMS[15];
        if (tq < FACE_T) {
            const st = { x: face15.x, y: face15.y, rot: face15.rot, sx: 1, sy: 1 };
            if (tq > FACE_T - 0.34) st.rot += drawing(lt) % 2 ? 0.05 : -0.05;
            C.drawItem(g, face15, st, '');
        } else {
            const u = (tq - FACE_T) / 0.42;
            if (u < 1) {
                const e = Math.pow(u, 1.4);
                const px = (1 - e) * (1 - e) * face15.x + 2 * (1 - e) * e * 640 + e * e * MOUTH[0];
                const py = (1 - e) * (1 - e) * face15.y + 2 * (1 - e) * e * 40 + e * e * MOUTH[1];
                C.drawItem(g, face15, { x: px, y: py, rot: face15.rot + u * 5, sx: 1, sy: 0.4 + 0.6 * Math.abs(Math.cos(u * 8)), s: 1 - e * 0.6 }, '');
            }
        }
        // the cloud, in front of the stream (what enters goes behind its belly)
        const cs = cloudState(lt);
        if (cs) {
            g.save();
            g.translate(cs.x, cs.y);
            g.rotate(cs.rot);
            g.scale(cs.s * cs.sx, cs.s * cs.sy);
            cloudSprite().draw(g);
            g.restore();
        }
        // 3.5: in the laptop: the lid sticker pops, marker ticks round it
        if (tq >= 3.5 && tq < 3.84) {
            const k = drawing(lt - 3.5), s = k === 0 ? 1.5 : k === 1 ? 1.2 : 1;
            g.save();
            g.translate(STICKER.x, STICKER.y);
            g.rotate(STICKER.rot);
            g.scale(s, s);
            Props.kit.sprite('cloud-sticker', { x: -30, y: -30, w: 60, h: 60 }, (c) => {
                C.cut(c, P.ellipse(0, 0, 22, 22, 32), '#fbf7ee', 'lapstk1', { border: 1.2, shadow: 0.2 });
                Props.mark(c, 0, 0, 0.3, 'lap');
            }, 3).draw(g);
            g.restore();
            Props.kit.sprite('cloud-pop', { x: -90, y: -90, w: 180, h: 180 }, (c) => {
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2 + 0.2;
                    P.markerStroke(c, [[Math.cos(a) * 42, Math.sin(a) * 42], [Math.cos(a) * 66, Math.sin(a) * 66]], BRAND.col.brand, 4.5, 'cp' + i, 0.9);
                }
            }, 1.6).draw((g.save(), g.translate(STICKER.x, STICKER.y), g));
            g.restore();
        }
        Office.front(g, T);
        g.restore();
        C.title(g, lt, 2.0, BRAND.copy.onePlace);
        mark(g, lt);
    };
})();
