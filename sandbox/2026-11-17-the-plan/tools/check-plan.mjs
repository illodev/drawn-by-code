// Is the plan true? Walks the whole film in steps of a frame and checks, from bank.js alone:
// no camera's sector ever holds a mark, the guard never has one in front of him in the open,
// and prints the margins of the two gaps the plan uses and the key times.
//   node sandbox/2026-11-17-the-plan/tools/check-plan.mjs
import fs from 'node:fs';
// bank.js is a browser script that defines one global; run it as such
const Bank = new Function(fs.readFileSync(new URL('../bank.js', import.meta.url), 'utf8') + '\nreturn Bank;')();
const { CAMS, camAngle, camSees, guardAt, markAt, NORTH, DOORS, L, TM } = Bank;
// the wall between the hall and the north rooms hides what is behind it, except through a door
const hidden = (ax, ay, bx, by) => {
    if ((ay - NORTH) * (by - NORTH) >= 0) return false;
    const x = ax + ((NORTH - ay) / (by - ay)) * (bx - ax);
    return !Object.values(DOORS).some(([a, b]) => x > a && x < b);
};
let bad = 0, closest = { cam: Infinity, guard: Infinity };
const seen = new Map(); // who sees which mark → [first, last, where]
const note = (who, i, t, m) => { bad++; const k = `${who} sees mark ${i + 1}`, e = seen.get(k); if (e) e[1] = t; else seen.set(k, [t, t, `${m.x.toFixed(1)}, ${m.y.toFixed(1)}`]); };
for (let f = 0; f <= 56 * 24; f++) {
    const t = f / 24, g = guardAt(t);
    for (let i = 0; i < 3; i++) {
        const m = markAt(i, t);
        if (t < L[i].a.t0 || (m.at !== 'ground' && m.at !== 'store')) continue; // not in yet; in the riser, below, on the roof, gone
        for (const c of CAMS) {
            if (camSees(c, t, m.x, m.y) && !hidden(c.x, c.y, m.x, m.y)) note(c.name, i, t, m);
            const dx = m.x - c.x, dy = m.y - c.y;
            if (Math.hypot(dx, dy) < c.reach && !hidden(c.x, c.y, m.x, m.y)) { let a = (Math.atan2(dx, -dy) * 180) / Math.PI - camAngle(c, t); a = Math.abs(((a + 540) % 360) - 180) - c.half; closest.cam = Math.min(closest.cam, a); }
        }
        // the guard: 12 m, 55° either side of where he faces
        const dx = m.x - g.x, dy = m.y - g.y, d = Math.hypot(dx, dy);
        let a = Math.atan2(dx, -dy) - g.h; a = Math.abs(((a * 180) / Math.PI + 540) % 360 - 180);
        if (d < 12 && !hidden(g.x, g.y, m.x, m.y)) { closest.guard = Math.min(closest.guard, a - 55); if (a < 55) note('the guard', i, t, m); }
    }
}
for (const [k, [a, b, w]] of seen) console.log(`${k} from ${a.toFixed(2)} to ${b.toFixed(2)} s (first at ${w})`);
console.log(bad ? `${bad} frames with a sighting: the plan is not true.` : 'No sightings: the plan is true.');
console.log(`closest a mark comes to a sector's edge: ${closest.cam.toFixed(1)}°; to the edge of the guard's view: ${closest.guard.toFixed(1)}°`);
const c2 = CAMS[1];
for (const t of [20, 24, 25, 26.2, 28, 30, 30.5]) console.log(`CAM 2 at ${t}: ${camAngle(c2, t).toFixed(1)}° (edges ${(camAngle(c2, t) - 13).toFixed(1)} … ${(camAngle(c2, t) + 13).toFixed(1)})`);
const f2 = (v) => v.toFixed(2);
L.forEach((l, i) => {
    const door = l.b.t0 + Bank.lengthOf(l.b.pts.slice(0, 4)) / l.b.v;
    console.log(`mark ${i + 1}: in ${f2(l.a.t0)}, at the corner ${f2(l.a.t0 + Bank.lengthOf(l.a.pts) / l.a.v)}, crosses ${f2(l.b.t0)}, through the store's door ${f2(door)}, to the riser ${f2(l.tDuct)}, in it ${f2(l.tAtDuct)}, out of the grille ${f2(l.tGrille)}, on the floor ${f2(l.tFloor)}, at the door ${f2(l.tStand)}, away ${f2(l.tAway)}, at the riser ${f2(l.tBack)}, on the roof ${f2(l.tRoof)}, off it ${f2(l.tOff)}`);
});
for (const t of [9.6, 14.5, 20, 31, 32.4, 36.4, 40.4, 41.2, 42.4]) { const g = guardAt(t); console.log(`guard at ${t}: ${g.x.toFixed(1)}, ${g.y.toFixed(1)}`); }
process.exit(bad ? 1 : 0);
