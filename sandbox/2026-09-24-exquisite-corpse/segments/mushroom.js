// Segment 2 · The mushroom · 70s poster (5–12 s)
// Spinning rays, a mushroom dancing to the beat, «¡GLUP!» falling and melting, the marble
// bouncing on the cap and the sneeze of spores that engulfs the shot.
(() => {
    const E = Ease, G = Groovy;
    const PAL = G.PAL.acid, INK = PAL.ink, C = PAL.c;
    const MUSHROOM = { x: 800, y: 800 };

    // the marble: falls from the eye tunnel (7.3), bounces on the cap on every beat from
    // 8.0 to 10.0 from side to side and, with the sneeze (10.5), shoots off to the center
    function marble(t) {
        if (t < 7.3) return null;
        const capY = 470;
        if (t < 8.0) {
            const u = E.in(E.seg(t, 7.3, 8.0));
            return [800, E.lerp(-60, capY, u)];
        }
        if (t < 10.5) {
            const k = Math.floor((t - 8.0) / 0.5), f = ((t - 8.0) % 0.5) / 0.5;
            const x0 = 800 + (k % 2 ? 110 : -110) * (k > 0 ? 1 : 0), x1 = 800 + (k % 2 ? -110 : 110);
            return [E.lerp(x0, x1, f), capY - Math.sin(f * Math.PI) * 170];
        }
        const u = E.out(E.seg(t, 10.5, 11.2));
        return [E.lerp(800, 800, u), E.lerp(capY, 400, u)];
    }
    Segment.mushroomMarble = marble;

    // small chorus mushroom: dances on the offbeat (half a beat out of phase)
    function mini(g, x, y, s, t, cap, dot, phase) {
        const off = Motion.pulse(t, 120, 0.25 + phase);
        g.save();
        g.translate(x, y);
        g.rotate(Math.sin(t * Math.PI * 2 + phase * 6) * 0.12);
        g.scale(s / Math.sqrt(1 - off * 0.12), s * (1 - off * 0.12));
        G.shape(g, G.wavy([...G.ellipse(0, -60, 38, 62, 30, 0, Math.PI), ...G.ellipse(0, -110, 30, 16, 16, Math.PI, Math.PI * 2)], 3, 4, t * 4), '#fff1c1', { ink: INK, width: 5 });
        G.shape(g, [...G.ellipse(0, -130, 95, 70, 40, Math.PI, Math.PI * 2), ...G.ellipse(0, -130, 95, 18, 16, 0, Math.PI)], cap, { ink: INK, width: 6, echoes: [C[4]], echoStep: 6 });
        g.fillStyle = dot;
        for (const [dx, dy, r] of [[-40, -160, 13], [18, -178, 11], [50, -148, 9]]) (g.beginPath(), g.arc(dx, dy, r, 0, Math.PI * 2), g.fill());
        g.fillStyle = INK;
        for (const dx of [-12, 12]) (g.beginPath(), g.ellipse(dx, -80, 5, 7, 0, 0, Math.PI * 2), g.fill());
        G.line(g, [[-10, -60], [0, -54], [10, -60]], INK, 4);
        g.restore();
    }

    // 70s daisy: round petals that spin
    function daisy(g, x, y, r, t, petal, center, rot) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2;
            G.shape(g, G.ellipse(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.42, r * 0.26, 20).map(([px, py]) => {
                const dx = px - Math.cos(a) * r * 0.62, dy = py - Math.sin(a) * r * 0.62;
                return [Math.cos(a) * r * 0.62 + dx * Math.cos(a) - dy * Math.sin(a), Math.sin(a) * r * 0.62 + dx * Math.sin(a) + dy * Math.cos(a)];
            }), petal, { ink: INK, width: 4 });
        }
        G.shape(g, G.ellipse(0, 0, r * 0.3, r * 0.3, 24), center, { ink: INK, width: 4 });
        g.restore();
    }

    Segment.mushroom = (g, t, env) => {
        const beat = Motion.pulse(t, 120);
        G.sunburst(g, env, 800, 560, 22, t * 0.35, [C[0], C[4]]);
        G.rings(g, 800, 560, 5, 80 + beat * 6, t, [C[1], C[5], C[3], C[2], C[1]], 0.06);
        // daisies in the corners, spinning in opposite directions
        daisy(g, 130, 130, 95, t, C[5], C[4], t * 0.8);
        daisy(g, 1480, 150, 80, t, C[2], C[1], -t * 0.9);
        daisy(g, 110, 800, 70, t, C[3], C[4], -t * 0.7);
        daisy(g, 1500, 790, 100, t, C[1], C[2], t * 0.6);
        // the chorus: small mushrooms at the sides, on the offbeat
        mini(g, 330, 860, 1.0, t, C[5], C[4], 0);
        mini(g, 1270, 860, 1.05, t, C[3], C[2], 0.5);
        mini(g, 480, 890, 0.7, t, C[2], C[1], 0.25);
        mini(g, 1120, 895, 0.72, t, C[0], C[5], 0.75);

        // --- the mushroom: sways to the beat and squashes on every hit -----------------
        const sneezeIn = E.seg(t, 10.0, 10.45), sneeze = E.bump(t, 10.45, 0.4);
        const sway = Math.sin(((t - 0.0) * Math.PI * 2) / 1.0) * 0.07 * (1 - sneezeIn);
        const squash = 1 - beat * 0.06 + sneezeIn * 0.1 - sneeze * 0.18;
        g.save();
        g.translate(MUSHROOM.x, MUSHROOM.y);
        g.rotate(sway);
        g.scale(1 / Math.sqrt(squash), squash);
        // dancing arms (up on the beat)
        for (const s of [-1, 1]) {
            const up = Math.sin(t * Math.PI * 2 + (s > 0 ? Math.PI : 0)) * 50;
            const arm = [[s * 60, -160], [s * 130, -190 - up * 0.4], [s * 175, -250 - up]];
            G.line(g, arm, INK, 26);
            G.line(g, arm, '#fff1c1', 14);
        }
        // stem with a face
        const stem = G.wavy([...G.ellipse(0, -140, 85, 150, 60, 0, Math.PI), ...G.ellipse(0, -200, 70, 40, 30, Math.PI, Math.PI * 2)], 5, 5, t * 4);
        G.shape(g, stem, '#fff1c1', { ink: INK, width: 7 });
        const blink = E.bump(t, 9.2, 0.18) + sneezeIn;
        for (const s of [-1, 1]) {
            g.fillStyle = INK;
            g.beginPath();
            g.ellipse(s * 32, -150, 16, Math.max(2, 16 * (1 - blink)), 0, 0, Math.PI * 2);
            g.fill();
            // droopy eyelid: «groovy» look
            g.fillStyle = '#ffc9a8';
            g.fillRect(s * 32 - 18, -168, 36, 12 + blink * 16);
            G.line(g, [[s * 32 - 18, -156 + blink * 16], [s * 32 + 18, -156 + blink * 16]], INK, 5);
        }
        const mouthOpen = sneeze > 0.05 ? sneeze : 0;
        if (mouthOpen) {
            g.fillStyle = INK;
            g.beginPath();
            g.ellipse(0, -95, 28, 30 * mouthOpen, 0, 0, Math.PI * 2);
            g.fill();
        } else G.line(g, [[-34, -104], [-12, -88], [12, -88], [34, -104]], INK, 6);
        // cap with polka dots and echoes
        const inflate = 1 + sneezeIn * 0.12;
        const cap = G.wavy([...G.ellipse(0, -330, 250 * inflate, 190 * inflate, 80, Math.PI, Math.PI * 2), ...G.ellipse(0, -330, 250 * inflate, 50, 40, 0, Math.PI)], 7, 7, t * 3);
        G.shape(g, cap, C[1], { ink: INK, width: 8, echoes: [C[2], C[3]], echoStep: 10 });
        g.save();
        G.path(g, cap);
        g.clip();
        [[-130, -420, 42], [20, -470, 36], [140, -400, 48], [-40, -370, 26], [90, -480, 22], [-190, -360, 24]].forEach(([x, y, r], i) => {
            G.shape(g, G.wavy(G.ellipse(x, y, r, r * 0.8, 36), 2, 4, t * 5 + i), C[4], { ink: INK, width: 5 });
        });
        g.restore();
        g.restore();

        // --- ¡GLUP! falls at 6.4, bounces and melts -----------------------------------
        const drop = E.back(E.seg(t, 6.4, 6.9));
        if (t > 6.4) {
            g.save();
            g.globalAlpha = 1 - E.seg(t, 9.6, 10.2);
            G.melt(g, env, '¡GLUP!', 800, E.lerp(-150, 190, drop), 170, { t, melt: E.inOut(E.seg(t, 7.2, 9.6)) * 0.9, wave: 6, fill: C[2], echo: C[3], ink: INK });
            g.restore();
        }

        // --- the marble --------------------------------------------------------------
        const m = marble(t);
        if (m) Marble.draw(g, m[0], m[1], 40, t, 'poster');
    };

    // edge of each spore cloud in the engulf: ink outline + color echo
    Segment.mushroomSpore = (g, x, y, r, i) => {
        g.lineWidth = 16;
        g.strokeStyle = INK;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.stroke();
        g.lineWidth = 8;
        g.strokeStyle = [C[2], C[4], C[5]][i % 3];
        g.stroke();
    };
})();
