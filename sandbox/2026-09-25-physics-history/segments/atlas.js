// Segment FIS-08 of physics-history (37–40 s of the piece; local time 0–3): the atlas. Six
// lenses in brass rims (the lens of the first shot, six times), one per figure at their work,
// laid out as a snake on the night and threaded in order by the amber guide line: Galileo,
// Newton, Faraday on top, left to right; Curie, Einstein, Schrödinger below, right to left.
// 0–1: Schrödinger's full frame shrinks into its lens while the others open one by one on
// the half beats; the line draws through them; from 1.9 the frame is complete and holds,
// with only the small motions inside the lenses.
var Seg = globalThis.Seg ?? (globalThis.Seg = {});
(() => {
    const R = 196; // lens radius
    const SLOTS = [
        { n: 'galileo', c: [290, 238] }, { n: 'newton', c: [800, 238] }, { n: 'faraday', c: [1310, 238] },
        { n: 'curie', c: [1310, 662] }, { n: 'einstein', c: [800, 662] }, { n: 'schrodinger', c: [290, 662] },
    ];
    // when each lens opens (local s), Schrödinger's is there from the start (it shrinks in)
    const OPEN = { einstein: 0.25, curie: 0.5, faraday: 0.75, newton: 1.0, galileo: 1.25, schrodinger: 0 };
    const AMBER = { yellow: 1, 'pink.s': 0.55 };
    const BRASS = { yellow: 1, 'pink.s': 0.22, 'navy.s': 0.08 };
    const BRASS_SH = { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.45 };

    function vignette(press, n, lt, ctx) {
        const st = ctx.st, T = 37 + lt;
        if (n === 'newton') return Seg.newtonFaraday.atlasNewton(press, lt);
        if (n === 'faraday') return Seg.newtonFaraday.atlasFaraday(press, lt, st.newtonFaraday);
        const s = Seg[n];
        if (s?.atlas) s.atlas(press, n === 'schrodinger' ? 5 + lt : T, st[n], ctx);
    }
    // the guide line through the lens centres: a smooth snake, entering from the left
    function path() {
        const c = SLOTS.map((s) => s.c);
        return Ph.sample([[-60, 238], c[0], c[1], c[2], [1570, 450], c[3], c[4], c[5], [-60, 662]], false, 14);
    }
    // a lens: brass rim with a dark bevel, a thin glass glint
    function rim(press, c, r) {
        const ring = (rr, w, spec) => Ph.line(press, Array.from({ length: 97 }, (_, i) => [c[0] + Math.cos(i / 96 * 6.2832) * rr, c[1] + Math.sin(i / 96 * 6.2832) * rr]), w, spec);
        ring(r + 9, 18, BRASS);
        ring(r + 3, 5, BRASS_SH);
        ring(r + 17, 3, BRASS_SH);
        const gl = [];
        for (let a = -2.5; a <= -1.6; a += 0.05) gl.push([c[0] + Math.cos(a) * (r - 14), c[1] + Math.sin(a) * (r - 14)]);
        press.knockout((g) => { Ph.poly(g, Ph.outline(gl, Ph.taper(5, 0.3, 0.3))); g.fill(); });
    }

    Seg.atlas = {
        draw(press, lt, st, ctx) {
            // the night behind the atlas, with stars
            Sets.stars(press, 0, 1600, Math.min(1, 0.3 + lt), 37 + lt);
            // the line, drawn on from Schrödinger's end towards Galileo's… in reading order
            const p = path(), u = Ease.inOut(Ease.seg(lt, 0.5, 1.8));
            if (u > 0) Ph.line(press, p.slice(0, Math.max(2, Math.round(p.length * u))), Ph.taper(9, 0.01, 0.05), AMBER);
            // the lenses
            for (const s of SLOTS) {
                const o = Ease.out(Ease.seg(lt, OPEN[s.n], OPEN[s.n] + 0.45));
                let c = s.c, r = R * o, z = (R / 400) * o;
                if (s.n === 'schrodinger') {
                    // Schrödinger's frame shrinks from full screen into its lens
                    const k = Ease.inOut(Ease.seg(lt, 0, 1));
                    c = [Ease.lerp(800, s.c[0], k), Ease.lerp(450, s.c[1], k)];
                    r = Ease.lerp(1000, R, k);
                    z = Ease.lerp(1, R / 400, k);
                }
                if (r < 2) continue;
                press.save();
                press.clip((g) => g.arc(c[0], c[1], r, 0, Math.PI * 2));
                press.knockout((g) => { g.beginPath(); g.rect(0, 0, 1600, 900); g.fill(); });
                Ph.ink(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9 });
                Ph.ink(press, (g) => g.rect(0, 0, 1600, 900), { 'navy.s': (g) => Riso.radial(g, c[0], c[1], r * 0.1, r * 1.2, 0.55, 0.9) });
                Ph.cam(press, c[0], c[1], z, () => { press.each((g) => g.translate(-800, -450)); vignette(press, s.n, lt, ctx); });
                press.restore();
                if (r < 900) rim(press, c, r);
            }
        },
    };
})();
