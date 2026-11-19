// The embroidery of a mantón de Manila, ghosted into the night behind the emblem: peonies,
// leaves and trailing stems in satin stitch (every petal a fan of parallel threads), tone
// on tone, a few threads of rose and jade. Global: Shawl.
//   Shawl.ghost(g, box, { seed, keepOut })   keepOut: radius about the origin left bare
const Shawl = (() => {
    const S = Souvenir;
    const THREAD = { blue: [128, 136, 214], rose: [196, 124, 176], jade: [104, 176, 166], gold: [206, 170, 110] };
    const col = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const pol = (x, y, r, a) => [x + Math.cos(a) * r, y + Math.sin(a) * r];

    // One petal in satin stitch: threads run from its base to its scalloped tip.
    function petal(g, x, y, a, len, wid, c, alpha, r) {
        const lobes = 3, tip = [];
        for (let i = 0; i <= 18; i++) {
            const u = i / 18, aa = a + (u - 0.5) * wid;
            tip.push(pol(x, y, len * (0.86 + 0.14 * Math.abs(Math.sin(u * Math.PI * lobes))) * (0.9 + 0.1 * Math.sin(u * Math.PI)), aa));
        }
        const base0 = pol(x, y, len * 0.16, a - wid * 0.2), base1 = pol(x, y, len * 0.16, a + wid * 0.2);
        const pts = [base0, ...tip, base1];
        g.save();
        g.beginPath();
        S.trace(g, pts);
        g.fillStyle = col(c, alpha * 0.28);
        g.fill();
        g.clip();
        g.lineCap = 'round';
        const n = Math.max(8, Math.round((wid * len) / 9));
        for (let i = 0; i < n; i++) {
            const u = (i + 0.5) / n, aa = a + (u - 0.5) * wid * 1.05;
            const p = pol(x, y, len * 0.14, a + (u - 0.5) * wid * 0.4), q = pol(x, y, len * 1.05, aa);
            // silk catches the light thread by thread
            g.strokeStyle = col(c, alpha * (0.35 + 0.65 * r()));
            g.lineWidth = 1.5 + r() * 1.3;
            g.beginPath();
            g.moveTo(p[0], p[1]);
            g.lineTo(q[0], q[1]);
            g.stroke();
        }
        g.restore();
        g.strokeStyle = col(c, alpha * 0.9);
        g.lineWidth = 1.4;
        g.beginPath();
        S.trace(g, pts);
        g.stroke();
    }
    function peony(g, x, y, rad, seed) {
        const r = Motion.rng('peony' + seed);
        const c = r() < 0.22 ? THREAD.rose : THREAD.blue, a0 = r() * 6.28, alpha = 0.17 + r() * 0.13;
        for (const [k, n, wid] of [[1, 8, 1.0], [0.72, 7, 1.05], [0.46, 5, 1.2]]) {
            for (let i = 0; i < n; i++) petal(g, x, y, a0 + k * 2 + (i / n) * 6.2832, rad * k * (0.92 + r() * 0.16), wid * (6.2832 / n) * 0.82, c, alpha * (1.25 - k * 0.3), r);
        }
        // the heart: a knot of gold stitches
        for (let i = 0; i < 14; i++) {
            const p = pol(x, y, rad * 0.1 * r(), r() * 6.28);
            g.fillStyle = col(THREAD.gold, 0.2 + r() * 0.2);
            g.beginPath();
            g.arc(p[0], p[1], 2 + r() * 2.4, 0, 6.3);
            g.fill();
        }
    }
    function leaf(g, x, y, a, len, seed) {
        const r = Motion.rng('sleaf' + seed);
        const bend = (r() - 0.5) * 0.8, wid = len * (0.2 + r() * 0.1), c = THREAD.jade, alpha = 0.13 + r() * 0.1;
        const mid = [], up = [], dn = [];
        for (let i = 0; i <= 16; i++) {
            const u = i / 16, aa = a + bend * u, p = pol(x, y, len * u, aa), w = wid * Math.sin(Math.PI * Math.pow(u, 0.7));
            mid.push(p);
            up.push([p[0] - Math.sin(aa) * w, p[1] + Math.cos(aa) * w]);
            dn.push([p[0] + Math.sin(aa) * w, p[1] - Math.cos(aa) * w]);
        }
        const pts = [...up, ...dn.reverse()];
        g.save();
        g.beginPath();
        S.trace(g, pts);
        g.fillStyle = col(c, alpha * 0.3);
        g.fill();
        g.clip();
        for (let i = 0; i < 26; i++) {
            const u = i / 26, p = mid[Math.floor(u * 16)], aa = a + bend * u;
            for (const sd of [-1, 1]) {
                g.strokeStyle = col(c, alpha * (0.4 + 0.6 * r()));
                g.lineWidth = 1.4 + r();
                g.beginPath();
                g.moveTo(p[0], p[1]);
                g.lineTo(p[0] + Math.cos(aa + sd * 0.7) * wid * 1.6, p[1] + Math.sin(aa + sd * 0.7) * wid * 1.6);
                g.stroke();
            }
        }
        g.restore();
        g.strokeStyle = col(c, alpha);
        g.lineWidth = 1.3;
        g.beginPath();
        S.trace(g, pts);
        g.stroke();
        g.beginPath();
        S.trace(g, mid, false);
        g.stroke();
    }

    function ghost(g, box, { seed = 'shawl', keepOut = 260 } = {}) {
        const r = Motion.rng(seed);
        const cols = 7, rows = 5, cw = box.w / cols, ch = box.h / rows;
        const spots = [];
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const x = box.x + (i + 0.25 + r() * 0.5) * cw, y = box.y + (j + 0.25 + r() * 0.5) * ch;
                if (Math.hypot(x, y) < keepOut) continue;
                spots.push([x, y, 105 + r() * 95]);
            }
        }
        // trailing stems from flower to flower, then leaves along them, then the flowers
        g.lineCap = 'round';
        spots.forEach(([x, y, rad], i) => {
            const [x2, y2] = spots[(i + 1 + Math.floor(r() * 3)) % spots.length];
            if (Math.hypot(x2 - x, y2 - y) > cw * 2.2) return;
            const mx = (x + x2) / 2 + (r() - 0.5) * 240, my = (y + y2) / 2 + (r() - 0.5) * 240;
            g.strokeStyle = col(THREAD.jade, 0.15);
            g.lineWidth = 3.2;
            g.beginPath();
            g.moveTo(x, y);
            g.quadraticCurveTo(mx, my, x2, y2);
            g.stroke();
            for (let k = 1; k <= 4; k++) {
                const u = k / 5, px = (1 - u) * (1 - u) * x + 2 * u * (1 - u) * mx + u * u * x2, py = (1 - u) * (1 - u) * y + 2 * u * (1 - u) * my + u * u * y2;
                leaf(g, px, py, r() * 6.28, 70 + r() * 70, seed + i + '-' + k);
            }
        });
        spots.forEach(([x, y, rad], i) => {
            for (let k = 0; k < 4; k++) leaf(g, x, y, r() * 6.28, rad * (1.25 + r() * 0.5), seed + 'f' + i + k);
            peony(g, x, y, rad, seed + i);
        });
    }
    return { ghost, peony };
})();
