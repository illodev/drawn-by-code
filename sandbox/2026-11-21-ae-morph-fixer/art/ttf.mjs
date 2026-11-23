// ttf.mjs - just enough of a TrueType reader to turn a character into paths: the outlines of a
// glyph (contours of quadratic curves) as cubic paths in the fixer's format ({ v, i, o, closed },
// tangents relative to their vertex), y pointing down like After Effects, `size` px per em.
// Simple and composite glyphs; cmap formats 4 and 12. Used by the real-artwork regression set
// with the OFL fonts in the repo's fonts/ folder.
import fs from 'node:fs';

export function loadFont(file) {
    const b = fs.readFileSync(file), dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    const tables = {}, n = dv.getUint16(4);
    for (let t = 0; t < n; t++) {
        const r = 12 + 16 * t, tag = String.fromCharCode(b[r], b[r + 1], b[r + 2], b[r + 3]);
        tables[tag] = { off: dv.getUint32(r + 8), len: dv.getUint32(r + 12) };
    }
    for (const need of ['head', 'maxp', 'cmap', 'loca', 'glyf']) if (!tables[need]) throw new Error(`${file}: no ${need} table (not a TrueType-outline font)`);
    const unitsPerEm = dv.getUint16(tables.head.off + 18), longLoca = dv.getInt16(tables.head.off + 50) === 1;
    const numGlyphs = dv.getUint16(tables.maxp.off + 4);
    const loca = [];
    for (let g = 0; g <= numGlyphs; g++) loca.push(longLoca ? dv.getUint32(tables.loca.off + 4 * g) : dv.getUint16(tables.loca.off + 2 * g) * 2);
    const cmap = readCmap(dv, tables.cmap.off);
    return { unitsPerEm, glyphOf: (ch) => cmap(ch.codePointAt(0)), contours: (g) => contours(dv, tables.glyf.off, loca, g, 0) };
}

function readCmap(dv, base) {
    const n = dv.getUint16(base + 2);
    let best = null;
    for (let t = 0; t < n; t++) {
        const r = base + 4 + 8 * t, pid = dv.getUint16(r), eid = dv.getUint16(r + 2), off = base + dv.getUint32(r + 4), fmt = dv.getUint16(off);
        if (fmt === 12 && (pid === 3 || pid === 0)) best = { fmt, off };
        else if (fmt === 4 && (pid === 3 || pid === 0) && !best) best = { fmt, off };
    }
    if (!best) throw new Error('no Unicode cmap');
    const o = best.off;
    if (best.fmt === 12) {
        const groups = dv.getUint32(o + 12);
        return (c) => {
            for (let g = 0; g < groups; g++) {
                const r = o + 16 + 12 * g, s = dv.getUint32(r), e = dv.getUint32(r + 4);
                if (c >= s && c <= e) return dv.getUint32(r + 8) + (c - s);
            }
            return 0;
        };
    }
    const segX2 = dv.getUint16(o + 6), ends = o + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
    return (c) => {
        for (let s = 0; s < segX2 / 2; s++) {
            const end = dv.getUint16(ends + 2 * s), start = dv.getUint16(starts + 2 * s);
            if (c > end) continue;
            if (c < start) return 0;
            const delta = dv.getInt16(deltas + 2 * s), ro = dv.getUint16(ranges + 2 * s);
            if (!ro) return (c + delta) & 0xffff;
            const gi = dv.getUint16(ranges + 2 * s + ro + 2 * (c - start));
            return gi ? (gi + delta) & 0xffff : 0;
        }
        return 0;
    };
}

// contours of glyph g in font units: [[{ x, y, on }, ...], ...]
function contours(dv, glyf, loca, g, depth) {
    if (depth > 8 || loca[g] === loca[g + 1]) return [];
    const p = glyf + loca[g], nc = dv.getInt16(p);
    if (nc < 0) {
        // a composite: other glyphs, moved (and maybe scaled)
        const out = [];
        let q = p + 10, flags;
        do {
            flags = dv.getUint16(q);
            const idx = dv.getUint16(q + 2);
            q += 4;
            let dx, dy;
            if (flags & 1) {
                dx = dv.getInt16(q);
                dy = dv.getInt16(q + 2);
                q += 4;
            } else {
                dx = dv.getInt8(q);
                dy = dv.getInt8(q + 1);
                q += 2;
            }
            if (!(flags & 2)) dx = dy = 0;          // point-matched placement: not used by these fonts
            let a = 1, b = 0, c = 0, d = 1;
            if (flags & 8) {
                a = d = dv.getInt16(q) / 16384;
                q += 2;
            } else if (flags & 0x40) {
                a = dv.getInt16(q) / 16384;
                d = dv.getInt16(q + 2) / 16384;
                q += 4;
            } else if (flags & 0x80) {
                a = dv.getInt16(q) / 16384;
                b = dv.getInt16(q + 2) / 16384;
                c = dv.getInt16(q + 4) / 16384;
                d = dv.getInt16(q + 6) / 16384;
                q += 8;
            }
            for (const ct of contours(dv, glyf, loca, idx, depth + 1)) out.push(ct.map((pt) => ({ x: a * pt.x + c * pt.y + dx, y: b * pt.x + d * pt.y + dy, on: pt.on })));
        } while (flags & 0x20);
        return out;
    }
    const ends = [];
    for (let c = 0; c < nc; c++) ends.push(dv.getUint16(p + 10 + 2 * c));
    const total = nc ? ends[nc - 1] + 1 : 0;
    let q = p + 10 + 2 * nc;
    q += 2 + dv.getUint16(q);                     // instructions
    const fl = [];
    while (fl.length < total) {
        const f = dv.getUint8(q++);
        fl.push(f);
        if (f & 8) {
            let rep = dv.getUint8(q++);
            while (rep-- > 0) fl.push(f);
        }
    }
    const xs = [], ys = [];
    let v = 0;
    for (let k = 0; k < total; k++) {
        const f = fl[k];
        if (f & 2) v += (f & 16 ? 1 : -1) * dv.getUint8(q++);
        else if (!(f & 16)) {
            v += dv.getInt16(q);
            q += 2;
        }
        xs.push(v);
    }
    v = 0;
    for (let k = 0; k < total; k++) {
        const f = fl[k];
        if (f & 4) v += (f & 32 ? 1 : -1) * dv.getUint8(q++);
        else if (!(f & 32)) {
            v += dv.getInt16(q);
            q += 2;
        }
        ys.push(v);
    }
    const out = [];
    let s = 0;
    for (const e of ends) {
        const ct = [];
        for (let k = s; k <= e; k++) ct.push({ x: xs[k], y: ys[k], on: !!(fl[k] & 1) });
        out.push(ct);
        s = e + 1;
    }
    return out;
}

// one TrueType contour (quadratic, implied on-points between two off-points) -> a cubic path.
// Every on-point is a vertex; an on -> off -> on run is a quadratic, written as a cubic with
// both handles two thirds of the way to the control point.
function toPath(ct, scale) {
    const pts = [];
    for (let k = 0; k < ct.length; k++) {
        const a = ct[k], b = ct[(k + 1) % ct.length];
        pts.push(a);
        if (!a.on && !b.on) pts.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, on: true });
    }
    const first = pts.findIndex((p) => p.on);
    const seq = pts.slice(first).concat(pts.slice(0, first)), L = seq.length;
    const xy = (p) => [p.x * scale, -p.y * scale];
    const V = [], I = [], O = [];
    let carry = null;                     // the in-handle owed to the next vertex
    for (let k = 0; k < L; k++) {
        if (!seq[k].on) continue;
        const p0 = xy(seq[k]);
        V.push(p0);
        I.push(carry || [0, 0]);
        O.push([0, 0]);
        carry = null;
        const nx = seq[(k + 1) % L];
        if (!nx.on) {
            const c = xy(nx), p2 = xy(seq[(k + 2) % L]);
            O[O.length - 1] = [(c[0] - p0[0]) * 2 / 3, (c[1] - p0[1]) * 2 / 3];
            carry = [(c[0] - p2[0]) * 2 / 3, (c[1] - p2[1]) * 2 / 3];
        }
    }
    if (carry) I[0] = carry;
    // a last point repeating the first closes the contour twice: drop it, keeping its in-handle
    const n = V.length;
    if (n > 2 && Math.hypot(V[n - 1][0] - V[0][0], V[n - 1][1] - V[0][1]) < 1e-9) {
        I[0] = I[n - 1];
        V.pop();
        I.pop();
        O.pop();
    }
    return { v: V, i: I, o: O, closed: true };
}

// the paths of one character at `size` px per em, centred on its own box
export function charPaths(font, ch, size = 400) {
    const g = font.glyphOf(ch);
    if (!g) throw new Error(`no glyph for ${ch}`);
    const scale = size / font.unitsPerEm, paths = font.contours(g).filter((c) => c.length >= 2).map((c) => toPath(c, scale));
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const P of paths) for (const [x, y] of P.v) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
    }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return paths.map((P) => ({ v: P.v.map(([x, y]) => [x - cx, y - cy]), i: P.i, o: P.o, closed: true }));
}
