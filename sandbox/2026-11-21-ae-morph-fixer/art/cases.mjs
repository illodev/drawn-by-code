// cases.mjs - the real-artwork regression set: letter outlines from the OFL fonts in fonts/
// (read by ttf.mjs), keyed the way a designer would key them in After Effects. Each piece of a
// letter is one Path property; a key whose letter has fewer pieces gets a dot for each piece
// it lacks (the way you'd collapse a path in AE), and `shuffle` deals a key's pieces out of
// order (paths pasted from another letter rarely land in the matching property).
//
// case: { name, font, keys (one character per key), size (px per em), shuffle, turn (degrees
//   per key, about the letter's corner), move ([dx, dy] per key), mode, max, expect }
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, charPaths } from './ttf.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const FONTS = {};
const font = (name) => (FONTS[name] ||= loadFont(path.join(ROOT, 'fonts', name + '.ttf')));

export const CASES = [
    { name: 'O into C and back (a hole closes into a dot)', font: 'ComicNeue-Bold', keys: 'OCO', expect: { grown: 1, crosses: 2, timed: 2 } },
    { name: 'B into 8 (three pieces each)', font: 'ComicNeue-Bold', keys: 'B8' },
    { name: 'B into 8, pieces pasted out of order', font: 'ComicNeue-Bold', keys: 'B8', shuffle: true, expect: { moved: true } },
    { name: 'a into e', font: 'ComicNeue-Bold', keys: 'ae' },
    { name: 'A into R', font: 'PatrickHand-Regular', keys: 'AR' },
    { name: 'g into s (the hole closes)', font: 'PatrickHand-Regular', keys: 'gs', expect: { grown: 1, timed: 1 } },
    { name: 'P into D into Q', font: 'PatrickHand-Regular', keys: 'PDQ' },
    { name: 'i into l (the dot shrinks away)', font: 'PatrickHand-Regular', keys: 'il', expect: { grown: 1 } },
    { name: '& into $ (pieces of different kinds)', font: 'PatrickHand-Regular', keys: '&$' },
    { name: 'M into W (one piece, many corners)', font: 'Bangers-Regular', keys: 'MW' },
    { name: 'Bold italic O into Q', font: 'Bangers-Regular', keys: 'OQ' },
    { name: 'A chain of ten letters', font: 'PatrickHand-Regular', keys: 'abcdeabcde', expect: { timed: 7 } },
    { name: 'Engraved R into K (hundreds of points)', font: 'IMFellDWPicaSC-Regular', keys: 'RK' },
    { name: 'Engraved @ into & (hundreds of points)', font: 'IMFellDWPicaSC-Regular', keys: '@&', expect: { timed: 2 } },
    { name: 'Engraved 8 into B, max 300', font: 'IMFellDWPicaSC-Regular', keys: '8B', max: 300 },
    { name: 'Engraved O into C, Exact', font: 'IMFellDWPicaSC-Regular', keys: 'OC', mode: 'exact', expect: { timed: 1 } },
    { name: 'An F turning a quarter at a time', font: 'ComicNeue-Bold', keys: 'FFFF', turn: [0, 90, 180, 270], rotate: true, expect: { turned: 270 } },
    { name: 'An R that turns and moves', font: 'PatrickHand-Regular', keys: 'RR', turn: [0, 120], move: [[0, 0], [200, 60]], rotate: true, expect: { turned: 120 } },
    { name: 'Tiny type: a into e at 24 px', font: 'ComicNeue-Bold', keys: 'ae', size: 24 },
    { name: 'Huge type: S into 5 at 2000 px', font: 'ComicNeue-Bold', keys: 'S5', size: 2000 },
];

let seed = 99;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function turnMove(P, deg, d) {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), r = ([x, y]) => [x * c - y * s, x * s + y * c];
    // about the letter's top-left area, so a turn also moves its centre
    const piv = [-60, -80];
    return {
        v: P.v.map(([x, y]) => {
            const q = r([x - piv[0], y - piv[1]]);
            return [q[0] + piv[0] + d[0], q[1] + piv[1] + d[1]];
        }),
        i: P.i.map(r), o: P.o.map(r), closed: true,
    };
}

function dot(at) {
    const r = 0.05, v = [[at[0] - r, at[1] - r], [at[0] + r, at[1] - r], [at[0] + r, at[1] + r], [at[0] - r, at[1] + r]];
    return { v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), closed: true };
}

// -> keys[k][p]: the case keyed, one array of pieces (paths) per key
export function build(c) {
    seed = 99;
    const per = [...c.keys].map((ch, k) => {
        let P = charPaths(font(c.font), ch, c.size || 400);
        if (c.turn || c.move) P = P.map((Q) => turnMove(Q, c.turn ? c.turn[k] : 0, c.move ? c.move[k] : [0, 0]));
        return P;
    });
    const n = Math.max(...per.map((P) => P.length));
    return per.map((P) => {
        const row = P.slice();
        while (row.length < n) row.push(dot([(rnd() - 0.5) * 20, (rnd() - 0.5) * 20]));
        if (c.shuffle) {
            for (let j = row.length - 1; j > 0; j--) {
                const t = Math.floor(rnd() * (j + 1));
                [row[j], row[t]] = [row[t], row[j]];
            }
        }
        return row;
    });
}
