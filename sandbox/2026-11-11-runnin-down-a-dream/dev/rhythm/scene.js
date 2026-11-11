// dev: Benmont and Stan (band-rhythm.js) next to Tom, alone, small, and in their pose
// extremes. One sheet per second; from t = 20 the same sheets without the tape, for crops.
//   0  Tom + Benmont, s 230        1  Tom + Stan, s 205
//   2  Benmont alone, s 400        3  Stan and his kit, s 330      4  Stan close, s 400
//   5  the three at s 110 and s 90 6  Benmont's poses              7  Stan's poses
//   8–11  playing, on the beat (animated)
Motion.scene({
    fps: 24, duration: 32, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t0, env) {
        const C = Cereal, K = C.COL, B = BandRhythm;
        const t = t0 % 20, shot = Math.floor(t + 1e-6);
        const pink = shot % 2 === 1;
        C.sunburst(g, 500, 560, { n: 12, rot: 0.2, a: pink ? K.pink : K.purple, b: pink ? K.rose : K.violet });
        C.burst(g, 520, 560, { r0: 330, r1: 450, n: 14, seed: 'dv', fill: pink ? K.teal : K.yellow, ink: K.ink, lw: 5 });
        const lip = [[-40, 1040]];
        for (let i = 0; i <= 22; i++) lip.push([i * 50 - 50, 838 + (i % 2 ? 0 : 24)]);
        lip.push([1040, 1040]);
        C.poly(g, lip, { fill: K.navy, lw: 0 });
        C.poly(g, lip.slice(1, -1), { ink: K.ink, lw: 5, close: false });
        if (shot === 0) {
            Cast.tom(g, 210, 900, 230, { strum: 0.4 });
            B.benmont(g, 660, 890, 230, {});
        } else if (shot === 1) {
            Cast.tom(g, 150, 905, 205, { strum: 0.4 });
            B.stan(g, 590, 890, 205, { snare: 1, hat: 1 });
        } else if (shot === 2) {
            B.benmont(g, 560, 905, 400, { mouth: 'grin' });
        } else if (shot === 3) {
            B.stan(g, 450, 900, 330, { snare: 0.15, hat: 1 });
        } else if (shot === 4) {
            B.stan(g, 400, 960, 400, { snare: 1, hat: 0, mouth: 'grin' });
        } else if (shot === 5) {
            Cast.tom(g, 110, 560, 110, {});
            B.benmont(g, 330, 560, 110, {});
            B.stan(g, 690, 560, 110, { snare: 1, hat: 1 });
            Cast.tom(g, 150, 900, 90, {});
            B.benmont(g, 350, 900, 90, { handR: 0.1, handL: 0.55, press: 1 });
            B.stan(g, 680, 900, 90, { snare: 0, hat: 0, kick: 1 });
        } else if (shot === 6) {
            B.benmont(g, 290, 470, 170, { handR: 0, handL: 1, press: 1, eyes: 'shut', mouth: 'sing', lean: -0.06, sway: -0.05 });
            B.benmont(g, 760, 470, 170, { handR: 0.62, handL: 0.38, eyes: 'wide', mouth: 'o', headTilt: 0.05, sway: 0.05 });
            B.benmont(g, 290, 900, 170, { handR: 0.4, handL: 0.6, press: 1, shades: 1, mouth: 'grin', squash: 0.08 });
            B.benmont(g, 760, 900, 170, { handR: 0.05, handL: 0.3, shades: 0.5, squash: -0.06, headDy: -0.05, lean: 0.07 });
        } else if (shot === 7) {
            B.stan(g, 230, 480, 150, { kick: 1, snare: 1, hat: 1, eyes: 'shut', mouth: 'sing' });
            B.stan(g, 720, 480, 150, { crash: 1, snare: 0, eyes: 'wide', mouth: 'o', sway: 0.05 });
            B.stan(g, 230, 920, 150, { snare: 0.5, hat: 0.5, crash: 0.5, shades: 1, mouth: 'grin', squash: 0.07 });
            B.stan(g, 720, 920, 150, { snare: 0, hat: 0, kick: 0.5, shades: 0.5, headDy: -0.05, headTilt: -0.06, sway: -0.05, squash: -0.05 });
        } else {
            // playing at the song's tempo: kick on 1 and 3, snare on 2 and 4, the hat on eighths
            const bpm = 169.97, td = C.onTwos(t - 8), beat = (td * bpm) / 60, ph = beat % 1, b4 = Math.floor(beat) % 4, e8 = (beat * 2) % 1;
            const hit = (p, len) => Math.max(0, 1 - p / len);
            const kick = b4 % 2 === 0 ? hit(ph, 0.45) : 0, snare = b4 % 2 === 1 ? hit(ph, 0.6) : (b4 % 2 === 0 && ph > 0.5 ? 0 : 0);
            const crash = Math.floor(beat) % 8 === 0 ? hit(ph, 0.9) : 0;
            Cast.tom(g, 125, 880, 150, { strum: Math.sin(beat * Math.PI * 2) });
            B.benmont(g, 400, 870, 150, { press: hit(e8, 0.5), handR: 0.2 + 0.1 * (Math.floor(beat / 2) % 3), handL: 0.62 + 0.12 * (Math.floor(beat) % 3), squash: 0.03 * hit(ph, 0.5), sway: 0.03 * Math.sin(beat * Math.PI), headTilt: 0.03 * Math.sin(beat * Math.PI) });
            B.stan(g, 735, 880, 150, { kick, snare, hat: hit(e8, 0.5), crash, squash: 0.03 * kick, headDy: 0.02 * hit(ph, 0.5), sway: 0.03 * Math.sin(beat * Math.PI), mouth: crash > 0 ? 'grin' : 'smirk' });
        }
    },
    post(ctx, t, env) { if (t < 20) Cereal.post(ctx, t, env); },
});
