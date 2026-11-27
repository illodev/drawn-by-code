// dev: solo2's props at size. One sheet per second (render with --at 0,1,… --size 1080):
//   0  the hangers under the ride at Finale.CAR, in the climb (as the next blocks will call them)
//   1  the same, flat, twice the size, next to the stock fans they are made from
//   2  the hangers with lean, trail and fewer links
Motion.scene({
    fps: 24, duration: 8, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js', 'sandbox/2026-11-11-runnin-down-a-dream/fx.js',
        'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/skyward.js', 'sandbox/2026-11-11-runnin-down-a-dream/finale.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/solo2-props.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const sheet = Math.floor(t + 1e-6), v = t - sheet, ft = Song.B(144) + v * 1.4, c = Finale.CAR, P = Solo2Props;
        if (sheet === 0) {
            const Y = Finale.Y(ft), o = { town: { lights: 1, wake: 1 }, speedLines: 0.4 };
            Skyward.ascent(g, ft, Y, o);
            Finale.ride(g, ft, c.x, c.y, c.s, { spin: ft * 12 });
            P.hangers(g, ft, c.x, c.y, c.s, {});
            Skyward.ascentFront(g, ft, Y, o);
        } else if (sheet === 1) {
            g.fillStyle = '#231e62';
            g.fillRect(0, 0, 1000, 1000);
            Finale.ride(g, ft, 1013, 218, 168, { spin: 0, devil: false });
            P.hangers(g, ft, 1013, 218, 168, {});
            Inferno.fan(g, 560, 420, 168, { kind: 'imp', hype: 0, wear: 'specs', hold: 'none', t: ft });
            Inferno.fan(g, 760, 420, 168, { kind: 'skeleton', hype: 0, hawk: Cereal.COL.pink, tee: 2, hold: 'none', t: ft });
            Inferno.fan(g, 560, 800, 168, { kind: 'imp', hype: 1, wear: 'bow', hold: 'none', t: ft });
            Inferno.fan(g, 800, 800, 168, { kind: 'skeleton', hype: 1, hawk: Cereal.COL.pink, tee: 2, hold: 'none', t: ft });
        } else if (sheet === 2) {
            g.fillStyle = '#231e62';
            g.fillRect(0, 0, 1000, 1000);
            [[250, 300, { lean: 0.2 }], [750, 300, { trail: -0.5 }], [250, 760, { n: 2, swing: 0 }], [750, 760, { trail: 0.4, bounce: 1 }]].forEach(([x, y, o]) => {
                g.save();
                g.translate(x + 150, y - 100);
                Finale.ride(g, ft, 0, 0, 40, { spin: 0, ...o });
                P.hangers(g, ft, 0, 0, 40, o);
                g.restore();
            });
        }
    },
    post(ctx, t, env) { if (Math.floor(t + 1e-6) === 0) Cereal.post(ctx, t, env); },
});
