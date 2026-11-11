(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, S = Song, I = Inferno, b = S.b, B = S.B;
    const SEATS = Rides.bandCarSeats(), WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02];
    const cactus = (pose) => (g, s) => Chorus1Props.cactus(g, 0, 0, s, { wheel: WHEEL, shades: 1, ...pose });
    function shot(g, t, view, pan, heat, hype, lighters) {
        const o = { view, pan, heat, beatK: S.pulseAt(t).pulse };
        I.venue(g, t, o);
        const St = I.stage(view, pan);
        I.box(g, St.box.x, St.box.y, St.box.s, { t });
        Rig.band(g, t, St.car.x, St.car.y, St.car.s, { sing: true, tomDrives: false, driver: cactus({}) });
        const p = St.at([184, 804]);
        Devil.draw(g, p[0], p[1], St.car.s, { mood: 'angry' });
        const q = St.at([410, 812]);
        Devil.draw(g, q[0], q[1], St.car.s, { mood: 'grin' });
        I.crowd(g, t, { ...o, hype, lighters });
        // grid
        g.font = '14px sans-serif';
        for (let x = -100; x <= 400; x += 50) { const a = St.at([x, 500]); g.fillStyle = '#0f0'; g.fillRect(a[0], 0, 1, 1000); g.fillText(x, a[0] + 2, 120); }
        for (let y = 450; y <= 900; y += 50) { const a = St.at([0, y]); g.fillStyle = '#0ff'; g.fillRect(0, a[1], 1000, 1); g.fillText(y, 100, a[1] - 2); }
    }
    function draw(g, t, env) {
        const l = t - 144.375;
        if (l < 1) shot(g, t, { k: 2.2, cx: 120, cy: 675 }, 0, 0.8, 0.8, 0);
        else if (l < 2) shot(g, t, 'wide', -120, 0, 0, 0.5);
        else if (l < 3) shot(g, t, { k: 1.4, cx: 320, cy: 640 }, 0, 1, 1, 0.3);
        else shot(g, t, { k: 1.8, cx: 120, cy: 660 }, 0, 0.8, 0.8, 0);
    }
    Seg.hellplug = { shots: [], draw, post: () => ({}) };
})();
