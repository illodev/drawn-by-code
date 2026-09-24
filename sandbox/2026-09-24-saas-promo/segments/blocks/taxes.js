// Block «taxes» of the edit (see ../../scene.js EDIT). Defines Shots.taxes(g, lt, env).
//
// The quarter, seen coming. The office pushed in on the right: the wall calendar (enlarged)
// above, two big kraft tax envelopes propped on the desk below, the brand cloud floating
// between them. On every beat the cloud drops a paper slip (an invoice or a till receipt)
// into one envelope; the envelope's gauge fills a step and its running figure, written in
// marker, ticks up on twos. The calendar pages flip up over the spiral on the off-beats
// (June → September). When both envelopes are full, a green «ready» stamp lands on each
// (4.0, 4.5) and the deadline gets circled. Laura sips her coffee, relaxed, and toasts.
(() => {
    const P = Paper, D = PaperDetail, E = Ease;
    const sprite = (...a) => Props.sprite(...a);
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.2, shadow: 0.18, ...o });
    const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const rot2 = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const drawing = (lt, t0 = 0) => Math.floor((lt - t0) * 12 + 1e-6);
    const q2 = (lt) => Math.floor(lt * 12 + 1e-6) / 12; // time held on twos
    const KRAFT = '#c99a5e', KRAFT_IN = '#b3844c', GREEN = '#1c7048';

    // number with the brand's separators (BRAND.copy.numFormat = [thousands, decimal])
    function money(v) {
        const [th, dec] = BRAND.copy.numFormat ?? [',', '.'];
        const cents = Math.round(v * 100), int = Math.floor(cents / 100), frac = String(cents % 100).padStart(2, '0');
        return String(int).replace(/\B(?=(\d{3})+(?!\d))/g, th) + dec + frac;
    }

    // ------------------------------------------------------------------ layout (office units)
    const CAM = { x: 752, y: 420, s: 1.28 };
    const CLOUD = { x: 962, y: 212, s: 1.9 };
    const CALT = { cx: 1244, cy: 300, s: 1.15 }; // the calendar, enlarged about its centre
    const ENV = [
        { x: 838, y: 684, w: 196, h: 256, rot: -0.035 },
        { x: 1044, y: 684, w: 196, h: 256, rot: 0.03 },
    ];
    // the slips: land on the beats, alternate envelopes; amount adds to that envelope
    const SLIPS = [
        { land: 0.5, env: 0, kind: 'inv', dx: -34, peek: 40, rot: -0.12, amount: 312.4 },
        { land: 1.0, env: 1, kind: 'rec', dx: 30, peek: 50, rot: 0.1, amount: 296.5 },
        { land: 1.5, env: 0, kind: 'rec', dx: 22, peek: 56, rot: 0.14, amount: 606.9 },
        { land: 2.0, env: 1, kind: 'inv', dx: -28, peek: 36, rot: -0.08, amount: 412.3 },
        { land: 2.5, env: 0, kind: 'inv', dx: 44, peek: 30, rot: 0.06, amount: 248.1 },
        { land: 3.0, env: 1, kind: 'rec', dx: -4, peek: 62, rot: -0.03, amount: 255.5 },
        { land: 3.5, env: 0, kind: 'inv', dx: -6, peek: 46, rot: 0.02, amount: 675.2 },
    ];
    const FALL = 0.42; // seconds from leaving the cloud to landing
    const STAMP_AT = [4.5, 4.0];
    const FLIPS = [1.25, 2.25, 3.25]; // calendar page turns (off-beats), 6 drawings each

    // ------------------------------------------------------------------ the envelopes
    function envBack(i) {
        const { w, h } = ENV[i];
        return sprite('tx-envback' + i, { x: -w / 2 - 12, y: -h - 80, w: w + 24, h: h + 92 }, (c) => {
            // the open flap folded back: its inside (darker kraft) with a glue band
            cut(c, [[-w / 2 + 3, -h + 2], [-w / 2 + 24, -h - 62], [w / 2 - 24, -h - 62], [w / 2 - 3, -h + 2]], KRAFT_IN, 'tx-flap' + i, {
                border: 1.8, tex: { alpha: [0.2, 0.4] },
                inner: (cc) => (cc.fillStyle = 'rgba(255,240,200,0.35)', cc.fillRect(-w / 2 + 30, -h - 56, w - 60, 10)),
            });
            D.crease(c, [-w / 2 + 6, -h + 1], [w / 2 - 6, -h + 1]);
            // the back panel
            cut(c, R(-w / 2, -h, w, h), D.shade(KRAFT, -6), 'tx-back' + i, { border: 2, tex: { alpha: [0.2, 0.4] } });
            // the string-and-button closure on the flap: two paper discs and the red string
            for (const [bx, by] of [[-16, -h - 36], [16, -h - 36]]) {
                cut(c, [...Array(20)].map((_, k) => [bx + Math.cos(k / 20 * 6.283) * 9, by + Math.sin(k / 20 * 6.283) * 9]), '#e9dcc0', 'tx-btn' + i + bx, { border: 1, shadow: 0.25 });
                c.fillStyle = 'rgba(60,40,30,0.5)';
                c.beginPath();
                c.arc(bx, by, 1.8, 0, 7);
                c.fill();
            }
            P.markerStroke(c, [[-16, -h - 36], [-6, -h - 46], [6, -h - 28], [16, -h - 36], [8, -h - 48], [-4, -h - 24], [-12, -h - 10], [-20, -h + 6]], '#c0392b', 1.8, 'tx-string' + i, 0.9);
        }, 1.9);
    }
    function envFront(i) {
        const { w, h } = ENV[i], [num, name] = BRAND.copy.taxForms[i], cl = BRAND.col;
        const top = -h + 14;
        const notch = [...Array(11)].map((_, k) => { const a = (k / 10) * Math.PI; return [22 * Math.cos(a), top + 20 * Math.sin(a)]; });
        return sprite('tx-envfront' + i + num + name, { x: -w / 2 - 12, y: -h - 6, w: w + 24, h: h + 18 }, (c) => {
            cut(c, [[-w / 2 + 1, 0], [w / 2, 0], [w / 2 - 1, top], ...notch, [-w / 2, top + 1]], KRAFT, 'tx-front' + i, {
                border: 2.4, shadow: 0.26, tex: { alpha: [0.22, 0.42] },
                inner: (cc) => {
                    // the kraft's fibres: short darker hairs
                    const r = P.rng('tx-fib' + i);
                    cc.strokeStyle = D.shade(KRAFT, -18);
                    cc.lineWidth = 0.8;
                    cc.globalAlpha = 0.35;
                    for (let k = 0; k < 90; k++) {
                        const x = -w / 2 + r() * w, y = top + r() * (h - 14), a = r() * 3, l = 3 + r() * 6;
                        cc.beginPath();
                        cc.moveTo(x, y);
                        cc.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
                        cc.stroke();
                    }
                    cc.globalAlpha = 1;
                    // the routing table printed on inter-office envelopes
                    cc.fillStyle = 'rgba(70,45,25,0.45)';
                    for (let y = -96; y <= -20; y += 19) cc.fillRect(-w / 2 + 14, y, w - 28, 1.4);
                    cc.fillRect(-w / 2 + 70, -96, 1.4, 76);
                    P.scribble(cc, -w / 2 + 18, -82, 44, 3, 19, '#4a3526', 'tx-rt' + i, { alpha: 0.55, scale: 0.55 });
                },
            });
            D.crease(c, [-w / 2 + 8, -60], [w / 2 - 20, -54]);
            // the printed label: form number big, its name under it, a small brand mark
            cut(c, [[-w / 2 + 14, top + 22], [w / 2 - 14, top + 20], [w / 2 - 15, top + 104], [-w / 2 + 15, top + 105]], cl.paper, 'tx-label' + i, {
                border: 1.8, shadow: 0.2, paper: '#ffffff', tex: { alpha: [0.08, 0.16] },
                inner: (cc) => {
                    cc.fillStyle = cl.navy;
                    cc.fillRect(-w / 2 + 14, top + 20, w - 28, 8);
                    Props.print(cc, num, -w / 2 + 26, top + 78, 50, cl.navy, { weight: 700 });
                    Props.print(cc, name, -w / 2 + 28, top + 97, 16, cl.grey, { weight: 500 });
                    Props.mark(cc, w / 2 - 38, top + 50, 0.3, 'txl' + i);
                },
            });
            // the gauge: a printed outline with quarter ticks (the marker fill is drawn live)
            c.save();
            c.strokeStyle = 'rgba(40,30,40,0.6)';
            c.lineWidth = 1.6;
            c.fillStyle = 'rgba(255,248,232,0.55)';
            c.fillRect(-w / 2 + 16, -134, w - 32, 24);
            c.strokeRect(-w / 2 + 16, -134, w - 32, 24);
            for (let k = 1; k < 4; k++) c.fillRect(-w / 2 + 16 + ((w - 32) * k) / 4, -134, 1.2, 6);
            c.restore();
        }, 1.9);
    }
    function envelope(g, i, part, lt) {
        const e = ENV[i];
        // squash on every landing and on the stamp
        const hits = [...SLIPS.filter((s) => s.env === i).map((s) => s.land), STAMP_AT[i]];
        let sq = 1;
        for (const at of hits) {
            const k = drawing(lt, at);
            if (k === 0) sq = 0.965;
            else if (k === 1) sq = 1.012;
        }
        g.save();
        g.translate(e.x, e.y);
        g.rotate(e.rot);
        g.scale(2 - sq, sq);
        if (part === 'back') envBack(i).draw(g);
        else {
            envFront(i).draw(g);
            const mine = SLIPS.filter((s) => s.env === i);
            // fill: one step per landed slip, grown over three drawings
            let fill = 0, total = 0;
            for (const s of mine) {
                const u = E.clamp((drawing(lt, s.land) + 1) / 3);
                if (lt >= s.land) (fill += u / mine.length), (total += s.amount * E.clamp((drawing(lt, s.land) + 1) / 4));
            }
            const x0 = -e.w / 2 + 19, x1 = e.w / 2 - 19;
            if (fill > 0) D.markerPath(g, [[x0, -122], [x1, -122]], { w: 18, color: i ? '#2f8a5c' : BRAND.col.brand, edge: i ? '#7cc49c' : '#f0a08e', seed: 'tx-gauge' + i, upto: (x1 - x0) * fill, seg: [26, 40] });
            // the running figure, written in marker on the routing table
            Props.kit.hand(g, money(total), e.w / 2 - 20, -30, 34, BRAND.col.ink, { align: 'right' });
            // «ready»: the stamp lands head-on on the beat
            const k = drawing(lt, STAMP_AT[i]);
            if (lt >= STAMP_AT[i]) {
                g.save();
                g.translate(-2, -100);
                g.rotate(i ? 0.1 : -0.13);
                const s = (k === 0 ? 1.3 : 1) * 0.8;
                g.scale(s, s);
                g.globalAlpha = k === 0 ? 0.55 : 0.95;
                readyStamp().draw(g);
                g.restore();
                if (k < 3) sprite('tx-stampticks', { x: -150, y: -80, w: 300, h: 160 }, (c) => {
                    for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) P.markerStroke(c, [[sd * 104, -26 + j * 26], [sd * 136, -36 + j * 34]], GREEN, 5, 'txst' + sd + j, 0.9);
                }, 1.8).draw((g.save(), g.translate(-2, -100), g.scale(0.8, 0.8), g));
                if (k < 3) g.restore();
            }
        }
        g.restore();
    }
    // the rubber-stamp impression: double rounded frame, a check and the word, ink gaps
    function readyStamp() {
        const text = BRAND.copy.ready;
        return sprite('tx-ready' + text, { x: -130, y: -50, w: 260, h: 100 }, (c) => {
            c.font = `700 30px "${BRAND.font}"`;
            const tw = c.measureText(text).width, w = Math.min(250, tw + 84), x0 = -w / 2;
            c.strokeStyle = GREEN;
            c.lineWidth = 5;
            c.beginPath();
            c.roundRect(x0, -34, w, 68, 12);
            c.stroke();
            c.lineWidth = 2;
            c.beginPath();
            c.roundRect(x0 + 7, -27, w - 14, 54, 8);
            c.stroke();
            P.markerStroke(c, [[x0 + 18, 0], [x0 + 28, 12], [x0 + 48, -14]], GREEN, 7, 'tx-check', 1);
            Props.print(c, text, x0 + 58, 11, Math.min(30, (w - 76) / tw * 30), GREEN, { weight: 700, alpha: 1 });
            // the ink misses the paper here and there
            const r = P.rng('tx-readyink');
            c.globalCompositeOperation = 'destination-out';
            for (let k = 0; k < 140; k++) {
                c.globalAlpha = 0.4 + r() * 0.6;
                c.beginPath();
                c.arc(x0 + r() * w, -36 + r() * 72, 0.6 + r() * 1.8, 0, 7);
                c.fill();
            }
            c.globalCompositeOperation = 'source-over';
            c.globalAlpha = 1;
        }, 2);
    }

    // ------------------------------------------------------------------ the slips
    function slip(kind, seed) {
        const cl = BRAND.col;
        if (kind === 'inv') return sprite('tx-inv' + seed, { x: -48, y: -60, w: 96, h: 120 }, (c) => {
            cut(c, [[-38, -50], [38, -49], [37, 50], [-37, 49]], '#ffffff', 'tx-inv' + seed, {
                border: 1.6, shadow: 0.22, jag: 0.5, tex: { alpha: [0.06, 0.14] },
                inner: (cc) => {
                    Props.mark(cc, -24, -36, 0.16, 'txi' + seed);
                    cc.fillStyle = cl.navy;
                    cc.fillRect(4, -41, 26, 5);
                    cc.fillStyle = 'rgba(40,30,40,0.35)';
                    cc.fillRect(4, -32, 18, 3);
                    for (let k = 0; k < 4; k++) (cc.fillRect(-30, -14 + k * 11, 30 - (k * 7) % 12, 3), cc.fillRect(14, -14 + k * 11, 16, 3));
                    cc.fillStyle = cl.brand;
                    cc.globalAlpha = 0.2;
                    cc.fillRect(-32, 30, 64, 12);
                    cc.globalAlpha = 1;
                    cc.fillRect(12, 34, 18, 4);
                },
            });
        }, 2.2);
        // a till receipt: narrow thermal paper, torn zigzag at the bottom
        return sprite('tx-rec' + seed, { x: -40, y: -70, w: 80, h: 140 }, (c) => {
            const zig = [...Array(9)].map((_, k) => [26 - k * 6.5, 58 + (k % 2 ? -5 : 0)]);
            cut(c, [[-26, -60], [26, -59], ...zig], '#fbfaf3', 'tx-rec' + seed, {
                border: 1.4, shadow: 0.22, jag: 0.5, tex: { alpha: [0.06, 0.14] },
                inner: (cc) => {
                    cc.fillStyle = '#4a4550';
                    cc.fillRect(-14, -50, 28, 5);
                    D.wordBars(cc, { x: -20, y: -38, w: 40, h: 34 }, { cols: 40, rowH: 7, barH: 2.4, ink: '#6d6874', seed: 'tx-rb' + seed });
                    cc.setLineDash([3, 3]);
                    cc.strokeStyle = '#6d6874';
                    cc.lineWidth = 1;
                    cc.beginPath();
                    cc.moveTo(-20, 2);
                    cc.lineTo(20, 2);
                    cc.stroke();
                    cc.setLineDash([]);
                    cc.fillStyle = '#3a3540';
                    cc.fillRect(-20, 10, 14, 5);
                    cc.fillRect(4, 10, 16, 5);
                    for (let k = 0; k < 9; k++) cc.fillRect(-18 + k * 4, 28, k % 3 ? 1.2 : 2.4, 14); // barcode
                },
            });
        }, 2.2);
    }
    // where slip j sits once landed (office units) and its rotation
    function landPose(s) {
        const e = ENV[s.env], [ox, oy] = rot2([s.dx, -e.h + 14 - s.peek + 50], e.rot);
        return [e.x + ox, e.y + oy, s.rot + e.rot];
    }
    function drawSlips(g, lt) {
        SLIPS.forEach((s, j) => {
            const t0 = s.land - FALL;
            if (lt < t0) return;
            const [lx, ly, lr] = landPose(s);
            let x = lx, y = ly, r = lr;
            if (lt < s.land) {
                // out of the cloud's belly, a gravity fall with a flutter, on twos
                const u = E.clamp((q2(lt) - t0) / FALL), d = drawing(lt, t0);
                const sx = CLOUD.x + (s.env ? 24 : -24), sy = CLOUD.y + 6;
                x = E.lerp(sx, lx, E.out(u)) + Math.sin(d * 1.7 + j) * 10 * (1 - u);
                y = E.lerp(sy, ly, u * u * 0.6 + u * 0.4);
                r = lr + Math.sin(d * 1.3 + j * 2) * 0.35 * (1 - u);
            }
            g.save();
            g.translate(x, y);
            g.rotate(r);
            slip(s.kind, j).draw(g);
            g.restore();
        });
    }
    function cloud(g, lt) {
        const d = drawing(lt);
        let sx = 1, sy = 1;
        // a small hiccup each time a slip leaves it
        for (const s of SLIPS) {
            const k = drawing(lt, s.land - FALL);
            if (k === 0) (sx = 1.06), (sy = 0.92);
            else if (k === 1) (sx = 0.98), (sy = 1.04);
        }
        g.save();
        g.translate(CLOUD.x, CLOUD.y + Math.sin(d * 0.35) * 3);
        g.scale(CLOUD.s * sx, CLOUD.s * sy);
        sprite('tx-cloud', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'txc'), 2.4).draw(g);
        g.restore();
    }

    // ------------------------------------------------------------------ the calendar
    const CAL = Office.CAL;
    const PG = { xa: CAL.x0 - 5, xb: CAL.x1 + 4, h0: CAL.y0 + 13, h1: CAL.y1 + 3 };
    const pageBox = { x: PG.xa, y: PG.h0, w: PG.xb - PG.xa, h: PG.h1 - PG.h0 };
    // the current page alone (clipped out of the calendar), to turn it
    function pageFront(p) {
        return sprite('tx-calpage' + p, pageBox, (c) => {
            c.beginPath();
            c.moveTo(PG.xa + 2, PG.h0);
            c.lineTo(PG.xb, PG.h0 + 4);
            c.lineTo(PG.xb - 3, PG.h1);
            c.lineTo(PG.xa, PG.h1 - 4);
            c.closePath();
            c.clip();
            Office.calendar(c, p);
        }, 2);
    }
    function pageBack(p) {
        return sprite('tx-calback' + p, pageBox, (c) => {
            cut(c, [[CAL.x0, PG.h0 + 1], [CAL.x1, PG.h0 + 4], [CAL.x1 - 4, CAL.y1], [CAL.x0 - 2, CAL.y1 - 4]], '#f3eee2', 'tx-calback' + p, { border: 1.6, shadow: 0, tex: { alpha: [0.1, 0.2] } });
            c.save();
            c.globalAlpha = 0.12;
            pageFront(p).draw(c); // the print shows through
            c.restore();
        }, 2);
    }
    // a page turning up over the binding: angle th (0 flat, π up against the wall above);
    // the lower part lags (the paper curls), the right corner more than the left
    function turnPage(g, p, th) {
        const { xa, xb, h0, h1 } = PG, H = h1 - h0, cx = (xa + xb) / 2;
        const at = (u, v) => {
            const a = Math.max(0, th - Math.sin(th) * 0.55 * v * v * (0.75 + 0.5 * u));
            const z = H * v * Math.sin(a), f = 1 / (1 - z / 900);
            return [cx + (E.lerp(xa, xb, u) - cx) * f, h0 + H * v * Math.cos(a) * f];
        };
        const q = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
        const bil = (u, v) => {
            const t = E.lerpPt(q[0], q[1], u), b = E.lerpPt(q[3], q[2], u);
            return E.lerpPt(t, b, v);
        };
        const bend = (u, v) => { const p1 = at(u, v), p0 = bil(u, v); return [p1[0] - p0[0], p1[1] - p0[1]]; };
        const outline = [...[0, 0.25, 0.5, 0.75, 1].map((v) => at(0, v)), ...[0.5, 1].map((u) => at(u, 1)), ...[0.75, 0.5, 0.25, 0].map((v) => at(1, v))];
        // its shadow on the page below
        g.save();
        g.fillStyle = 'rgba(40,20,30,0.16)';
        g.beginPath();
        outline.forEach(([x, y], k) => (k ? g.lineTo(x + 5, y + 8) : g.moveTo(x + 5, y + 8)));
        g.fill();
        g.restore();
        const src = th < Math.PI / 2 ? pageFront(p) : pageBack(p);
        Motion.quad(g, src.canvas, q, 8, null, { bend });
        // it darkens as it faces away from the light
        g.save();
        g.fillStyle = th < Math.PI / 2 ? 'rgba(60,40,50,1)' : 'rgba(40,30,40,1)';
        g.globalAlpha = th < Math.PI / 2 ? 0.2 * Math.sin(th) : 0.08;
        g.beginPath();
        outline.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.fill();
        g.restore();
    }
    const TURN = [0.35, 0.85, 1.35, 1.8, 2.2]; // θ per drawing of a turn
    function calendar(g, lt) {
        g.save();
        g.translate(CALT.cx, CALT.cy);
        g.scale(CALT.s, CALT.s);
        g.translate(-(CAL.x0 + CAL.x1) / 2, -(CAL.y0 + CAL.y1) / 2);
        let page = 0, turning = -1, th = 0;
        FLIPS.forEach((at, k) => {
            const dd = drawing(lt, at);
            if (lt >= at && dd >= TURN.length) page = k + 1;
            else if (lt >= at) (page = k + 1), (turning = k), (th = TURN[dd]);
        });
        Office.calendar(g, page);
        // the deadline, circled in marker once the forms are ready
        if (page === 3 && lt >= 4.75) {
            const cw = (CAL.x1 - CAL.x0 - 24) / 7, first = (3 * 3 + 1) % 7, idx = first + 19;
            const cx = CAL.x0 + 12 + cw * ((idx % 7) + 0.5), cy = CAL.y0 + 162 + Math.floor(idx / 7) * 15 - 4;
            const ring = [...Array(24)].map((_, j) => { const a = (j / 20) * Math.PI * 2 - 2.2; return [cx + Math.cos(a) * (14 + j * 0.15), cy + Math.sin(a) * 10.5]; });
            D.markerPath(g, ring, { w: 3.4, color: '#c0392b', edge: '#e98a78', seed: 'tx-dl', upto: 120 * E.clamp((drawing(lt, 4.75) + 1) / 4), seg: [14, 22] });
        }
        if (turning >= 0) turnPage(g, turning, th);
        g.restore();
    }

    // ------------------------------------------------------------------ Laura and her mug
    const LX = 470, LY = 660, LS = 0.92;
    const HOLD = { m: [84, -196], r: 0, el: [206, -104] };
    const SIP = { m: [16, -348], r: -0.36, el: [222, -196] };
    const TOAST = { m: [104, -262], r: 0.1, el: [230, -138] };
    const mix = (a, b, u) => ({ m: E.lerpPt(a.m, b.m, u), r: E.lerp(a.r, b.r, u), el: E.lerpPt(a.el, b.el, u) });
    function mugPose(lt) {
        const t = q2(lt);
        if (t < 0.33) return HOLD;
        if (t < 0.58) return mix(HOLD, SIP, E.inOut(E.seg(t, 0.25, 0.58)));
        if (t < 1.25) return SIP;
        if (t < 1.58) return mix(SIP, HOLD, E.inOut(E.seg(t, 1.25, 1.58)));
        if (t < 4.5) return HOLD;
        if (t < 4.75) return mix(HOLD, TOAST, E.back(E.seg(t, 4.5, 4.75)));
        if (t < 5.4) return TOAST;
        return mix(TOAST, HOLD, E.inOut(E.seg(t, 5.4, 5.8)));
    }
    const MUG = { w: 80, h: 96 };
    function mugSprite() {
        const { w, h } = MUG, top = -h / 2, bot = h / 2;
        return sprite('tx-mug', { x: -w / 2 - 12, y: -h / 2 - 14, w: w + 50, h: h + 30 }, (c) => {
            cut(c, P.noodle(D.spline([[w / 2 - 6, top + 22], [w / 2 + 22, top + 22], [w / 2 + 26, top + 58], [w / 2 - 6, top + 70]], 8, false), 13), '#f6efe2', 'tx-mughandle', { border: 2, shadow: 0.25 });
            cut(c, D.cspline([[-w / 2, top], [-w / 2 + 2, bot - 12], [-w / 2 + 12, bot], [w / 2 - 12, bot], [w / 2 - 2, bot - 12], [w / 2, top]], 5), '#f6efe2', 'tx-mugbody', {
                border: 2.4, shadow: 0.28, tex: { alpha: [0.15, 0.3] },
                inner: (cc) => {
                    cc.fillStyle = BRAND.col.brand;
                    cc.fillRect(-w / 2 - 4, top + 28, w + 8, 11);
                    cc.fillStyle = BRAND.col.navy;
                    cc.fillRect(-w / 2 - 4, top + 43, w + 8, 4);
                    P.markerStroke(cc, [[-16, top + 68], [-6, top + 62], [4, top + 69], [14, top + 62]], BRAND.col.green, 2.6, 'tx-mugdoodle', 0.8);
                    cc.fillStyle = 'rgba(255,255,255,0.45)';
                    cc.fillRect(-w / 2 + 8, top + 8, 6, h - 22);
                },
            });
            cut(c, [...Array(36)].map((_, k) => [Math.cos(k / 36 * 6.283) * w / 2, top + Math.sin(k / 36 * 6.283) * 7]), D.shade('#f6efe2', -6), 'tx-mugrim', { border: 1.6, shadow: 0.1 });
            P.cutout(c, [...Array(32)].map((_, k) => [Math.cos(k / 32 * 6.283) * (w / 2 - 6), top + 2 + Math.sin(k / 32 * 6.283) * 4.5]), '#5a3a2a', 'tx-coffee', { border: 0, shadow: 0, tex: { alpha: [0.2, 0.4] } });
        }, 2);
    }
    // wrist, elbow and hand angle for a mug pose (the handle sits in the grip's anchor)
    // her left hand wrapped round the mug's body (the handle turned away, on the far side)
    function armFor(pose) {
        const w = Laura.wrap(pose.m, pose.r, 'left', MUG.w);
        return { wrist: w.wrist, el: pose.el, r: w.rot, w };
    }
    function mugSteam(g, pose, lt) {
        const kit = Props.kit, t = q2(lt), top = rot2([0, -MUG.h / 2], pose.r);
        g.save();
        g.beginPath();
        g.rect(pose.m[0] + top[0] - 200, pose.m[1] + top[1] - 300, 400, 300);
        g.clip();
        for (let i = 0; i < 2; i++) {
            const life = 2.2, age = t + i * 1.1 + 2, f = (age % life) / life, cyc = Math.floor(age / life);
            g.save();
            g.globalAlpha = E.seg(f, 0, 0.15) * (1 - E.seg(f, 0.5, 1)) * 0.9;
            g.translate(pose.m[0] + top[0] - 10 + i * 16 + f * 24, pose.m[1] + top[1] + 40 - E.out(f) * 80);
            g.rotate(0.05 + f * 0.1);
            g.scale(1 + f * 0.4, 1 + f * 0.2);
            kit.wisp(`txmug${i}-${cyc % 3}`, { len: 150, width: 11, drift: 1, color: '#fffdf6' }).draw(g);
            g.restore();
        }
        g.restore();
    }
    function laura(g, lt, layer) {
        const t = q2(lt), pose = mugPose(lt), arm = armFor(pose);
        const sipping = t >= 0.5 && t < 1.34;
        const blink = [2.25, 3.75].some((b) => t >= b && t < b + 0.09);
        const eyes = sipping || blink ? 'closed' : t >= 4.5 && t < 5.4 ? 'happy' : t >= 5.5 && t < 5.75 ? 'wink' : 'open';
        const look = t < 0.4 ? [0.9, 0.4] : t < 2.4 ? [1, -0.5] : t < 4.1 ? [1, 0.35] : [1, -0.4];
        const mouth = t >= 4.5 && t < 5.5 ? 'grin' : 'smile';
        const arms = [Laura.ARMS.desk[0], [[118, -250], arm.el, arm.wrist]];
        if (layer === 'body') return Laura.draw(g, LX, LY, LS, { t: lt, eyes, look, mouth, tilt: t >= 4.5 && t < 5.5 ? 0.06 : 0.02, layer: 'body' });
        Laura.draw(g, LX, LY, LS, { t: lt, arms, hands: ['rest', null], layer: 'arms' });
        // the mug in her hand: thumb behind, fingers round the front
        g.save();
        g.translate(LX, LY + Math.sin((Math.floor(lt * 12) / 12) * 2.4) * 1.5);
        g.scale(LS, LS);
        arm.w.draw(g, () => {
            g.save();
            g.translate(pose.m[0], pose.m[1]);
            g.rotate(pose.r);
            g.scale(-1, 1);
            mugSprite().draw(g);
            g.restore();
        });
        if (!sipping) mugSteam(g, pose, lt);
        g.restore();
    }

    function brandMark(g, x, y, s) {
        Props.kit.sprite('brand-mark', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'set'), 2).draw((g.save(), g.translate(x, y), g.scale(s, s), g));
        g.restore();
    }

    Shots.taxes = (g, lt, env) => {
        const push = CAM.s * (1 + 0.035 * E.inOut(E.seg(lt, 0, 6)));
        g.save();
        g.translate(800, 450);
        g.scale(push, push);
        g.translate(-CAM.x, -CAM.y);
        Office.back(g, lt, { calendar: false });
        calendar(g, lt);
        laura(g, lt, 'body');
        Office.desk(g, lt);
        envelope(g, 0, 'back', lt);
        envelope(g, 1, 'back', lt);
        drawSlips(g, lt);
        envelope(g, 0, 'front', lt);
        envelope(g, 1, 'front', lt);
        cloud(g, lt);
        laura(g, lt, 'arms');
        // the desk mug is in her hand: leave it out of the front layer
        g.save();
        g.beginPath();
        g.rect(-200, -200, 2000, 1300);
        g.rect(610, 300, 190, 412);
        g.clip('evenodd');
        Office.front(g, lt);
        g.restore();
        g.restore();
        if (lt < 3.9) Shots.title(g, lt, 0.5, BRAND.copy.quarter, 90, 826, 56);
        else Shots.title(g, lt, 4.0, BRAND.copy.taxDue, 90, 826, 56, { under: BRAND.col.green });
        brandMark(g, 1500, 820, 0.55);
    };
})();
