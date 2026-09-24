// Card «koi» (seen in a circle at 1.75 s; full frame, re-inked pink↔blue, at 14.13 s). A pond
// from above: two koi, lily pads (one with a pink water lily), rings of ripples. Geometry is
// measured on the full-frame 14.13 s view (reference pixels, G1.frame); the inks come from
// the circle view at 1.75 s. Separations: water = blue, pink and navy screens on paper (pink
// strongest round the centre, blue towards the edges); ripples = knockouts; pads = yellow
// solid + blue screen (green) with yellow veins; lily = pink solid, navy lines, white veins;
// koi = pink + yellow solid (orange-red) with yellow spots (pink knocked out).
var CARDS = CARDS || {};
CARDS.koi = (press, t) => {
    const { T, fill, stroke, taper, smoothPath, polyPath, clipped, specks, ribbon } = G1;
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yellow = P('yellow'), yellowS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const erase = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); };
    const d = Math.floor(t * 12 + 1e-6);

    G1.frame(press, () => {
        // --- water
        blueS.fillStyle = Riso.radial(blueS, 540, 545, 80, 760, 0.1, 0.55);
        blueS.fillRect(0, 0, 1080, 1080);
        pinkS.fillStyle = Riso.radial(pinkS, 540, 545, 60, 700, 0.45, 0.12);
        pinkS.fillRect(0, 0, 1080, 1080);
        navyS.fillStyle = T(0.2);
        navyS.fillRect(0, 0, 1080, 1080);

        // --- ripples: groups of thin white rings, each ring drifting off its centre; the
        // rings spread outward on twos
        const grow = (d % 4) * 2;
        const groups = [[540, 545, [24, 56, 92, 130, 170, 214, 262], 4.5], [210, 255, [20, 46, 78, 112, 150], 4], [690, 112, [18, 44, 74, 106], 3.6], [945, 130, [18, 42, 68], 3.4],
            [865, 765, [24, 56, 94, 136, 178], 4], [158, 905, [24, 52, 84, 118], 4], [505, 1000, [24, 56, 92], 4], [1000, 560, [22, 50], 3.4]];
        press.knockout((g) => {
            groups.forEach(([cx, cy, rs, w], gi) => rs.forEach((r, k) => {
                const ox = k * 3.5 * (gi % 2 ? 1 : -1), oy = k * 2.5;
                Riso.ring(g, cx + ox, cy + oy, r + grow * (k + 1) * 0.5, w - k * 0.25, 'koi' + gi + '_' + k, { wobble: 0.02 });
            }));
        });

        // --- lily pads: green (yellow + blue screen), yellow veins, a notch
        const pad = (cx, cy, r, notchA, seed) => {
            const path = (g) => { g.moveTo(cx, cy); g.arc(cx, cy, r, notchA + 0.22, notchA - 0.22 + Math.PI * 2); g.closePath(); };
            press.knockout((g) => { g.beginPath(); path(g); g.fill(); });
            yellow.fillStyle = T(1); yellow.beginPath(); path(yellow); yellow.fill();
            clipped(blueS, path, (g) => { g.fillStyle = T(0.55); g.fillRect(cx - r, cy - r, r * 2, r * 2); });
            // veins: blue knocked out along radial lines
            erase(blueS, (g) => {
                g.lineWidth = 4; g.lineCap = 'round';
                for (let i = 0; i < 9; i++) { const a = notchA + 0.5 + (i / 8) * (Math.PI * 2 - 1); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r * 0.75, cy + Math.sin(a) * r * 0.75); g.stroke(); }
            });
            navyS.save(); navyS.beginPath(); path(navyS); navyS.clip(); navyS.fillStyle = Riso.ramp(navyS, cx - r, cy - r, cx + r, cy + r, 0, 0.3); navyS.fillRect(cx - r, cy - r, r * 2, r * 2); navyS.restore();
            taper(navy, [[cx, cy], [cx + Math.cos(notchA - 0.2) * r, cy + Math.sin(notchA - 0.2) * r]], 4, 2);
        };
        pad(330, 108, 70, 1.85, 'a');
        pad(905, 445, 95, 2.55, 'b');
        pad(670, 885, 80, 3.9, 'c');
        pad(1040, 905, 72, 3.6, 'd');
        pad(165, 560, 125, 4.1, 'e');

        // --- the water lily on the big pad: two rings of pointed petals
        const petal = (cx, cy, a, len, wid) => {
            const tip = [cx + Math.cos(a) * len, cy + Math.sin(a) * len], n = [-Math.sin(a), Math.cos(a)];
            const b = [cx + Math.cos(a) * len * 0.45, cy + Math.sin(a) * len * 0.45];
            return [[cx, cy], [b[0] + n[0] * wid, b[1] + n[1] * wid], tip, [b[0] - n[0] * wid, b[1] - n[1] * wid]];
        };
        const FC = [175, 535];
        for (const [len, wid, off] of [[115, 34, 0.2], [84, 30, 0.6], [50, 20, 0.2]]) {
            for (let i = 0; i < 8; i++) {
                const a = off + (i / 8) * Math.PI * 2, pp = petal(FC[0], FC[1], a, len, wid);
                press.knockout((g) => { smoothPath(g, pp, true, 0.18); g.fill(); });
                fill(pink, pp, 1, true);
                navy.save(); navy.strokeStyle = T(1); navy.lineWidth = 2.6; smoothPath(navy, pp, true, 0.18); navy.stroke(); navy.restore();
                press.knockout((g) => taper(g, [[FC[0] + Math.cos(a) * len * 0.35, FC[1] + Math.sin(a) * len * 0.35], [FC[0] + Math.cos(a) * len * 0.82, FC[1] + Math.sin(a) * len * 0.82]], 3, 1));
            }
        }
        yellow.fillStyle = T(1); yellow.beginPath(); yellow.arc(FC[0], FC[1], 18, 0, 7); yellow.fill();
        pink.fillStyle = T(1); pink.beginPath(); pink.arc(FC[0], FC[1], 18, 0, 7); pink.fill();
        specks(navy, 'koi-stamen', FC[0] - 14, FC[1] - 14, FC[0] + 14, FC[1] + 14, 14, 1.5, 2.6);
        for (let i = 0; i < 8; i++) { const a = i * 0.8; taper(navy, [[FC[0], FC[1]], [FC[0] + Math.cos(a) * 16, FC[1] + Math.sin(a) * 16]], 2, 1); }

        // --- the koi: orange-red, yellow spots, a yellow lateral line, fins; they swim on twos
        const sw = (d % 2) * 3;
        const koi = (spine, W, spots, fins, seed) => {
            const rb = ribbon(spine, (u) => W * (u < 0.2 ? 0.6 + u * 2 : Math.max(0.16, 1 - (u - 0.2) * 1.05)));
            press.knockout((g) => { smoothPath(g, rb.outline, true, 0.1); g.fill(); });
            // tail fin and pectoral fins
            const S = rb.spine, e = S[S.length - 1], e2 = S[S.length - 6];
            const dx = e[0] - e2[0], dy = e[1] - e2[1], dl = Math.hypot(dx, dy), ux = dx / dl, uy = dy / dl;
            const tail = [e, [e[0] + ux * 40 - uy * 26, e[1] + uy * 40 + ux * 26], [e[0] + ux * 26, e[1] + uy * 26], [e[0] + ux * 40 + uy * 26, e[1] + uy * 40 - ux * 26]];
            for (const g of [pink, yellow]) { fill(g, rb.outline, 1, true); fill(g, tail, 1, false); for (const f of fins) fill(g, f, 1, true); }
            // the fins are lighter: yellow with pink stripes
            for (const f of fins.concat([tail])) { erase(pink, (g) => { polyPath(g, f); g.fill(); }); fill(pinkS, f, 0.45); }
            // a yellow lateral line along the back (pink knocked out)
            const back = rb.left.filter((_, i) => i > 8 && i < rb.left.length - 12).map(([x, y], i, arr) => {
                const s = rb.spine[i + 9]; return [s[0] + (x - s[0]) * 0.55, s[1] + (y - s[1]) * 0.55];
            });
            erase(pink, (g) => { g.lineWidth = 5; g.lineCap = 'round'; smoothPath(g, back, false); g.stroke(); });
            navy.save(); navy.strokeStyle = T(1); navy.lineWidth = 1.6; smoothPath(navy, back.map(([x, y]) => [x + 3, y + 3]), false); navy.stroke(); navy.restore();
            // spots
            erase(pink, (g) => { for (const [x, y, r] of spots) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
            // the eye
            navy.fillStyle = T(1); navy.beginPath(); navy.arc(S[4][0], S[4][1] - 10, 4, 0, 7); navy.fill();
        };
        koi([[285, 648], [350, 668], [425, 710], [495, 722], [552, 692], [582 + sw, 650]], 84,
            [[370, 665, 11], [428, 700, 11], [470, 722, 10]],
            [[[340, 700], [330, 740], [365, 718]], [[500, 745], [520, 772], [530, 742]]], 'a');
        koi([[758, 392], [772, 440], [775, 490], [764, 545], [742, 590], [714 - sw, 610]], 58,
            [[772, 432, 8], [778, 478, 8], [770, 520, 7]],
            [[[790, 470], [812, 482], [796, 492]]], 'b');
    });
};
