// Dev scene for set/skyline.js: the far world in the four cameras of scene.js (t 0–8.08, the
// same times), then close-ups (t ≥ 8.5) to crop the pieces at full resolution.
// Not part of the film.
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
const SHOTS = [[0, 2.0167, 'A'], [2.0167, 4.0334, 'B'], [4.0334, 6.0501, 'C'], [6.0501, 8.5, 'D'], [8.5, 13, 'close-ups']];
const shotIndex = (t) => { const i = SHOTS.findIndex(([a, b]) => t >= a && t < b); return i < 0 ? 3 : Math.min(3, i); };
Motion.scene({
    fps: 24,
    duration: 13,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js'],
    bpm: 119, beatOffset: 0,
    shots: SHOTS,

    setup(env) { return { N: Neon.make(env) }; },

    draw(g, t, env) {
        const { N } = env.state;
        // close-ups: a view and the film time whose effects it shows
        const close = closeUp(t, env);
        const tf = close ? close.tf : t;
        const T = Song.B(29) + tf;
        const fx = effects(tf, T);
        const cam = close ? close.cam : shotCam(shotIndex(t), t, T, env);
        const L = N.light();
        const t0 = performance.now();
        Skyline.world(g, L, N, cam, T, fx, env);
        const ms = performance.now() - t0;
        if (!close || close.causeway) Causeway.water(g, L, N, cam, T, fx);
        N.bloom(g, L, { strength: 0.9 + fx.trip * 0.25 + fx.hold * 0.25 });
        if (!close || close.causeway) {
            const L2 = N.light();
            const items = Causeway.draw(g, L2, N, cam, T, fx);
            for (const it of items) if (it.depth === undefined) it.depth = cam.view([0, Causeway.y(it.z), it.z])[2];
            items.sort((a, b) => b.depth - a.depth);
            for (const it of items) it.draw();
            N.bloom(g, L2, { strength: 0.9 });
        }
        if (window.DBC_SKYMS !== false) { g.save(); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 0, 1100, 26); g.fillStyle = '#fff'; g.font = '15px monospace'; g.fillText(`world ${ms.toFixed(1)} ms · ` + Object.entries(window.__skyT || {}).map(([k, v]) => k + ' ' + v.toFixed(1)).join(' '), 8, 18); g.restore(); }
    },

    post(ctx, t, env) { env.state.N.grain(ctx, t, { amount: 0.08, vignette: 0.5 }); },
});

// close-up views (t ≥ 8.5): long lenses from the causeway onto the pieces
function closeUp(t, env) {
    if (t < 8.5) return null;
    const base = { W: env.W, H: env.H };
    const look = (from, at, f, tf, causeway = false) => {
        const dx = at[0] - from[0], dy = at[1] - from[1], dz = at[2] - from[2];
        const yaw = Math.atan2(dx, dz), pitch = Math.atan2(dy, Math.hypot(dx, dz));
        return { cam: Neon.camera({ ...base, pos: from, yaw, pitch, f }), tf, causeway };
    };
    if (t < 9.0) return look([2, 6, 60], [300, 90, 2600], 4200, 3.0);            // downtown core
    if (t < 9.5) return look([2, 6, 60], [-700, 5, 1850], 5200, 3.0);            // waterfront left, the marina
    if (t < 10.0) return look([2, 6, 60], [500, 5, 1880], 5200, 3.0);            // waterfront right
    if (t < 10.5) return look([2, 6, 60], [520, 20, 1200], 3200, 3.0);           // the port: ship and cranes
    if (t < 11.0) return look([2, 6, 60], [300, 90, 2600], 4200, 7.2);           // the core in the trip
    if (t < 11.5) return look([2, 6, 60], [-200, -4, 600], 2600, 3.0);           // the bay: boats, streaks
    if (t < 12.0) return { cam: shotCam(1, 3.0, Song.B(29) + 3.0, env), tf: 7.3, causeway: true };   // B in the trip
    return { cam: shotCam(2, 5.2, Song.B(29) + 5.2, env), tf: 5.2, causeway: true };                  // C, held
}

// --- copied from scene.js ---------------------------------------------------------------
function effects(t, T) {
    const tDrop = 6.0501, tGap = 4.0334;
    const kick = Song.env('kick', T), bass = Song.env('bass', T), mid = Song.env('mid', T);
    const hold = Ease.inOut(Ease.seg(t, tGap, tGap + 0.6)) * (1 - Ease.seg(t, tDrop - 0.02, tDrop));
    const trip = t >= tDrop ? Math.min(1, 0.75 + (t - tDrop) * 0.5) : 0;
    const flash = t >= tDrop ? 0.55 * Math.exp(-(t - tDrop) * 9) : 0;
    const hue = trip ? 38 * Math.sin((t - tDrop) * 2.2) + kick * 10 : 0;
    return {
        kick, bass, mid, hold, trip, flash, hue,
        halo: 1 + mid * 0.3 + trip * (0.5 + kick * 0.8),
        star: trip ? 0.45 + kick * 0.5 : mid * 0.2,
        lampPower: 1 - hold * 0.35 + trip * 0.25,
        lampCol: trip ? Neon.mix(Neon.PAL.sodium, [Neon.PAL.pink, Neon.PAL.violet, Neon.PAL.cyan, Neon.PAL.magenta][Math.floor(Song.beatAt(T)) & 3], 0.75) : null,
        breathe: trip ? 0.006 + kick * 0.03 : 0,
    };
}
function shotCam(shot, t, T, env) {
    const cz = Causeway.carZ(T), cy = Causeway.y(cz);
    const base = { W: env.W, H: env.H };
    if (shot === 0) {
        const pitch = Math.atan(Causeway.slope(cz));
        const pose = { x: Causeway.LANE, y: cy, z: cz, pitch };
        const p = Car.W(pose, [0.05, 1.74, -2.95]);
        return Neon.camera({ ...base, pos: p, yaw: 0.004 * Math.sin(T * 2.1), pitch: pitch - 0.075 + 0.004 * Math.sin(T * 2.9), roll: 0.006 * Math.sin(T * 1.7), f: 1000 });
    }
    if (shot === 1) {
        const zc = Causeway.carZ(61.4) - 3;
        const follow = Ease.inOut(Ease.seg(t, 2.6, 4.0334));
        return Neon.camera({ ...base, pos: [14, Causeway.y(zc) + 3.2, zc], yaw: -0.34 + follow * 0.12, pitch: -0.035, roll: 0.0, f: 1000 });
    }
    if (shot === 2) {
        const u = Ease.inOut(Ease.seg(t, 4.0334, 6.0501));
        return Neon.camera({ ...base, pos: [Causeway.LANE + 0.2, cy + 1.6 + u * 7.5, cz - 6.5 - u * 9], yaw: 0, pitch: -0.02 - u * 0.2 + Math.atan(Causeway.slope(cz)) * 0.6, f: 1250 - u * 150 });
    }
    const u = Ease.seg(t, 6.0501, 8.08);
    return Neon.camera({ ...base, pos: [Causeway.LANE - 0.25, cy + 1.35, cz - 4.8 - u * 0.6], yaw: 0.02, pitch: -0.02 + Math.atan(Causeway.slope(cz)) * 0.8, roll: Math.sin((t - 6.05) * 1.7) * 0.05, f: 1150 });
}
