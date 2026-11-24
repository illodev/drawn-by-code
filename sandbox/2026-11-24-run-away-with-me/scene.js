// Style test · «Run Away With Me» 0:59–1:07 (bars 29–32 of the song): the white convertible
// on the causeway, a streetlamp over them on every beat, the crest in the bar where the bass
// leaves (everything holds its breath), and the drop at 1:05 where the pill's trip arrives:
// tracers, halos, colour turning, the city breathing on the kick, a tunnel of light.
// Scene t = song second − 58.902 (the downbeat of bar 29).
const DIR = 'sandbox/2026-11-24-run-away-with-me/';
// the bars of the song, from Song.B(29) (cuts on bar lines)
const SHOTS = [[0, 2.0167, 'A · climbing'], [2.0167, 4.0334, 'B · the bay'], [4.0334, 6.0501, 'C · the crest (no bass)'], [6.0501, 8.08, 'D · the drop']];
const shotIndex = (t) => { const i = SHOTS.findIndex(([a, b]) => t >= a && t < b); return i < 0 ? SHOTS.length - 1 : i; };
Motion.scene({
    fps: 24,
    duration: 8.08,
    logical: [1920, 1080],
    uses: ['styles/retro-neon/neon.js', 'styles/retro-neon/ink.js', DIR + 'song.js', DIR + 'set/causeway.js', DIR + 'set/skyline.js', DIR + 'props/car.js', DIR + 'cast/couple.js', DIR + 'set/drawn.js'],
    bpm: 119, beatOffset: 0,
    shots: SHOTS,
    audio: { mix: 'private/test.wav' },

    async setup(env) {
        const N = Neon.make(env);
        await Couple.load();
        return { N };
    },

    draw(g, t, env) {
        if (DRAWN) return drawDrawn(g, t, env);
        const { N } = env.state;
        const T = Song.B(29) + t;                       // song time
        const shot = shotIndex(t);
        const fx = effects(t, T);
        const L = N.light();

        // --- the car and the camera of each shot ---------------------------------------
        const cz = Causeway.carZ(T), cy = Causeway.y(cz), pitch = Math.atan(Causeway.slope(cz));
        const pose = { x: Causeway.LANE, y: cy, z: cz, pitch };
        const cam = shotCam(shot, t, T, env);

        // --- the far world: sky, city, the bay and its reflections, the port ---------------
        const { horizon } = Skyline.world(g, L, N, cam, T, fx, env);
        Causeway.water(g, L, N, cam, T, fx);
        if (fx.grid > 0) tripGrid(g, L, cam, T, fx, 'water');      // the trip's grid on the bay
        N.bloom(g, L, { strength: 0.9 + fx.trip * 0.25 + fx.hold * 0.25 });
        const L2 = N.light();                           // the near world gets its own light, so the deck and the car cover the far glow

        // --- the causeway and our car, far to near ------------------------------------------
        const items = Causeway.draw(g, L2, N, cam, T, { ...fx, onDeck: fx.grid > 0 ? () => tripGrid(g, L2, cam, T, fx, 'deck') : null });
        const carDepth = cam.view([pose.x, pose.y + 0.6, pose.z])[2];
        const lamp = Causeway.lampLight(cz + 1.0);
        const light = { lamp: lamp * fx.lampPower, hue: fx.hue, power: 1 + fx.trip * 0.4, city: 1 + fx.hold * 0.6 };
        items.push({ z: pose.z, depth: carDepth, draw: () => {
            // the car is painted on its own layer with its own light, then it erases the light
            // behind it (a lamp's streak, a tube) before its own lights are added
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
        // sort by real camera depth
        for (const it of items) if (it.depth === undefined) it.depth = cam.view([0, Causeway.y(it.z), it.z])[2];
        items.sort((a, b) => b.depth - a.depth);
        for (const it of items) it.draw();

        // --- the trip -----------------------------------------------------------------------
        if (fx.trip > 0) {
            N.trails(L2, (c, Tp) => emitters(c, N, shotCam(shotIndex(Tp - Song.B(29)), Tp - Song.B(29), Tp, env), Tp, fx), T, { n: 6, dt: 1.5 / 24, decay: 0.62, amount: 0.55 * fx.trip });
            const vp = cam.p([Causeway.LANE, Causeway.y(cz + 300) + 3, cz + 300]);
            const ring = fx.hue ? Neon.shift(Neon.PAL.pink, fx.hue) : Neon.hex(Neon.PAL.pink);
            N.form(L2, 'tunnel', vp[0], vp[1], 1150, (t - 6.05) * 2.6, ring, 0.22 * fx.trip * (0.6 + fx.kick), { n: 12, squash: 0.62, sides: 8, rot: (t - 6.05) * 0.4, w: 2.2 });
            N.form(L2, 'spiral', vp[0], vp[1] - 160, 520, (t - 6.05) * 0.9, fx.hue ? Neon.shift(Neon.PAL.cyan, fx.hue) : Neon.hex(Neon.PAL.cyan), 0.12 * fx.trip, { arms: 7, squash: 0.55, w: 1.6 });
            N.snow(L2, Math.round(t * 24), 260, '#fff2ff', 0.55 * fx.trip, [0, 0, env.W, horizon]);
        }
        N.bloom(g, L2, { strength: 0.9 + fx.trip * 0.25 + fx.hold * 0.2, split: fx.trip * (2 + 7 * fx.kick) });
        // the drop's flash
        if (fx.flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,210,240,${fx.flash})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
    },

    post(ctx, t, env) {
        if (DRAWN) { env.state.N.grain(ctx, Math.floor(t * 12) / 12, { amount: 0.05, vignette: 0.3 }); return; }
        const fx = effects(t, Song.B(29) + t);
        env.state.N.grain(ctx, t, { amount: 0.08, vignette: 0.5 });
    },
});

// round 2 · the user: «maybe I was looking for something more homemade, this drawn style,
// not a 3D render» (with a hand-drawn neon illustration as the reference): the same world,
// cameras and timing, painted with ink.js (flat inks, a boiling brush line, strokes of light)
// and drawn on twos
const DRAWN = true;
function drawDrawn(g, t, env) {
    const { N } = env.state;
    const tq = Math.floor(t * 12 + 1e-6) / 12, d = Ink.boil(t);      // drawings on twos
    const T = Song.B(29) + tq;
    const shot = shotIndex(tq + 1 / 24);                           // a cut lands on the nearest drawing
    const fx = effects(tq, T);
    const cz = Causeway.carZ(T), cy = Causeway.y(cz), pitch = Math.atan(Causeway.slope(cz));
    const pose = { x: Causeway.LANE, y: cy, z: cz, pitch };
    const cam = shotCam(shot, tq, T, env);
    const horizon = cam.p([0, Causeway.WATER, 9000])[1];
    // the far world, with its own light, bloomed before anything near is painted over it
    Ink.occlude(null);
    let L = N.light();
    Drawn.sky(g, cam, T, d, fx, env, horizon);
    Drawn.city(g, cam, T, d, fx, env);
    Drawn.bay(g, L, cam, T, d, fx, env, horizon);
    Drawn.underDeck(g, L, cam, T, d, fx);
    if (fx.grid > 0) inkGrid(g, L, cam, T, d, fx, 'water');
    N.bloom(g, L, { strength: 0.35 + fx.trip * 0.15 + fx.hold * 0.15, core: 0.5 });
    // the near world: every opaque thing painted from here on hides the light behind it
    L = N.light();
    Ink.occlude(L);
    if (fx.trip > 0) N.trails(L, (c, Tp) => Causeway.lights(c, N, shotCam(shotIndex(Tp - Song.B(29)), Tp - Song.B(29), Tp, env), Tp, fx), T, { n: 5, dt: 1.5 / 24, decay: 0.6, amount: 0.5 * fx.trip });
    const cw = Drawn.causeway(g, L, cam, T, d, { ...fx, onDeck: fx.grid > 0 ? (zA, zB) => inkGrid(g, L, cam, T, d, fx, 'deck', zA, zB) : null });
    const lamp = Causeway.lampLight(cz + 1.0);
    const light = { lamp: lamp * fx.lampPower, hue: fx.hue, power: 1, city: 1, drawn: true, d };
    const carItem = { z: pose.z, depth: cam.view([pose.x, pose.y + 0.6, pose.z])[2], draw: () => {
        // the car on its own layer with its own light: it erases the light behind it, then adds its own
        Ink.occlude(null);
        const carL = Motion.layer(env, 'carLight', () => {});
        const cl = carL.getContext('2d'); cl.setTransform(env.k, 0, 0, env.k, 0, 0); cl.globalCompositeOperation = 'lighter';
        const carPic = Motion.layer(env, 'carPic', (c) => Car.draw(c, cl, N, cam, pose, light, (gg) => {
            const sway = Math.sin(T * 7.3) * 0.006;
            Couple.backDrawn(gg, cam, pose, 'him', -0.42, -0.52, light, { sway: -sway, T, d });
            Couple.backDrawn(gg, cam, pose, 'her', 0.42, -0.52, light, { sway, T, d });
        }));
        L.save(); L.setTransform(1, 0, 0, 1, 0, 0);
        L.globalCompositeOperation = 'destination-out'; L.drawImage(carPic, 0, 0);
        L.globalCompositeOperation = 'lighter'; L.drawImage(carL, 0, 0);
        L.restore();
        g.drawImage(carPic, 0, 0, env.W, env.H);
        Ink.occlude(L);
    } };
    (pose.z >= cw.zSplit ? cw.farItems : cw.nearItems).push(carItem);
    const paint = (list) => { for (const it of list) if (it.depth === undefined) it.depth = cam.view([0, Causeway.y(it.z), it.z])[2]; list.sort((a, b) => b.depth - a.depth); for (const it of list) it.draw(); };
    cw.far(); paint(cw.farItems);
    cw.near(); paint(cw.nearItems);
    if (cw.last) cw.last();
    Ink.occlude(null);
    N.bloom(g, L, { strength: 0.35 + fx.trip * 0.15, core: 0.5 });
    if (fx.flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,120,220,${fx.flash})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
}

// the trip's grid in ink: brush lines on the deck (clipped to the asphalt by the caller, the
// median left bare, nothing past the crest) and on the bay
function inkGrid(g, L, cam, T, d, fx, part, zA = 0, zB = Infinity) {
    const a = fx.grid * (0.5 + 0.5 * fx.kick), zc = cam.pos[2], P = Ink.PAL;
    const cyan = fx.hue ? Neon.css(Neon.shift(P.cyan, fx.hue)) : P.cyan, mag = fx.hue ? Neon.css(Neon.shift(P.magenta, -fx.hue)) : P.magenta;
    const line = (pts, col, w, al, seed) => {
        const Q = pts.map(cam.p).filter((p) => p[2] > 0.6); if (Q.length < 2) return;
        Ink.brush(g, Q.map((p) => [p[0], p[1]]), { w, col, seed, d, alpha: al, taper: 0.05, wob: 1, light: true });
        L.save(); L.globalAlpha = al * 0.45; L.strokeStyle = col; L.lineWidth = w * 1.6; L.beginPath(); Q.forEach((p, i) => (i ? L.lineTo(p[0], p[1]) : L.moveTo(p[0], p[1]))); L.stroke(); L.restore();
    };
    if (part === 'deck') {
        const z0 = Math.max(zc + 1.5, zA), zEnd = Math.min(zc + 300, zB);
        for (let x = -11; x <= 7; x += 2.25) { if (x > -4.6 && x < -0.2) continue; const pts = []; for (let z = z0; z < zEnd; z += 12) pts.push([x, Causeway.y(z) + 0.03, z]); pts.push([x, Causeway.y(zEnd) + 0.03, zEnd]); line(pts, cyan, 2.2, a, 800 + Math.round(x * 4)); }
        for (let z = Math.ceil(z0 / 6) * 6; z < Math.min(zc + 240, zB); z += 6) {
            const yy = Causeway.y(z) + 0.03, w = Math.min(4, Math.max(1.2, 90 / (z - zc + 10))), f = a * Math.max(0, 1 - (z - zc) / 260);
            line([[-11.8, yy, z], [-4.4, yy, z]], mag, w, f, 900 + z); line([[-0.4, yy, z], [7.4, yy, z]], mag, w, f, 950 + z);
        }
        return;
    }
    for (let x = -600; x <= 600; x += 40) { if (Math.abs(x) < 20) continue; line([[x, Causeway.WATER, zc + 30], [x, Causeway.WATER, zc + 1400]], cyan, 1.6, a * 0.6, 1000 + x); }
    for (let z = Math.ceil((zc + 30) / 40) * 40; z < zc + 1400; z += 40) { const f = Math.max(0, 1 - (z - zc) / 1400); line([[-600, Causeway.WATER, z], [-20, Causeway.WATER, z]], mag, 1.6, a * 0.6 * f, 1100 + z); line([[20, Causeway.WATER, z], [600, Causeway.WATER, z]], mag, 1.6, a * 0.6 * f, 1200 + z); }
}

// what the music does to the picture at t: the hold (no bass), the drop, the trip
function effects(t, T) {
    const tDrop = 6.0501, tGap = 4.0334;
    const kick = Song.env('kick', T), bass = Song.env('bass', T), mid = Song.env('mid', T);
    const hold = Ease.inOut(Ease.seg(t, tGap, tGap + 0.6)) * (1 - Ease.seg(t, tDrop - 0.02, tDrop));
    // the in-breath: the last half bar before the drop, everything swells towards it
    const inhale = Ease.in(Ease.seg(t, tDrop - 0.9, tDrop)) * (t < tDrop ? 1 : 0);
    const trip = t >= tDrop ? Math.min(1, 0.75 + (t - tDrop) * 0.5) : 0;
    const flash = t >= tDrop ? 0.55 * Math.exp(-(t - tDrop) * 9) : 0;
    const hue = trip ? 38 * Math.sin((t - tDrop) * 2.2) + kick * 10 : 0;
    return {
        kick, bass, mid, hold, trip, flash, hue, inhale,
        grid: trip ? Ease.out(Ease.seg(t, tDrop, tDrop + 0.5)) : 0,
        halo: 1 + mid * 0.3 + inhale * 0.6 + trip * (0.5 + kick * 0.8),
        star: trip ? 0.45 + kick * 0.5 : mid * 0.2 + inhale * 0.6,
        lampPower: 1 - hold * 0.55 + inhale * 0.55 + trip * 0.25,
        lampCol: trip ? Neon.mix(Neon.PAL.sodium, [Neon.PAL.pink, Neon.PAL.violet, Neon.PAL.cyan, Neon.PAL.magenta][Math.floor(Song.beatAt(T)) & 3], 0.75) : null,
        breathe: trip ? 0.006 + kick * 0.03 : 0,
    };
}

// the trip turns the deck and the bay into a grid of light: lines along the road and across
// it, fixed to the world (they rush past with the car), on the deck's surface and on the water
function tripGrid(g, L, cam, T, fx, part) {
    const a = fx.grid * (0.45 + 0.55 * fx.kick);
    if (a <= 0.01) return;
    const zc = cam.pos[2];
    const cyan = fx.hue ? Neon.shift(Neon.PAL.cyan, fx.hue) : Neon.hex(Neon.PAL.cyan);
    const pink = fx.hue ? Neon.shift(Neon.PAL.magenta, -fx.hue) : Neon.hex(Neon.PAL.magenta);
    const line = (pts, col, w, al) => {
        const P = pts.map(cam.p); if (P.some((p) => p[2] < 0.6)) return;
        for (const c of [L, g]) { c.save(); c.strokeStyle = Neon.css(col, c === g ? al * 0.35 : al); c.lineWidth = w; c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); c.restore(); }
    };
    const fade = (z) => Math.max(0, 1 - (z - zc) / 380);
    if (part === 'deck') {
    // along the deck
    for (let x = -11; x <= 7; x += 2.25) {
        const pts = []; for (let z = zc + 1.5; z < zc + 380; z += 12) pts.push([x, Causeway.y(z) + 0.03, z]);
        line(pts, cyan, 1.6, a * 0.8);
    }
    // across the deck, every 6 m (the world's own metres, so they stream past)
    for (let z = Math.ceil((zc + 1.5) / 6) * 6; z < zc + 300; z += 6) {
        const yy = Causeway.y(z) + 0.03;
        line([[-11.8, yy, z], [7.4, yy, z]], pink, Math.max(1, 90 / (z - zc + 10)), a * fade(z));
    }
    return;
    }
    // the bay: a wide grid on the water to both sides
    for (let x = -600; x <= 600; x += 40) {
        if (x > -20 && x < 20) continue;
        line([[x, Causeway.WATER, zc + 30], [x, Causeway.WATER, zc + 1400]], cyan, 1.2, a * 0.55);
    }
    for (let z = Math.ceil((zc + 30) / 40) * 40; z < zc + 1400; z += 40) {
        const f = Math.max(0, 1 - (z - zc) / 1400);
        line([[-600, Causeway.WATER, z], [-20, Causeway.WATER, z]], pink, 1.2, a * 0.6 * f);
        line([[20, Causeway.WATER, z], [600, Causeway.WATER, z]], pink, 1.2, a * 0.6 * f);
    }
}

// the camera of each shot, from the car's pose (metres) or from fixed places in the bay
function shotCam(shot, t, T, env) {
    const cz = Causeway.carZ(T), cy = Causeway.y(cz);
    const base = { W: env.W, H: env.H };
    if (shot === 0) {
        // over the trunk, close behind the two of them: the road, the lamps sweeping over them
        // on every beat, the city between their heads (a hand-held breath)
        const pitch = Math.atan(Causeway.slope(cz));
        const pose = { x: Causeway.LANE, y: cy, z: cz, pitch };
        const p = Car.W(pose, [0.05, 1.74, -2.95]);
        return Neon.camera({ ...base, pos: p, yaw: 0.004 * Math.sin(T * 2.1), pitch: pitch - 0.075 + 0.004 * Math.sin(T * 2.9), roll: 0.006 * Math.sin(T * 1.7), f: 1000 });
    }
    if (shot === 1) {
        // a fixed camera beside the causeway, 3 m above its deck: the bay, the lamps and their
        // streaks in the water, the city; the car comes in from the left and draws away
        const zc = Causeway.carZ(61.4) - 3;
        const follow = Ease.inOut(Ease.seg(t, 2.6, 4.0334));
        return Neon.camera({ ...base, pos: [14, Causeway.y(zc) + 5.6, zc], yaw: -0.34 + follow * 0.12, pitch: -0.06, roll: 0.0, f: 1000 });
    }
    if (shot === 2) {
        // the crest: from behind and low the camera rises and lets the car draw away, the city opening up
        const u = Ease.inOut(Ease.seg(t, 4.0334, 6.0501));
        return Neon.camera({ ...base, pos: [Causeway.LANE + 0.2, cy + 1.6 + u * 7.5, cz - 6.5 - u * 9], yaw: 0, pitch: -0.02 - u * 0.2 + Math.atan(Causeway.slope(cz)) * 0.6, f: 1250 - u * 150 });
    }
    // the drop: close behind, lower, a dutch tilt that drifts with the trip
    const u = Ease.seg(t, 6.0501, 8.08);
    return Neon.camera({ ...base, pos: [Causeway.LANE - 0.25, cy + 1.35, cz - 4.8 - u * 0.6], yaw: 0.02, pitch: -0.02 + Math.atan(Causeway.slope(cz)) * 0.8, roll: Math.sin((t - 6.05) * 1.7) * 0.05, f: 1150 });
}

// only what emits, for the trip's tracers: the causeway's lamps and traffic, our car's lights
function emitters(L, N, cam, T, fx) {
    Causeway.lights(L, N, cam, T, fx);
    const z = Causeway.carZ(T), pose = { x: Causeway.LANE, y: Causeway.y(z), z, pitch: Math.atan(Causeway.slope(z)) };
    if (Car.lights) Car.lights(L, N, cam, pose, { lamp: 0, hue: fx.hue, power: 1 });
}



