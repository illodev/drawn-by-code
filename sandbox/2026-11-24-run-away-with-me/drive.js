// «Run Away With Me» 0:47–1:39 (bars 23–49): the pre-chorus on the causeway (the kiss in the
// streetlights), the style test's four shots (the crest, the drop), chorus 1 with the trip,
// the two «when the lights go out» as blackouts that leave the two of them in neon lines, and
// the bar of near silence at 1:37. The world, the drawing and the effects are film.js's; this
// file only cuts and frames. Scene t = song second − Song.B(23).
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
const BAR = 2.01672, B23 = 46.8013;
const bt = (n) => (n - 23) * BAR;                       // scene time of bar n's downbeat
// [start, end, name] on bar lines
const SHOTS = [
    [bt(23), bt(25), '1 · the causeway from above'],
    [bt(25), bt(27), '2 · low beside the wheels'],
    [bt(27), bt(29), '3 · lips in the streetlights'],
    [bt(29), bt(30), '4 · over the trunk'],
    [bt(30), bt(31), '5 · the bay'],
    [bt(31), bt(32), '6 · the crest (no bass)'],
    [bt(32), bt(33), '7 · the drop'],
    [bt(33), bt(35), '8 · the grid from above'],
    [bt(35), bt(37), '9 · low on the median side'],
    [bt(37), bt(39), '10 · the lights go out'],
    [bt(39), bt(41), '11 · lights back, the bay'],
    [bt(41), bt(43), '12 · the crane'],
    [bt(43), bt(45), '13 · over the trunk, the trip'],
    [bt(45), bt(47), '14 · the lights go out again'],
    [bt(47), bt(48), '15 · run away, from above'],
    [bt(48), bt(49), '16 · the bar of silence'],
];
const shotIndex = (t) => { const i = SHOTS.findIndex(([a, b]) => t >= a && t < b); return i < 0 ? SHOTS.length - 1 : i; };

Motion.scene({
    fps: 24,
    duration: bt(49),
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', 'styles/retro-neon/ink.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js', DIR + 'cast/couple.js', DIR + 'set/drawn.js', DIR + 'film.js'],
    bpm: 119, beatOffset: 0,
    shots: SHOTS,
    audio: { mix: 'private/drive.wav' },

    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        return { N };
    },

    draw(g, t, env) {
        const { N } = env.state;
        const tq = Math.floor(t * 12 + 1e-6) / 12, d = Ink.boil(t);   // drawings on twos
        const T = B23 + tq, shot = shotIndex(tq + 1 / 24);           // a cut lands on the nearest drawing
        const cam = camera(shot, T, env);
        const o = { camAt: (Tp) => camera(shot, Tp, env), couple: 'back', lean: shot === 2 ? kiss(T) : 0 };
        Film.frame(g, env, N, T, d, cam, o);
    },

    post(ctx, t, env) { env.state.N.grain(ctx, Math.floor(t * 12) / 12, { amount: 0.05, vignette: 0.3 }); },
});

// the kiss: they lean in on «lips» and stay, a breath apart before the cut
function kiss(T) { return Ease.inOut(Ease.seg(T, 55.3, 56.6)) * (1 - 0.25 * Ease.inOut(Ease.seg(T, 58.2, 58.9))); }

// the cameras, every one looking ahead along the causeway (the set is drawn forwards)
function camera(shot, T, env) {
    const ps = Film.pose(T), cz = ps.z, cy = ps.y, base = { W: env.W, H: env.H };
    const u = (a, b) => Ease.inOut(Ease.seg(T - B23, bt(a), bt(b)));
    const rel = (p) => Car.W(ps, p);                               // a point in the car's frame
    switch (shot) {
        case 0: { // high above the bay to the right, the car small on the causeway, the city ahead
            const k = u(23, 25);
            return Neon.camera({ ...base, pos: [38 - k * 8, cy + 34 - k * 6, cz - 30 + k * 10], yaw: -0.5 + k * 0.08, pitch: -0.32, roll: 0.01, f: 1000 });
        }
        case 1: { // low on the right lane behind the rear wheel, looking forward-left at the car
            const k = u(25, 27);
            return Neon.camera({ ...base, pos: rel([1.9, 0.55, -4.2 + k * 0.6]), yaw: -0.32 + k * 0.05, pitch: ps.pitch * 0.8 + 0.02, roll: -0.02, f: 900 });
        }
        case 2: { // close over the trunk on the two heads: the kiss, lamps flashing over them
            const k = u(27, 29);
            const p = rel([0.0, 1.62, -2.35 + k * 0.15]);
            return Neon.camera({ ...base, pos: p, yaw: 0.003 * Math.sin(T * 2.1), pitch: ps.pitch - 0.1, roll: 0.004 * Math.sin(T * 1.7), f: 1500 });
        }
        case 3: { // the style test's A: over the trunk
            const p = rel([0.05, 1.74, -2.95]);
            return Neon.camera({ ...base, pos: p, yaw: 0.004 * Math.sin(T * 2.1), pitch: ps.pitch - 0.075 + 0.004 * Math.sin(T * 2.9), roll: 0.006 * Math.sin(T * 1.7), f: 1000 });
        }
        case 4: { // the test's B: a fixed camera beside the causeway
            const zc = Causeway.carZ(61.4) - 3, k = Ease.inOut(Ease.seg(T, 61.5, 62.94));
            return Neon.camera({ ...base, pos: [14, Causeway.y(zc) + 5.6, zc], yaw: -0.34 + k * 0.12, pitch: -0.06, roll: 0, f: 1000 });
        }
        case 5: { // the test's C: the crane
            const k = u(31, 32);
            return Neon.camera({ ...base, pos: [Causeway.LANE + 0.2, cy + 1.6 + k * 7.5, cz - 6.5 - k * 9], yaw: 0, pitch: -0.02 - k * 0.2 + ps.pitch * 0.6, f: 1250 - k * 150 });
        }
        case 6: { // the test's D: close chase, a drifting tilt
            const k = u(32, 33);
            return Neon.camera({ ...base, pos: [Causeway.LANE - 0.25, cy + 1.35, cz - 4.8 - k * 0.6], yaw: 0.02, pitch: -0.02 + ps.pitch * 0.8, roll: Math.sin((T - 64.95) * 1.7) * 0.05, f: 1150 });
        }
        case 7: { // from high above and behind: the deck a grid, the hoops, the car pulling light
            const k = u(33, 35);
            return Neon.camera({ ...base, pos: [Causeway.LANE - 1 + k * 2, cy + 26 - k * 6, cz - 16 + k * 4], yaw: 0.03 - k * 0.06, pitch: -0.95 + k * 0.35, roll: 0.02, f: 1000 });
        }
        case 8: { // low on the median side, the other tilt
            const k = u(35, 37);
            return Neon.camera({ ...base, pos: rel([-1.6, 0.9, -5.2 + k * 1.2]), yaw: 0.16, pitch: ps.pitch * 0.8 + 0.01, roll: -0.045 + 0.03 * Math.sin(T * 1.3), f: 1000 });
        }
        case 9: { // behind and above, the car and the city: on «out» the lights go
            const k = u(37, 39);
            return Neon.camera({ ...base, pos: [Causeway.LANE + 0.4, cy + 5 + k * 2, cz - 12 - k * 4], yaw: -0.01, pitch: -0.16 + ps.pitch * 0.5, roll: 0, f: 1150 });
        }
        case 10: { // the lights back: beside the causeway again, nearer the water
            const zc = Causeway.carZ(80.4) - 2, k = Ease.inOut(Ease.seg(T, 79.6, 83.1));
            return Neon.camera({ ...base, pos: [16, Causeway.y(zc) + 3.8, zc], yaw: -0.4 + k * 0.16, pitch: -0.045, roll: 0.015, f: 950 });
        }
        case 11: { // the crane, rising higher, the city breathing
            const k = u(41, 43);
            return Neon.camera({ ...base, pos: [Causeway.LANE - 0.3, cy + 2 + k * 14, cz - 7 - k * 14], yaw: 0.02, pitch: -0.05 - k * 0.25 + ps.pitch * 0.5, roll: -0.01, f: 1150 - k * 100 });
        }
        case 12: { // over the trunk in the trip
            const p = rel([0.05, 1.74, -2.95]);
            return Neon.camera({ ...base, pos: p, yaw: 0.006 * Math.sin(T * 2.1), pitch: ps.pitch - 0.075, roll: 0.03 * Math.sin(T * 1.1), f: 1000 });
        }
        case 13: { // the chase: on «out» the second blackout
            const k = u(45, 47);
            return Neon.camera({ ...base, pos: [Causeway.LANE + 0.3, cy + 1.6, cz - 5.6 - k * 1.2], yaw: -0.02, pitch: -0.03 + ps.pitch * 0.8, roll: 0.04 * Math.sin(T * 1.5), f: 1100 });
        }
        case 14: { // run away: from above again, the camera dropping towards the car
            const k = u(47, 48);
            return Neon.camera({ ...base, pos: [Causeway.LANE, cy + 18 - k * 10, cz - 10 - k * 2], yaw: 0, pitch: -0.75 + k * 0.4, roll: 0, f: 1050 });
        }
        default: { // the bar of silence: a slow push towards the two of them, in neon lines on black
            const k = u(48, 49);
            const p = rel([0.0, 1.66, -3.2 + k * 0.9]);
            return Neon.camera({ ...base, pos: p, yaw: 0, pitch: ps.pitch - 0.09, roll: 0, f: 1300 + k * 200 });
        }
    }
}
