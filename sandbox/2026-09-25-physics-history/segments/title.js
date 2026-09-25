// Segment «Title» of physics-history (script v2), after Schrödinger's fade to black: the
// title printed on the night in two passes of ink, «A Brief History of» over «Physics», and
// the film's cat hopping along the tops of the big letters, then hiding behind the last one
// and peeking over it to look at us.
//
//   Seg.title.draw(press, tq, st)   local time 0–T.end (on twos); needs the Shrikhand font
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const { put, line, taper } = Ph;
    const L = Ease.lerp, S = Ease.seg, IO = Ease.inOut;
    const T = { up: [0, 0.4], small: [0.3, 0.9], big: [0.6, 1.5], hops: [1.7, 3.9], peek: [3.95, 4.4], look: 4.55, blink: 5.1, end: 6.0 };
    const DEEP = { navy: 1, blue: 0.75, 'pink.s': 0.35, 'yellow.s': 0.1 };
    const FONT = 'Shrikhand';
    const tone = (v) => `rgba(0,0,0,${v})`;
    // text on the press: knocked out, then inked plate by plate (spec as for put)
    function text(press, str, x, y, size, spec, o = {}) {
        const set = (g) => { g.font = `${size}px ${FONT}`; g.textAlign = o.align ?? 'left'; g.textBaseline = 'alphabetic'; };
        if (o.knock !== false) press.knockout((g) => { set(g); g.fillText(str, x, y); });
        for (const [key, v] of Object.entries(spec)) {
            const [name, kind] = key.split('.');
            const g = press.plate(name, kind === 's' ? 'screen' : 'solid');
            g.save(); set(g); g.fillStyle = tone(v); g.fillText(str, x, y); g.restore();
        }
    }
    const BIG = 250, BASE = 640, WORD = 'Physics';
    // where each letter of «Physics» sits, and the height of its top (ascenders taller)
    function letters(press) {
        const g = press.plate('navy');
        g.save(); g.font = `${BIG}px ${FONT}`;
        const w = g.measureText(WORD).width, x0 = 800 - w / 2, out = [];
        let x = x0;
        for (const ch of WORD) { const cw = g.measureText(ch).width; out.push({ ch, x, cw, top: BASE - (/[Ph]/.test(ch) ? 0.74 : 0.5) * BIG }); x += cw; }
        g.restore();
        return out;
    }
    // the opening card: the same title, simpler: printed on Galileo's night (stars twinkling),
    // no cat; it holds, then the night stays and the letters lift off it for the first shot
    Seg.titleIntro = {
        T: { end: 3.0 },
        init() { return {}; },
        draw(press, tq) {
            const t = tq;
            put(press, (g) => g.rect(0, 0, 1600, 900), DEEP);
            const r = Motion.rng('intro-stars');
            for (let i = 0; i < 160; i++) { const x = r() * 1600, y = r() * 900, rr = 1.2 + r() * 2.4, tw = 0.6 + 0.4 * Math.sin(t * 5 + i); press.knockout((g) => { g.globalAlpha = 0.7 * tw; g.beginPath(); g.arc(x, y, rr, 0, 6.2832); g.fill(); g.globalAlpha = 1; }); }
            // (at the end the title flies past us, full ink, and we are in the night: no fade, which
            // on a riso press darkens the letters into a muddy ghost)
            const ks = S(t, 0.2, 0.7), kb = S(t, 0.45, 1.2), out = Ease.in ? Ease.in(S(t, 2.55, 2.95)) : S(t, 2.55, 2.95);
            press.save(); press.each((g) => { g.translate(800, 470); g.scale(1 + 7 * out, 1 + 7 * out); g.translate(-800, -470); });
            if (out < 1) {
                if (ks > 0) text(press, 'A Brief History of', 800, 380, 64, { yellow: 1, ...(ks > 0.5 ? { 'pink.s': 0.35 } : {}) }, { align: 'center' });
                if (kb > 0) {
                    text(press, WORD, 808, 560 + 10, 190, { navy: 1 }, { align: 'center' });
                    text(press, WORD, 800, 560, 190, { yellow: 1, ...(kb > 0.45 ? { pink: 0.85 } : {}) }, { align: 'center' });
                }
            }
            press.restore();
        },
    };
    Seg.title = {
        T,
        init() { return {}; },
        draw(press, tq) {
            const t = tq;
            put(press, (g) => g.rect(0, 0, 1600, 900), DEEP);
            const LS = letters(press), last = LS[LS.length - 1];
            // the cat's path: in from the left, a hop onto each letter's top, the last hop down
            // behind the final «s»; while it is behind the letters it is drawn first
            const stops = [[-160, BASE - 10], ...LS.map((l) => [l.x + l.cw * 0.5, l.top + 4])];
            const nH = stops.length - 1, hu = S(t, T.hops[0], T.hops[1]) * nH, k = Math.min(nH - 1, Math.floor(hu)), f = hu - k;
            const hopping = t >= T.hops[0] && t < T.hops[1];
            const a = stops[k], b = stops[k + 1], ht = 90 + Math.abs(a[1] - b[1]) * 0.4;
            const cx = L(a[0], b[0], f), cy = L(a[1], b[1], f) - Math.sin(f * Math.PI) * ht;
            const inPeek = t >= T.peek[0];
            const up = inPeek ? (Ease.back ? Ease.back(S(t, T.peek[0], T.peek[1])) : IO(S(t, T.peek[0], T.peek[1]))) : 0;
            const pk = { x: last.x + last.cw * 0.5, y: last.top + 8, s: 1.25, up, look: t < T.look ? [-0.9, 0.3] : [0, 0], blink: Math.abs(t - T.blink) < 0.09 };
            if (inPeek) Cat.peek(press, pk);
            // «A Brief History of», then «Physics»: each printed in two passes (yellow, then its
            // second ink a moment later and a hair out of register), the big word with a navy shadow
            const ks = S(t, T.small[0], T.small[1]), kb = S(t, T.big[0], T.big[1]);
            if (ks > 0) text(press, 'A Brief History of', 800, 330, 84, { yellow: 1, ...(ks > 0.5 ? { 'pink.s': 0.35 } : {}) }, { align: 'center' });
            if (kb > 0) {
                text(press, WORD, 800 + 10, BASE + 12, BIG, { navy: 1 }, { align: 'center' });
                text(press, WORD, 800, BASE, BIG, { yellow: 1, ...(kb > 0.45 ? { pink: 0.85 } : {}) }, { align: 'center' });
            }
            // a thin rule and the six scenes' marks under the title
            const kr = IO(S(t, T.big[1] - 0.2, T.big[1] + 0.4));
            if (kr > 0) line(press, [[800 - 360 * kr, 700], [800 + 360 * kr, 700]], 4, { yellow: 0.9, 'pink.s': 0.3 });
            // the credits, under the rule
            const kc = S(t, T.big[1] + 0.2, T.big[1] + 0.6);
            const kj = S(t, T.big[1] + 0.5, T.big[1] + 0.9);
            if (kj > 0) text(press, 'drawn entirely in JavaScript · no footage, no AI images', 800, 850, 30, { 'blue.s': 0.9 * kj, 'yellow.s': 0.4 * kj }, { align: 'center', knock: kj >= 1 });
            if (kc > 0) text(press, 'illodev × Claude', 800, 790, 58, { 'yellow.s': 0.9 * kc, ...(kc >= 1 ? { 'pink.s': 0.25 } : {}) }, { align: 'center', knock: kc >= 1 });
            if (inPeek && up > 0.4) Cat.peek(press, { ...pk, pawsOnly: true });
            // the hopping cat, in front of the letters
            if (hopping) Cat.run(press, { x: cx, y: cy, s: 0.95, face: 1, ph: hu * 0.5 + 0.2, pounce: Math.sin(f * Math.PI) * 0.8 });
        },
    };
})();
