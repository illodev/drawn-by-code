// The film's shared frame: what the music does to the picture (by song second) and how one
// frame of the causeway world is painted in the drawn manner, for any camera. Scenes only
// cut: they give the song time, the drawing index and a camera (and a camera at any earlier
// time, for the trip's tracers).
// Global: Film.
const Film = (() => {
    const P = () => Ink.PAL;
    const CUE = { gap1: 62.94, drop1: 64.95, out1: 77.0, back1: 79.07, out2: 93.0, back2: 95.2, black: 97.22, verse2: 99.24 };
    // a window that opens in `up` s and closes in `down` s
    const win = (T, a, b, up = 0.06, down = 0.12) => Math.min(Ease.seg(T, a, a + up), 1 - Ease.seg(T, b - down, b));

    // what the music does to the picture at song second T
    function effects(T) {
        const kick = Song.env('kick', T), bass = Song.env('bass', T), mid = Song.env('mid', T);
        const hold = Ease.inOut(Ease.seg(T, CUE.gap1, CUE.gap1 + 0.6)) * (1 - Ease.seg(T, CUE.drop1 - 0.02, CUE.drop1));
        const inhale = T < CUE.drop1 ? Ease.in(Ease.seg(T, CUE.drop1 - 0.9, CUE.drop1)) : 0;
        const tripOn = T >= CUE.drop1 && T < CUE.verse2;
        const trip = tripOn ? Math.min(1, 0.75 + (T - CUE.drop1) * 0.5) : 0;
        // «when the lights go out»: black on «out» until the next bar line; the bar of silence
        const black = Math.max(win(T, CUE.out1, CUE.back1), win(T, CUE.out2, CUE.back2), win(T, CUE.black, CUE.verse2, 0.04, 0.2));
        // a flash on the drop and when the lights come back
        const flash = [CUE.drop1, CUE.back1, CUE.back2].reduce((m, c) => Math.max(m, T >= c ? 0.55 * Math.exp(-(T - c) * 9) : 0), 0);
        const hue = trip ? 38 * Math.sin((T - CUE.drop1) * 2.2) + kick * 10 : 0;
        return {
            kick, bass, mid, hold, trip, flash, hue, inhale, black,
            grid: trip ? Ease.out(Ease.seg(T, CUE.drop1, CUE.drop1 + 0.5)) : 0,
            halo: 1 + mid * 0.3 + inhale * 0.6 + trip * (0.5 + kick * 0.8),
            star: trip ? 0.45 + kick * 0.5 : mid * 0.2 + inhale * 0.6,
            lampPower: 1 - hold * 0.55 + inhale * 0.55 + trip * 0.25,
            lampCol: trip ? Neon.mix(Neon.PAL.sodium, [Neon.PAL.pink, Neon.PAL.violet, Neon.PAL.cyan, Neon.PAL.magenta][Math.floor(Song.beatAt(T)) & 3], 0.75) : null,
            breathe: trip ? 0.006 + kick * 0.03 : 0,
        };
    }

    // the car's pose at song second T
    function pose(T) { const z = Causeway.carZ(T), y = Causeway.y(z); return { x: Causeway.LANE, y, z, pitch: Math.atan(Causeway.slope(z)) }; }

    // one frame. o: { couple: 'back' | 'front', lean (0..1, the two leaning in to kiss), camAt(Tp) }
    function frame(g, env, N, T, d, cam, o = {}) {
        const fx = effects(T), ps = pose(T);
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
        if (fx.trip > 0 && o.camAt) N.trails(L, (c, Tp) => Causeway.lights(c, N, o.camAt(Tp), Tp, fx), T, { n: 6, dt: 1.5 / 24, decay: 0.72, amount: 0.9 * fx.trip });
        const cw = Drawn.causeway(g, L, cam, T, d, { ...fx, onDeck: fx.grid > 0 ? (zA, zB, clip) => inkGrid(g, L, cam, T, d, fx, 'deck', zA, zB, clip) : null });
        const light = { lamp: Causeway.lampLight(ps.z + 1.0) * fx.lampPower, hue: fx.hue, power: 1, city: 1, drawn: true, d };
        let carPic = null, carL = null;
        const carItem = { z: ps.z, depth: cam.view([ps.x, ps.y + 0.6, ps.z])[2], draw: () => {
            // the car on its own layer with its own light: it erases the light behind it, then adds its own
            Ink.occlude(null);
            carL = Motion.layer(env, 'carLight', () => {});
            const cl = carL.getContext('2d'); cl.setTransform(env.k, 0, 0, env.k, 0, 0); cl.globalCompositeOperation = 'lighter';
            carPic = Motion.layer(env, 'carPic', (c) => Car.draw(c, cl, N, cam, ps, light, (gg) => couple(gg, cam, ps, light, T, d, o)));
            L.save(); L.setTransform(1, 0, 0, 1, 0, 0);
            L.globalCompositeOperation = 'destination-out'; L.drawImage(carPic, 0, 0);
            L.globalCompositeOperation = 'lighter'; L.drawImage(carL, 0, 0);
            L.restore();
            g.drawImage(carPic, 0, 0, env.W, env.H);
            Ink.occlude(L);
        } };
        // the car is 4.3 m long: it belongs to the far piece only when all of it is past the crest
        (ps.z - 2.3 >= cw.zSplit ? cw.farItems : cw.nearItems).push(carItem);
        const paint = (list) => { for (const it of list) if (it.depth === undefined) it.depth = cam.view([0, Causeway.y(it.z), it.z])[2]; list.sort((a, b) => b.depth - a.depth); for (const it of list) it.draw(); };
        cw.far(); paint(cw.farItems);
        cw.near(); paint(cw.nearItems);
        if (cw.last) cw.last();
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.35 + fx.trip * 0.15, core: 0.5 });
        if (fx.black > 0) blackout(g, env, N, fx, carPic, carL, T, d);
        if (fx.flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,120,220,${fx.flash})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
        return fx;
    }

    // the two of them in the car, from behind or from the front; leaning in to kiss (o.lean)
    function couple(g, cam, ps, light, T, d, o) {
        const view = o.couple ?? 'back', lean = o.lean ?? 0;
        const sway = Math.sin(T * 7.3) * 0.006;
        const pos = { him: -0.42, her: 0.42 };
        const sx = (who) => cam.p(Car.W(ps, [pos[who], 1.2, -0.52]))[0];
        for (const who of view === 'front' ? ['her', 'him'] : ['him', 'her']) {
            const other = who === 'her' ? 'him' : 'her', toward = Math.sign(sx(other) - sx(who));
            Couple.drawn(g, cam, ps, who, pos[who] - Math.sign(pos[who]) * 0.21 * lean, -0.52, light, { view, sway: who === 'her' ? sway : -sway, T, d, cut: who === 'her' ? 0.46 : 0.48, lean: toward * 0.32 * lean });
        }
    }

    // the lights go out: everything sinks into the night, and what remains is the two of them
    // and the car as lines of neon, with the car's own lights
    function blackout(g, env, N, fx, carPic, carL, T, d) {
        const b = fx.black, P0 = P();
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha = 0.93 * b; g.fillStyle = '#04021a'; g.fillRect(0, 0, env.px[0], env.px[1]);
        g.restore();
        if (!carPic) return;
        // the outline: the car's silhouette grown a few pixels in every direction, minus itself
        const k = env.k, w = Math.max(2, 3 * k), ring = Motion.layer(env, 'ring', () => {}), R = ring.getContext('2d');
        R.setTransform(1, 0, 0, 1, 0, 0);
        for (const [dx, dy] of [[w, 0], [-w, 0], [0, w], [0, -w], [w * 0.7, w * 0.7], [-w * 0.7, w * 0.7], [w * 0.7, -w * 0.7], [-w * 0.7, -w * 0.7]]) R.drawImage(carPic, dx, dy);
        R.globalCompositeOperation = 'source-in';
        const cols = [P0.cyan, P0.magenta, P0.pink];
        R.fillStyle = cols[Math.floor(Song.beatAt(T)) % 3 < 0 ? 0 : Math.floor(Song.beatAt(T)) % 3]; R.fillRect(0, 0, ring.width, ring.height);
        R.globalCompositeOperation = 'destination-out'; R.drawImage(carPic, 0, 0);
        R.globalCompositeOperation = 'source-over';
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha = b; g.drawImage(ring, 0, 0);
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = 0.6 * b; g.filter = `blur(${Math.round(4 * k)}px)`; g.drawImage(ring, 0, 0); g.filter = 'none';
        g.globalAlpha = b; g.drawImage(carL, 0, 0);
        g.restore();
    }

    // the trip's grid in ink: brush lines on the deck (clipped to the asphalt by the caller, the
    // median left bare, nothing past the crest) and on the bay
    function inkGrid(g, L, cam, T, d, fx, part, zA = 0, zB = Infinity, clip = null) {
        const a = fx.grid * (0.5 + 0.5 * fx.kick), zc = cam.pos[2], PP = P();
        const cyan = fx.hue ? Neon.css(Neon.shift(PP.cyan, fx.hue)) : PP.cyan, mag = fx.hue ? Neon.css(Neon.shift(PP.magenta, -fx.hue)) : PP.magenta;
        const line = (pts, col, al, seed) => {
            const Q = pts.map(cam.p);
            L.save(); if (clip) clip(L);
            for (let i = 0; i + 1 < Q.length; i++) {
                const p = Q[i], q = Q[i + 1]; if (p[2] < 0.6 || q[2] < 0.6) continue;
                const w = Math.min(8, Math.max(1.2, 0.1 * cam.f / p[2]));
                Ink.brush(g, [[p[0], p[1]], [q[0], q[1]]], { w, col, seed: seed * 31 + i, d, alpha: al, taper: 0.02, wob: 0.6, light: true });
                L.globalAlpha = al * 0.45; L.strokeStyle = col; L.lineWidth = w * 1.8; L.lineCap = 'round'; L.beginPath(); L.moveTo(p[0], p[1]); L.lineTo(q[0], q[1]); L.stroke();
            }
            L.restore();
        };
        if (part === 'deck') {
            const z0 = Math.max(zc + 1.5, zA), zEnd = Math.min(zc + 300, zB);
            for (let x = -11; x <= 7; x += 2.25) { if (x > -4.6 && x < -0.2) continue; const pts = []; for (let z = z0; z < zEnd; z += 6) pts.push([x, Causeway.y(z) + 0.03, z]); pts.push([x, Causeway.y(zEnd) + 0.03, zEnd]); line(pts, cyan, a, 800 + Math.round(x * 4)); }
            for (let z = Math.ceil(z0 / 6) * 6; z < Math.min(zc + 240, zB); z += 6) {
                const yy = Causeway.y(z) + 0.03, f = a * Math.max(0, 1 - (z - zc) / 260);
                line([[-11.8, yy, z], [-8, yy, z], [-4.4, yy, z]], mag, f, 900 + z); line([[-0.4, yy, z], [3.5, yy, z], [7.4, yy, z]], mag, f, 950 + z);
            }
            return;
        }
        for (let x = -600; x <= 600; x += 40) { if (Math.abs(x) < 20) continue; const pts = []; for (let z = zc + 30; z <= zc + 1400; z += 120) pts.push([x, Causeway.WATER, z]); line(pts, cyan, a * 0.6, 1000 + x); }
        for (let z = Math.ceil((zc + 30) / 40) * 40; z < zc + 1400; z += 40) { const f = Math.max(0, 1 - (z - zc) / 1400); line([[-600, Causeway.WATER, z], [-20, Causeway.WATER, z]], mag, a * 0.6 * f, 1100 + z); line([[20, Causeway.WATER, z], [600, Causeway.WATER, z]], mag, a * 0.6 * f, 1200 + z); }
    }

    return { CUE, effects, pose, frame };
})();
