// Block «business» of the edit (see ../../scene.js EDIT). Defines Shots.business(g, lt, env).
//
// Laura asks the assistant. The office medium shot; the brand cloud floats at the upper
// right with a rolled-up paper scroll hanging from it on two strings. A paper speech bubble
// pops out of Laura's mouth and her question types itself in (0–0.9); the bubble flies into
// the cloud (1.0–1.5), the cloud gulps it and the scroll unrolls (1.5–1.92): a sheet of
// graph paper with the clients on paper tags. On the beats (2.0–3.5) a bar cut from a
// different printed paper slides out of the paper baseline for each client, its percent on
// a tag. Laura points at the top bar (3.6), which gets circled in marker (4.0).
(() => {
    const P = Paper, D = PaperDetail, E = Ease;
    const sprite = (...a) => Props.sprite(...a);
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.2, shadow: 0.18, ...o });
    const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const drawing = (lt, t0 = 0) => Math.floor((lt - t0) * 12 + 1e-6);
    const q2 = (lt) => Math.floor(lt * 12 + 1e-6) / 12;

    const LX = 470, LY = 660, LS = 0.92;
    const CLOUD = { x: 1122, y: 104, s: 1.8 };
    const SH = { x: 856, y: 200, w: 536, h: 372 }; // the chart sheet (world units)
    const BASE = 186; // the paper baseline, sheet-local x
    const ROW = (i) => 54 + i * 88, BAR_H = 56, BAR_MAX = 256;
    const BAR_AT = [2.0, 2.5, 3.0, 3.5]; // each bar lands on the beat
    const UNROLL = [1.5, 1.92];

    // ------------------------------------------------------------------ the sheet
    function sheet() {
        const { w, h } = SH, cl = BRAND.copy.clients;
        return sprite('bz-sheet' + cl.map((c) => c[0]).join('|'), { x: -14, y: -10, w: w + 28, h: h + 24 }, (c) => {
            cut(c, [[0, 0], [w, 1], [w - 1, h], [1, h - 1]], '#fbf8ef', 'bz-sheet', {
                border: 2.4, shadow: 0.24, jag: 0.5, tex: { alpha: [0.06, 0.14] },
                inner: (cc) => {
                    // graph paper: fine blue grid, every fifth line stronger, a coral margin
                    cc.fillStyle = '#6f9ccc';
                    for (let x = 10; x < w; x += 18) (cc.globalAlpha = (x - 10) % 90 ? 0.16 : 0.32), cc.fillRect(x, 0, 1, h);
                    for (let y = 12; y < h; y += 18) (cc.globalAlpha = (y - 12) % 90 ? 0.16 : 0.32), cc.fillRect(0, y, w, 1);
                    cc.globalAlpha = 0.5;
                    cc.fillStyle = BRAND.col.brand;
                    cc.fillRect(26, 0, 1.6, h);
                    cc.globalAlpha = 1;
                },
            });
            Props.mark(c, w - 30, h - 24, 0.28, 'bzs');
            // the percent scale along the bottom, pencilled
            c.font = '15px "Hand"';
            c.fillStyle = '#6a6470';
            c.textAlign = 'center';
            for (let k = 0; k <= 4; k++) {
                const x = BASE + (BAR_MAX * k * 10) / 38;
                c.fillRect(x, h - 26, 1.4, 8);
                c.fillText(k * 10 + '%', x, h - 6);
            }
            // the clients on paper tags, a hole and a string loop at the left
            cl.forEach(([name], i) => {
                const y = ROW(i), col = ['#e9dcc0', '#f4efe2', '#e7d3b0', '#efe6d4'][i];
                const tag = [[34, y - 21], [BASE - 22, y - 22], [BASE - 6, y], [BASE - 22, y + 21], [34, y + 22]];
                cut(c, tag, col, 'bz-tag' + i, { border: 1.8, shadow: 0.22, tex: { alpha: [0.15, 0.3] } });
                c.fillStyle = '#3a3040';
                c.beginPath();
                c.arc(46, y, 4, 0, 7);
                c.fill();
                P.markerStroke(c, [[46, y], [34, y - 10], [20, y - 6], [14, y + 8], [30, y + 12], [46, y]], '#c0392b', 1.4, 'bz-str' + i, 0.9);
                c.font = `${name.length > 13 ? 19 : 23}px "Hand"`;
                c.fillStyle = BRAND.col.ink;
                c.textAlign = 'right';
                c.fillText(name, BASE - 26, y + 8);
            });
            c.textAlign = 'left';
        }, 1.8);
    }
    function baseline() {
        return sprite('bz-baseline', { x: BASE - 12, y: 10, w: 24, h: SH.h - 30 }, (c) => {
            cut(c, [[BASE - 5, 18], [BASE + 5, 19], [BASE + 6, SH.h - 26], [BASE - 4, SH.h - 25]], BRAND.col.ink, 'bz-base', { border: 1.8, shadow: 0.25, tex: { alpha: [0.2, 0.4] } });
        }, 1.8);
    }
    // bars, each cut from a different printed paper
    const PAPERS = [
        ['#e9b949', (c, box) => { c.fillStyle = '#d2563f'; const r = P.rng('bz-dots'); for (let y = box.y + 6; y < box.y + box.h; y += 14) for (let x = box.x + ((y / 14) % 2) * 7; x < box.x + box.w; x += 14) (c.beginPath(), c.arc(x + r() * 1.5, y, 3.2, 0, 7), c.fill()); }],
        ['#a9c9a4', (c, box) => D.mapPaper(c, box, { seed: 'bz-map' })],
        ['#f3e7c4', (c, box) => D.sheetMusic(c, box, { seed: 'bz-music', sp: 6, period: 50 })],
        ['#e6e3dc', (c, box) => D.wordBars(c, box, { cols: 60, rowH: 9, barH: 3.4, ink: '#77726c', seed: 'bz-news', blocks: [[8, 6, 40, 30]] })],
    ];
    const barLen = (i) => (BRAND.copy.clients[i][1] / 38) * BAR_MAX;
    function bar(i) {
        const L = barLen(i), [col, print] = PAPERS[i];
        return sprite('bz-bar' + i + '-' + Math.round(L), { x: -10, y: -BAR_H / 2 - 10, w: L + 24, h: BAR_H + 22 }, (c) => {
            cut(c, [[-6, -BAR_H / 2], [L, -BAR_H / 2 + 1], [L + 1, BAR_H / 2 - 1], [-6, BAR_H / 2]], col, 'bz-bar' + i, {
                border: 2.2, shadow: 0.26, tex: { alpha: [0.15, 0.3] }, inner: print,
            });
        }, 1.8);
    }
    function pctTag(i) {
        const text = BRAND.copy.pct ? BRAND.copy.pct(BRAND.copy.clients[i][1]) : BRAND.copy.clients[i][1] + '%';
        return sprite('bz-pct' + i + text, { x: -8, y: -24, w: 90, h: 48 }, (c) => {
            cut(c, [[0, -17], [70, -18], [72, 17], [2, 18]], '#ffffff', 'bz-pct' + i, { border: 1.6, shadow: 0.25, tex: { alpha: [0.06, 0.14] } });
            Props.print(c, text, 36, 9, 24, i === 0 ? BRAND.col.brand : BRAND.col.ink, { weight: 700, align: 'center' });
        }, 2);
    }
    // the paper roll at the bottom edge of the scroll
    function roll() {
        return sprite('bz-roll', { x: -14, y: -18, w: SH.w + 28, h: 36 }, (c) => {
            cut(c, P.roundRect(-6, -13, SH.w + 12, 26, 12), '#f4efe2', 'bz-roll', {
                border: 2, shadow: 0.3, tex: { alpha: [0.1, 0.2] },
                inner: (cc) => {
                    cc.fillStyle = 'rgba(80,60,70,0.16)';
                    cc.fillRect(-6, 4, SH.w + 12, 9);
                    cc.fillStyle = 'rgba(255,255,255,0.6)';
                    cc.fillRect(-6, -8, SH.w + 12, 3);
                },
            });
            for (const x of [-6, SH.w + 6]) cut(c, P.ellipse(x, 0, 6, 13, 20), '#ddd3be', 'bz-rollend' + x, { border: 1.2, shadow: 0.1 });
        }, 1.8);
    }
    function rod(c) {
        cut(c, P.noodle([[-18, -6], [SH.w + 18, -6]], 11), '#b8814f', 'bz-rod', { border: 1.8, shadow: 0.3, inner: (cc, box) => D.woodGrain(cc, box, '#b8814f', { seed: 'bz-rod' }) });
        for (const x of [-22, SH.w + 22]) cut(c, P.ellipse(x, -6, 10, 10, 24), '#9c6a3f', 'bz-knob' + x, { border: 1.6, shadow: 0.3 });
    }
    function chart(g, lt) {
        const t = q2(lt), u = E.inOut(E.seg(t, UNROLL[0], UNROLL[1])), reveal = Math.max(0, SH.h * u);
        g.save();
        g.translate(SH.x, SH.y);
        // strings up to the cloud
        P.markerStroke(g, [[20, -8], [CLOUD.x - SH.x - 60, CLOUD.y - SH.y + 40]], '#5a4a46', 3, 'bz-cordL', 0.95);
        P.markerStroke(g, [[SH.w - 20, -8], [CLOUD.x - SH.x + 60, CLOUD.y - SH.y + 40]], '#5a4a46', 3, 'bz-cordR', 0.95);
        if (reveal > 2) {
            g.save();
            g.beginPath();
            g.rect(-20, -4, SH.w + 40, Math.min(reveal, SH.h) + 20);
            g.clip();
            sheet().draw(g);
            // bars slide out from behind the baseline, landing on the beat
            BRAND.copy.clients.forEach((_, i) => {
                if (lt < BAR_AT[i] - 0.25) return;
                const v = E.out(E.seg(t, BAR_AT[i] - 0.25, BAR_AT[i])), over = drawing(lt, BAR_AT[i]) === 0 ? 6 : 0;
                g.save();
                g.beginPath();
                g.rect(BASE, ROW(i) - 50, SH.w, 100);
                g.clip();
                g.translate(BASE - barLen(i) * (1 - v) + over, ROW(i));
                bar(i).draw(g);
                g.restore();
            });
            baseline().draw(g);
            BRAND.copy.clients.forEach((_, i) => {
                const k = drawing(lt, BAR_AT[i]);
                if (lt < BAR_AT[i]) return;
                const s = k === 0 ? 0.6 : k === 1 ? 1.15 : 1;
                g.save();
                g.translate(BASE + barLen(i) + 14, ROW(i) - (i === 0 ? 0 : 0));
                g.rotate([-0.06, 0.05, -0.03, 0.07][i]);
                g.scale(s, s);
                pctTag(i).draw(g);
                g.restore();
            });
            // the top client, circled in marker
            if (lt >= 4.0) {
                const cx = 290, cy = ROW(0) + 2, rx = 254, ry = 42;
                const ring = [...Array(44)].map((_, j) => { const a = (j / 40) * Math.PI * 2 + 2.6; return [cx + Math.cos(a) * (rx + j * 0.4), cy + Math.sin(a) * (ry - j * 0.12)]; });
                D.markerPath(g, ring, { w: 5, color: '#c0392b', edge: '#ea8b79', seed: 'bz-ring', upto: 1200 * E.clamp((drawing(lt, 4.0) + 1) / 5), seg: [30, 50] });
            }
            g.restore();
        }
        // the roll: rolled up under the rod, then travelling down as it unrolls
        if (u < 1 || t < UNROLL[1]) {
            g.save();
            g.translate(0, Math.min(SH.h, reveal) + 4);
            roll().draw(g);
            g.restore();
        } else {
            g.save();
            g.translate(0, SH.h + 2);
            g.scale(1, 0.55);
            roll().draw(g);
            g.restore();
        }
        sprite('bz-rod', { x: -40, y: -24, w: SH.w + 80, h: 36 }, rod, 1.8).draw(g);
        g.restore();
    }

    // ------------------------------------------------------------------ the question
    function bubbleSize(g) {
        g.save();
        g.font = `700 34px "${BRAND.font}"`;
        const tw = g.measureText(BRAND.copy.askAI).width;
        g.restore();
        return { tw, w: tw + 64, h: 84 };
    }
    function bubble(w, h) {
        return sprite('bz-bubble' + Math.round(w), { x: -w / 2 - 20, y: -h / 2 - 16, w: w + 40, h: h + 80 }, (c) => {
            const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2;
            cut(c, D.cspline([[x0 + 20, y0], [x1 - 20, y0 - 2], [x1, y0 + 20], [x1 + 1, y1 - 18], [x1 - 20, y1], [x0 + 64, y1], [x0 + 18, y1 + 44], [x0 + 38, y1], [x0 + 18, y1 + 1], [x0, y1 - 20], [x0 - 1, y0 + 20]], 4), '#ffffff', 'bz-bubble', {
                border: 2.6, shadow: 0.24, tex: { alpha: [0.06, 0.14] },
            });
        }, 1.8);
    }
    const BUB = { x: 0, y: 250 }; // centre y; x from its width (its left edge at 590)
    function question(g, lt, sz) {
        const t = q2(lt);
        if (lt >= 1.5) return;
        let x = 590 + sz.w / 2, y = BUB.y, s = 1, r = -0.02;
        if (t < 0.25) s = [0.35, 0.8, 1.08][drawing(lt)] ?? 1;
        if (lt >= 1.0) {
            const v = E.inOut(E.seg(t, 1.0, 1.5));
            const p = P.bezier([x, y], [x + 120, y - 150], [CLOUD.x - 60, CLOUD.y - 110], [CLOUD.x, CLOUD.y + 6], 30);
            [x, y] = p[Math.min(29, Math.round(v * 29))];
            s = E.lerp(1, 0.22, v);
            r = E.lerp(-0.02, 0.4, v);
        }
        g.save();
        g.translate(x, y);
        g.rotate(r);
        g.scale(s, s);
        bubble(sz.w, sz.h).draw(g);
        // the question types itself in, on twos, with a caret
        const text = BRAND.copy.askAI, n = lt >= 1.0 ? text.length : Math.min(text.length, Math.max(0, drawing(lt, 0.25) * 2));
        const x0 = -sz.tw / 2;
        Props.print(g, text.slice(0, n), x0, 12, 34, BRAND.col.ink, { weight: 700, alpha: 1 });
        if (lt < 1.0 && (n < text.length || drawing(lt) % 4 < 2)) {
            g.save();
            g.font = `700 34px "${BRAND.font}"`;
            const cw = g.measureText(text.slice(0, n)).width;
            g.fillStyle = BRAND.col.brand;
            g.fillRect(x0 + cw + 4, -18, 4, 38);
            g.restore();
        }
        g.restore();
    }
    function cloud(g, lt) {
        const d = drawing(lt), k = drawing(lt, 1.5);
        let sx = 1, sy = 1;
        if (lt >= 1.5 && k < 4) [sx, sy] = [[1.12, 0.88], [0.94, 1.08], [1.03, 0.97], [1, 1]][k];
        g.save();
        g.translate(CLOUD.x, CLOUD.y + Math.sin(d * 0.35) * 3);
        g.scale(CLOUD.s * sx, CLOUD.s * sy);
        sprite('bz-cloud', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'bzc'), 2.4).draw(g);
        g.restore();
    }

    // ------------------------------------------------------------------ Laura
    const DESK = Laura.ARMS.desk;
    const POINT = [DESK[0], [[118, -250], [250, -150], [346, -222]]];
    function lauraOpts(lt) {
        const t = q2(lt);
        const talking = t >= 0.1 && t < 0.9;
        const look = t < 1.0 ? [1, -0.7] : t < 1.7 ? [1, -1] : [1, -0.3];
        const eyes = t >= 4.3 && t < 5 ? 'happy' : t >= 1.75 && t < 1.84 ? 'closed' : 'open';
        const mouth = talking ? (drawing(lt) % 4 < 2 ? 'o' : 'smile') : t >= 1.5 && t < 3.6 ? 'o' : t >= 3.6 ? 'grin' : 'smile';
        // the pointing arm rises in three drawings
        const v = E.clamp((drawing(lt, 3.6) + 1) / 3);
        const arms = lt < 3.6 ? DESK : [DESK[0], DESK[1].map((p, j) => E.lerpPt(p, POINT[1][j], E.inOut(v)))];
        const hands = lt < 3.6 ? ['rest', 'rest'] : ['rest', v < 0.5 ? 'fist' : 'pointBack'];
        return { t: lt, look, eyes, mouth, arms, hands, tilt: t >= 3.6 ? 0.05 : t >= 1.0 && t < 1.7 ? -0.05 : 0.02 };
    }

    function brandMark(g, x, y, s) {
        Props.kit.sprite('brand-mark', { x: -70, y: -60, w: 140, h: 120 }, (c) => Props.mark(c, 0, 0, 1, 'set'), 2).draw((g.save(), g.translate(x, y), g.scale(s, s), g));
        g.restore();
    }

    Shots.business = (g, lt, env) => {
        const push = 1 + 0.04 * E.inOut(E.seg(lt, 0, 5)), o = lauraOpts(lt), sz = bubbleSize(g);
        g.save();
        g.translate(800, 450);
        g.scale(push, push);
        g.translate(-800, -450);
        Office.back(g, lt, { page: 3 });
        Laura.draw(g, LX, LY, LS, { ...o, layer: 'body' });
        Office.desk(g, lt);
        chart(g, lt);
        question(g, lt, sz);
        cloud(g, lt);
        // the front layer before her arms: the pointing arm passes over the mug's steam
        Office.front(g, lt);
        Laura.draw(g, LX, LY, LS, { ...o, layer: 'arms' });
        g.restore();
        Shots.title(g, lt, 2.0, BRAND.copy.margin, 90, 826, 56);
        brandMark(g, 1500, 820, 0.55);
    };
})();
