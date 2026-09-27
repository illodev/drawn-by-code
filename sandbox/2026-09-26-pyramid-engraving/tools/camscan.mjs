// Scans the film's camera frame by frame (film time) for what reads as a zigzag or a tremble:
// the camera's velocity or the view's turn reversing direction within a short window, and
// jumps. Prints one line per suspect instant. Usage: node .../tools/camscan.mjs [from] [to]
import { execFileSync } from 'node:child_process';
const [from = 0, to = 63.6] = process.argv.slice(2).map(Number);
const expr = `
const out = [], fps = 24, n = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0), sub = (a, b) => a.map((v, i) => v - b[i]);
const S = [];
for (let f = Math.round(${from} * fps); f <= Math.round(${to} * fps); f++) {
  const t = f / fps, u = PyramidFilm.storyTime(t), w = PyramidFilm.where(u);
  S.push({ t, u, space: w.space, cam: w.cam, f: n(sub(w.target, w.cam)), up: w.up ?? [0, 1, 0] });
}
for (let i = 2; i < S.length; i++) {
  const a = S[i - 2], b = S[i - 1], c = S[i];
  if (a.space !== b.space || b.space !== c.space) continue;
  const v1 = sub(b.cam, a.cam), v2 = sub(c.cam, b.cam), l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
  const scale = Math.max(Math.hypot(...sub(c.cam, c.cam.map((x, k) => x + c.f[k]))), 1e-6);
  // velocity reversal: the step turns by more than 60° between consecutive frames while moving
  if (l1 > 1e-5 && l2 > 1e-5 && dot(v1, v2) / (l1 * l2) < 0.5) out.push(c.t.toFixed(3) + ' ' + c.space + ' move turns ' + (Math.acos(Math.max(-1, Math.min(1, dot(v1, v2) / (l1 * l2)))) * 57.3).toFixed(0) + '° (speed ' + (l1 * fps).toFixed(3) + '→' + (l2 * fps).toFixed(3) + ')');
  // view turn reversal: angular velocity of the view direction flips
  const w1 = sub(b.f, a.f), w2 = sub(c.f, b.f), m1 = Math.hypot(...w1), m2 = Math.hypot(...w2);
  if (m1 * fps * 57.3 > 3 && m2 * fps * 57.3 > 3 && dot(w1, w2) / (m1 * m2) < 0.3) out.push(c.t.toFixed(3) + ' ' + c.space + ' view turn flips (' + (m1 * fps * 57.3).toFixed(0) + '→' + (m2 * fps * 57.3).toFixed(0) + ' °/s)');
  // acceleration spike
  if (Math.abs(l2 - l1) * fps * fps > 3 * Math.max(0.3, (l1 + l2) * fps)) out.push(c.t.toFixed(3) + ' ' + c.space + ' speed jump ' + (l1 * fps).toFixed(3) + '→' + (l2 * fps).toFixed(3));
}
out.join('\\n')`;
console.log(execFileSync('node', ['sandbox/2026-09-26-pyramid-engraving/tools/geo.mjs', expr], { encoding: 'utf8' }));
