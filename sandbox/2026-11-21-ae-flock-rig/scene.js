// 2026-11-21-ae-flock-rig · preview of the flock that Flock.jsx bakes into After Effects.
//
// Runs flock-sim.js (the same file Flock.jsx carries) on a leader path, then draws every bird
// the way the After Effects rig shows it, through flock-math.js (the same functions its
// expressions run) with the Controls below, in layer order (a 2D comp does not re-sort).
// The bird has a turn drawing (a head-on view), as the demo precomp does.
// A diagnostic, not a styled piece: it checks how the flock moves before baking it in AE.
const DIR = 'sandbox/2026-11-21-ae-flock-rig/';
const FPS = 24, DUR = 8;
const CYCLE = 0.5;                       // flap cycle of the bird precomp (s)
// the Controls layer's defaults (flock-ae.jsx CONTROLS)
const CTL = {
    spread: 100, length: 100, width: 100, angle: 0, clump: 0, scatter: 0, scatterSpeed: 0.5, scatterSeed: 1,
    size: 100, sizeVar: 20, persp: 100, orient: 100, turnWidth: 30, headOn: 60, flapSpeed: 100, desync: 100,
};
const SHAPE_BUDGET = 0.35;               // flock-ae.jsx: the most the shape may add to a bird's speed (× cruise)

// Leader: a keyed null in AE; here a Catmull-Rom path through timed points.
const KEYS = [
    [0.0, -160, 640], [1.2, 420, 520], [2.4, 900, 300], [3.3, 1180, 420],
    [4.1, 1010, 640], [4.9, 760, 520], [5.8, 1040, 330], [6.8, 1500, 380], [8.0, 2100, 260],
];
function leaderAt(t) {
    let k = 0;
    while (k < KEYS.length - 2 && t > KEYS[k + 1][0]) k++;
    const p0 = KEYS[Math.max(0, k - 1)], p1 = KEYS[k], p2 = KEYS[k + 1], p3 = KEYS[Math.min(KEYS.length - 1, k + 2)];
    const u = Math.min(1, Math.max(0, (t - p1[0]) / (p2[0] - p1[0])));
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])];
}

const INK = '#1d2330';
// Side view, facing right, centred on the body; ~34 px wingspan at 100 %.
function birdSide(g, phase) {
    const a = Math.sin(phase * Math.PI * 2);          // +1 wings up, -1 wings down
    g.fillStyle = INK;
    g.beginPath();
    g.ellipse(0, 0, 11, 3.4, 0, 0, Math.PI * 2);       // body
    g.fill();
    g.beginPath();
    g.arc(10, -1.2, 2.8, 0, Math.PI * 2);             // head
    g.fill();
    g.beginPath();                                     // tail
    g.moveTo(-9, -1);
    g.lineTo(-17, -4);
    g.lineTo(-16, 3);
    g.closePath();
    g.fill();
    const tipY = -17 * a, tipX = -6 + 3 * Math.abs(a);
    g.beginPath();                                     // wing, from the shoulder
    g.moveTo(4, -1);
    g.quadraticCurveTo(0, tipY * 0.6, tipX, tipY);
    g.quadraticCurveTo(-3, tipY * 0.4, -5, 0);
    g.closePath();
    g.fill();
}
// Head-on view (the turn drawing): body end-on, both wings spread, same flap.
function birdHeadOn(g, phase) {
    const a = Math.sin(phase * Math.PI * 2);
    g.fillStyle = INK;
    g.beginPath();
    g.ellipse(0, 0, 3.6, 4.4, 0, 0, Math.PI * 2);
    g.fill();
    for (const s of [-1, 1]) {
        const tipX = s * (19 - 4 * Math.abs(a)), tipY = -13 * a;
        g.beginPath();
        g.moveTo(s * 2.5, -1.8);
        g.quadraticCurveTo(s * 10, tipY * 0.5 - 2, tipX, tipY);
        g.quadraticCurveTo(s * 9, tipY * 0.4 + 1.5, s * 2.5, 1.6);
        g.closePath();
        g.fill();
    }
}

Motion.scene({
    fps: FPS, duration: DUR,
    logical: [1920, 1080],
    uses: [DIR + 'flock-sim.js', DIR + 'flock-math.js'],
    shots: [[0, DUR, 'Flock preview']],
    setup(env) {
        const LEAD = 0.4, LX = [], LY = [];
        for (let f = 0; f < env.total + Math.ceil(LEAD * FPS) + 1; f++) {
            const p = leaderAt(f / FPS);
            LX.push(p[0]);
            LY.push(p[1]);
        }
        const sim = FlockSim.run({ leaderX: LX, leaderY: LY, frames: env.total, lead: LEAD, fps: FPS, count: 80, spacing: 40, follow: 50, turbulence: 40, glide: 50, seed: 7, cycle: CYCLE });
        return { sim, LX, LY };
    },
    draw(g, t, env) {
        const { sim, LX, LY } = env.state;
        const f = Math.min(sim.frames - 1, Math.round(t * FPS));
        const sky = g.createLinearGradient(0, 0, 0, env.H);
        sky.addColorStop(0, '#9fb7c9');
        sky.addColorStop(1, '#e9e2d6');
        g.fillStyle = sky;
        g.fillRect(0, 0, env.W, env.H);

        // leader path and leader (what the designer keys)
        g.strokeStyle = 'rgba(40, 60, 80, 0.18)';
        g.lineWidth = 2;
        g.setLineDash([6, 10]);
        g.beginPath();
        for (let k = 0; k < sim.frames; k++) (k ? g.lineTo : g.moveTo).call(g, LX[k], LY[k]);
        g.stroke();
        g.setLineDash([]);
        g.strokeStyle = 'rgba(200, 70, 40, 0.8)';
        g.lineWidth = 3;
        g.beginPath();
        g.arc(LX[f], LY[f], 9, 0, Math.PI * 2);
        g.stroke();

        // every bird through the expressions' math (scatter left out: it needs AE's wiggle)
        const C = CTL, cx = sim.center.x[f], cy = sim.center.y[f];
        // the running sums read like AE reads keys: linear between frames
        const T1 = (sim.frames - 1) / FPS, DT = 1 / FPS;
        const keyed = (X, Y) => (tt) => {
            const u = Math.min(sim.frames - 1, Math.max(0, tt * FPS)), k = Math.min(sim.frames - 2, Math.floor(u)), w = u - k;
            return [X[k] + (X[k + 1] - X[k]) * w, Y[k] + (Y[k + 1] - Y[k]) * w];
        };
        const W = Math.max(2 * DT, flockWindow(C.spread, C.length, C.width, C.clump, sim.center.radiusRef, SHAPE_BUDGET * sim.stats.cruise));
        const A = flockMean(keyed(sim.center.axisX, sim.center.axisY), f / FPS, W, 0, T1, DT);
        const R = flockMean(keyed(sim.center.radiusSum, sim.center.radiusSum), f / FPS, W, 0, T1, DT)[0];
        for (let n = sim.order.length - 1; n >= 0; n--) {   // bottom layer first, like AE
            const b = sim.birds[sim.order[n]];
            const d = flockMean(keyed(b.sumX, b.sumY), f / FPS, W, 0, T1, DT);
            const o = flockShape(d[0], d[1], b.x[f] - cx, b.y[f] - cy, A[0], A[1], R, C.spread, C.length, C.width, C.angle, C.clump);
            const fac = flockFacing(b.face[f], 1, C.turnWidth / 100, C.headOn / 100, true);
            const s = flockSize(b.ds[f], C.persp, C.size, C.sizeVar, b.size) / 100;
            const sc = flockScale(fac, s, b.up[f]);
            const ph = flockCycle(b.phase[f], b.offset, C.flapSpeed, C.desync);
            g.save();
            g.translate(cx + o[0], cy + o[1]);
            g.rotate((flockOrient(b.rot[f], C.orient) * Math.PI) / 180);
            g.scale(sc[0], sc[1]);
            (fac[1] ? birdHeadOn : birdSide)(g, ph);
            g.restore();
        }
    },
});
