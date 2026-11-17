// Rock is drawn by hand, and a hand's drawing cannot be invented in code (two generators were
// tried: joints of slanted cells read as crazy paving, ridges with cross joints as roots).
// So the freehand strokes are read off the reference sheet by tools/trace.py and kept as
// data; here they only get their pens: a firm line where the stroke was strong, a thin one
// where it was faint.
(() => {
    // freehand(D, strokes, o): adds traced strokes [strength, x0, y0, …] to D's current group.
    // o.dx, o.dy move them; o.w scales the pen.
    Sheet.freehand = (D, strokes, o = {}) => {
        const dx = o.dx ?? 0, dy = o.dy ?? 0, w = o.w ?? 1;
        for (const s of strokes) {
            const k = Math.max(0, Math.min(1, (s[0] - 0.25) / 0.5)), pts = [];
            for (let i = 1; i < s.length; i += 2) pts.push(s[i] + dx, s[i + 1] + dy);
            D.pen((0.85 + 0.6 * k) * w, { cap: 'round', a: 0.6 + 0.4 * k }).poly(pts);
        }
        return D;
    };

    Sheet.parts.push('rocks');
    Sheet.rocks = (D) => {
        D.group('el.rocks', { overlap: 0.03 });
        Sheet.freehand(D, Sheet.TRACE.rocks, { dy: -2 }); // the reference's ground line is at 527, ours at 525
    };
})();
