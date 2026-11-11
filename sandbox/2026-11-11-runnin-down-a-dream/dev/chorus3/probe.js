// probe: who stands where in the pit (not part of the film)
Motion.scene({
    fps: 24, duration: 4, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js',
        'sandbox/2026-11-11-runnin-down-a-dream/rides.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js', 'sandbox/2026-11-11-runnin-down-a-dream/inferno.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const hype = [0, 0.5, 0.8, 1][Math.floor(t)], tt = 140 + t;
        g.fillStyle = '#3a0a14'; g.fillRect(0, 0, 1000, 1000);
        g.save(); g.translate(500, 500); g.scale(1.6, 1.6); g.translate(-(t % 1 < 0.5 ? 300 : 700), -880);
        Inferno.crowd(g, tt, { view: 'wide', hype, density: 1 });
        const ROWS = [886, 922, 960, 1000];
        const sm = (u) => { const v = Math.max(0, Math.min(1, u)); return v * v * (3 - 2 * v); };
        for (let r = 0; r < 4; r++) for (let i = -7; i <= 22; i++) {
            const rn = Motion.rng('inferno-pit:' + r + ':' + i), x = 12 + i * 67 + (r % 2) * 33.5 + (rn() - 0.5) * 10;
            const skel = rn() < (r === 0 ? 0.1 : 0.24), turnR = rn();
            const f = { x, y: ROWS[r] + (rn() - 0.5) * 6, skel, rank: rn(), thr: 0.06 + 0.8 * rn(), ph: rn() < 0.7 ? 0 : 0.5, amp: 0.7 + 0.6 * rn(), size: 0.92 + 0.14 * rn(), turnR, turnS: rn() < 0.5 ? -1 : 1, side: rn() < 0.5 ? -1 : 1, wear: Math.floor(rn() * 6), tee: Math.floor(rn() * 4), hawk: rn() < 0.4 ? Math.floor(rn() * 4) : -1, light: rn(), foam: rn(), delay: Math.floor(rn() * 3) };
            const P = Song.pulseAt(tt), won = sm((hype - f.thr) / 0.16 + (hype >= 1 ? 1 : 0));
            const ph = P.k + Math.max(0, P.since - f.delay / 12 / 0.353) + f.ph, fr = ph - Math.floor(ph);
            const hop = won * f.amp * (0.07 + 0.12 * hype) * Math.sin(Math.PI * fr), sq = won * 0.07 * Math.exp(-fr * 5), u = (skel ? 70 : 56) * f.size;
            const top = f.y - hop * u - (skel ? 1.74 : 1.02) * u * (1 - sq);
            g.fillStyle = ['#00ff00', '#00ffff', '#ffffff', '#ffff00'][r];
            g.fillRect(f.x - 8, top - 1.5, 16, 3);
            g.font = '9px sans-serif';
            g.fillText(r + ':' + i + (skel ? 's' : '') + ' w' + f.wear + (f.hawk >= 0 ? 'h' : '') + (f.foam < 0.09 ? 'F' : ''), f.x - 14, top - 4);
        }
        g.restore();
    },
});
