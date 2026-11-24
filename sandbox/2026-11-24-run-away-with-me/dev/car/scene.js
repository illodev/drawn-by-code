// Dev scene for props/car.js: the car in the cameras of the four shots and in close-ups,
// one view per second of this scene (render with --at 0.5,1.5,…). Same pipeline as scene.js:
// the far world bloomed, then the deck and the car on its own layer with its own light.
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
const VIEWS = [
    ['A t1.0', 1.0, 0], ['A t0.5', 0.5, 0], ['B t2.8', 2.8, 1], ['B t3.4', 3.4, 1],
    ['C t4.3', 4.3, 2], ['C t5.7', 5.7, 2], ['D t6.3', 6.3, 3], ['D t7.6', 7.6, 3],
    ['rear 3/4 6 m', 1.0, 'rear'], ['side 8 m', 1.0, 'side'], ['front 3/4', 1.0, 'front'], ['A t1.25 lamp', 1.25, 0],
    ['rear 3/4 trip', 7.0, 'rear'], ['above', 1.0, 'above'], ['side L 8 m', 1.0, 'sideL'], ['side R 5 m', 1.0, 'sideR'], ['lights only, rear 3/4', 1.0, 'rear', 'lights'], ['lights only, front 3/4', 1.0, 'front', 'lights'], ['A t0.0', 0.0, 0], ['A t0.25', 0.25, 0],
];
Motion.scene({
    fps: 24,
    duration: 20,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js', DIR + 'cast/couple.js'],
    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        // a bench for the car alone (tools only): ms per Car.draw (+ people) in view v
        window.__carBench = (v, n = 20, withPeople = true) => {
            const [, t, kind] = VIEWS[v], T = Song.B(29) + t;
            const cz = Causeway.carZ(T), pose = { x: Causeway.LANE, y: Causeway.y(cz), z: cz, pitch: Math.atan(Causeway.slope(cz)) };
            const cam = typeof kind === 'number' ? shotCam(kind, t, T, env) : closeCam(kind, pose, env);
            const light = { lamp: 0.8, hue: 0, power: 1, city: 1 };
            const ppl = withPeople ? (gg, LL) => { Couple.back(gg, LL, N, cam, pose, 'him', -0.42, -0.52, light, { T }); Couple.back(gg, LL, N, cam, pose, 'her', 0.42, -0.52, light, { T }); } : null;
            const cl = Motion.layer(env, 'benchL', () => {}).getContext('2d'); cl.setTransform(env.k, 0, 0, env.k, 0, 0);
            let ms = 0;
            for (let i = 0; i < n + 3; i++) { cl.getImageData(0, 0, 1, 1); const t0 = performance.now(); const c = Motion.layer(env, 'benchPic', (c) => Car.draw(c, cl, N, cam, pose, light, ppl)); c.getContext('2d').getImageData(0, 0, 1, 1); cl.getImageData(0, 0, 1, 1); if (i >= 3) ms += performance.now() - t0; }
            const t1 = performance.now(); for (let i = 0; i < n; i++) { Car.lights(cl, N, cam, pose, light); cl.getImageData(0, 0, 1, 1); } const msL = (performance.now() - t1) / n;
            return { car: ms / n, lights: msL };
        };
        return { N };
    },
    draw(g, tt, env) {
        const { N } = env.state;
        const [, t, kind, only] = VIEWS[Math.min(VIEWS.length - 1, Math.floor(tt))];
        const T = Song.B(29) + t;
        const fx = effects(t, T);
        const L = N.light();
        const cz = Causeway.carZ(T), cy = Causeway.y(cz), pitch = Math.atan(Causeway.slope(cz));
        const pose = { x: Causeway.LANE, y: cy, z: cz, pitch };
        const cam = typeof kind === 'number' ? shotCam(kind, t, T, env) : closeCam(kind, pose, env);
        if (window.__carOnly) {
            // tools only: the car on a flat ground, to test it alone
            g.fillStyle = '#1a1030'; g.fillRect(0, 0, env.W, env.H);
            const lamp = Causeway.lampLight(cz + 1.0), light = { lamp: lamp * fx.lampPower, hue: fx.hue, power: 1 + fx.trip * 0.4, city: 1 + fx.hold * 0.6 };
            const cl = Motion.layer(env, 'carLight', () => {}).getContext('2d'); cl.setTransform(env.k, 0, 0, env.k, 0, 0); cl.globalCompositeOperation = 'lighter';
            const pic = Motion.layer(env, 'carPic', (c) => Car.draw(c, cl, N, cam, pose, light, window.__noPeople ? null : (gg, LL) => { Couple.back(gg, LL, N, cam, pose, 'him', -0.42, -0.52, light, { T }); Couple.back(gg, LL, N, cam, pose, 'her', 0.42, -0.52, light, { T }); }));
            g.drawImage(pic, 0, 0, env.W, env.H);
            return;
        }
        // the set is someone else's work in progress: if it throws, a plain sky stands in
        try { if (window.__noSky) throw 0; Skyline.world(g, L, N, cam, T, fx, env); } catch (e) { if (e !== 0) { g.restore(); L.restore(); } const h = cam.p([0, Causeway.WATER, cam.pos[2] + 5000])[1]; N.sky(g, 0, h); g.fillStyle = '#140a2a'; g.fillRect(0, h, env.W, env.H - h); }
        Causeway.water(g, L, N, cam, T, fx);
        N.bloom(g, L, { strength: 0.9 + fx.trip * 0.25 + fx.hold * 0.25 });
        const L2 = N.light();
        const items = Causeway.draw(g, L2, N, cam, T, fx);
        const carDepth = cam.view([pose.x, pose.y + 0.6, pose.z])[2];
        const lamp = Causeway.lampLight(cz + 1.0);
        const light = { lamp: lamp * fx.lampPower, hue: fx.hue, power: 1 + fx.trip * 0.4, city: 1 + fx.hold * 0.6 };
        if (only === 'lights') items.push({ z: pose.z, depth: carDepth, draw: () => Car.lights(L2, N, cam, pose, light) });
        else items.push({ z: pose.z, depth: carDepth, draw: () => {
            const carL = Motion.layer(env, 'carLight', () => {});
            const cl = carL.getContext('2d'); cl.setTransform(env.k, 0, 0, env.k, 0, 0); cl.globalCompositeOperation = 'lighter';
            const carPic = Motion.layer(env, 'carPic', (c) => Car.draw(c, cl, N, cam, pose, light, (gg, LL) => {
                const sway = Math.sin(T * 7.3) * 0.006;
                Couple.back(gg, LL, N, cam, pose, 'him', -0.42, -0.52, light, { sway: -sway, T });
                Couple.back(gg, LL, N, cam, pose, 'her', 0.42, -0.52, light, { sway, T });
            }));
            L2.save(); L2.setTransform(1, 0, 0, 1, 0, 0);
            L2.globalCompositeOperation = 'destination-out'; L2.drawImage(carPic, 0, 0);
            L2.globalCompositeOperation = 'lighter'; L2.drawImage(carL, 0, 0);
            L2.restore();
            g.drawImage(carPic, 0, 0, env.W, env.H);
        } });
        for (const it of items) if (it.depth === undefined) it.depth = cam.view([0, Causeway.y(it.z), it.z])[2];
        items.sort((a, b) => b.depth - a.depth);
        for (const it of items) { g.save(); L2.save(); try { it.draw(); } catch (e) { /* the set may not expect a camera this odd */ } L2.restore(); g.restore(); }
        N.bloom(g, L2, { strength: 0.9 + fx.trip * 0.25 + fx.hold * 0.2 });
    },
    post(ctx, t, env) { env.state.N.grain(ctx, t, { amount: 0.08, vignette: 0.5 }); },
});

function closeCam(kind, pose, env) {
    const at = { rear: [-3.1, 1.55, -5.1], side: [8, 1.3, 0.1], sideL: [-8, 1.3, 0.1], sideR: [5.2, 1.25, 0.1], front: [3.4, 1.35, 6.0], above: [1.2, 6.5, -3.5] }[kind];
    const tgt = Car.W(pose, [0, kind === 'above' ? 0.6 : 0.72, 0]), pos = Car.W(pose, at);
    const d = [tgt[0] - pos[0], tgt[1] - pos[1], tgt[2] - pos[2]];
    return Neon.camera({ W: env.W, H: env.H, pos, yaw: Math.atan2(d[0], d[2]), pitch: Math.atan2(d[1], Math.hypot(d[0], d[2])), f: 1000 });
}

// copied from scene.js
function effects(t, T) {
    const tDrop = 6.0501, tGap = 4.0334;
    const kick = Song.env('kick', T), bass = Song.env('bass', T), mid = Song.env('mid', T);
    const hold = Ease.inOut(Ease.seg(t, tGap, tGap + 0.6)) * (1 - Ease.seg(t, tDrop - 0.02, tDrop));
    const inhale = Ease.in(Ease.seg(t, tDrop - 0.9, tDrop)) * (t < tDrop ? 1 : 0);
    const trip = t >= tDrop ? Math.min(1, 0.75 + (t - tDrop) * 0.5) : 0;
    const flash = 0;
    const hue = trip ? 38 * Math.sin((t - tDrop) * 2.2) + kick * 10 : 0;
    return {
        kick, bass, mid, hold, trip, flash, hue, inhale, grid: 0,
        halo: 1 + mid * 0.3 + inhale * 0.6 + trip * (0.5 + kick * 0.8),
        star: trip ? 0.45 + kick * 0.5 : mid * 0.2 + inhale * 0.6,
        lampPower: 1 - hold * 0.55 + inhale * 0.55 + trip * 0.25,
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
