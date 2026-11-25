// uses: props/opening-figures.js, set/opening-street.js, set/opening-party.js, sections/opening.js
// Section · the opening, 0:00–0:24.6 (bars 0–12): the intro (the saxophone riff, no voice,
// thin bass) on Ocean Drive, the strip's neon striking on tube by tube from the first note;
// inside the party hotel the mirror ball turns; the bass and the voice come in at bar 8 and the
// room lights up; then she, in the middle of it, and on «I'm sick of the party» the room
// presses in on her. Ends inside the party (the next section, `escape`, takes the quiet bars
// there). Sets: set/opening-street.js, set/opening-party.js; people: props/opening-figures.js.
// Contract: sections/README.md.
(() => {
    const B = (n) => 0.415 + n * 2.01672;                    // bar n's downbeat (song seconds)
    const SHOTS = [
        [0, B(2), '1 · the tubes strike (Ocean Drive)'],
        [B(2), B(4), '2 · down the Drive'],
        [B(4), B(6), '3 · up the party hotel'],
        [B(6), B(8), '4 · the mirror ball'],
        [B(8), B(9), '5 · the bass: the room lights up'],
        [B(9), B(10), '6 · through the crowd'],
        [B(10), B(12), '7 · she: the room presses in'],
    ];
    const shotIndex = (T) => { const i = SHOTS.findIndex(([a, b]) => T >= a && T < b); return i < 0 ? SHOTS.length - 1 : i; };
    const u = (T, a, b) => Ease.inOut(Ease.seg(T, a, b));

    // a camera looking down the street (+x): built in a frame turned a quarter (its forward is
    // the street's x, the hotels on its left), so the sky and the far city, which are laid
    // round a camera's +z, stay whole; the set is projected through the turn
    function turned(C) {
        const R = (p) => [-p[2], p[1], p[0]];
        const cam = { ...C, p: (q) => C.p(R(q)), view: (q) => C.view(R(q)), pos: [C.pos[2], C.pos[1], -C.pos[0]], sky: C };
        return cam;
    }
    function streetCam(shot, T, env) {
        const base = { W: env.W, H: env.H };
        const hx = OpeningStreet.hotels().find((h) => h.party), cx = (hx.x0 + hx.x1) / 2;
        if (shot === 0) { const k = u(T, 0, B(2)); return Neon.camera({ ...base, pos: [cx + 3.5 - k * 7, 1.7, 2.4], yaw: -0.03 + k * 0.05, pitch: 0.2, roll: 0, f: 820 }); }
        if (shot === 1) { const k = u(T, B(2), B(4)); return turned(Neon.camera({ ...base, pos: [-15.2, 1.25, cx - 92 + k * 16], yaw: -0.3 + k * 0.04, pitch: 0.06, roll: 0, f: 880 })); }
        const k = u(T, B(4), B(6));
        return Neon.camera({ ...base, pos: [cx + 0.6, 1.5 + k * 8.5, 15.5 - k * 2], yaw: -0.02, pitch: 0.12 + k * 0.32, roll: 0, f: 900 });
    }

    // inside: the mirror ball from below; the room from high at the front; through the crowd;
    // her, the camera pulling back as it zooms in (her size held, the room swelling behind her)
    const HER = () => OpeningParty.HER;
    function partyCam(shot, T, env) {
        const base = { W: env.W, H: env.H };
        if (shot === 3) { const k = u(T, B(6), B(8)); return Neon.camera({ ...base, pos: [0.9 - k * 0.4, 1.65 + k * 0.5, 8.4 - k * 4.4], yaw: -0.05 + k * 0.03, pitch: 0.62 - k * 0.62, roll: 0.03 - k * 0.03, f: 1050 - k * 150 }); }
        if (shot === 4) { const k = u(T, B(8), B(9)); return Neon.camera({ ...base, pos: [-1.2 + k * 1.6, 5.2 - k * 0.6, -2.4 + k * 1.6], yaw: 0.04, pitch: -0.2 + k * 0.03, roll: 0, f: 820 }); }
        if (shot === 5) { const k = u(T, B(9), B(10)); return Neon.camera({ ...base, pos: [-2.6 + k * 1.2, 1.62, 2.2 + k * 3.0], yaw: 0.2 - k * 0.12, pitch: 0.02, roll: -0.01, f: 950 }); }
        // the dolly-zoom: the distance from 2.7 to 5.2 m and the focal length with it (she keeps
        // her size, the room behind her grows); slow until «I wanna go», then pressing
        const k = 0.35 * u(T, B(10), B(11)) + 0.65 * Ease.inOut(Ease.seg(T, B(11), B(12) - 0.1));
        const D = 2.7 + k * 2.5, h = HER();
        return Neon.camera({ ...base, pos: [h[0] + 0.05, 1.5, h[2] - D], yaw: 0, pitch: 0.02, roll: 0.004 * Math.sin(T * 1.7), f: 1800 * D / 2.7 });
    }
    function partyOpts(shot, T) {
        if (shot === 3) return { energy: 0, rays: true, rimA: 0.55 };
        const flash = T >= B(8) ? 0.5 * Math.exp(-(T - B(8)) * 7) : 0;
        if (shot < 6) return { energy: 1, flash };
        // she: three-quarter until «I'm stuck in the party», then she turns to us
        const press = Math.min(1, Math.floor(Math.max(0, Song.beatAt(T) - Song.beatAt(B(10) + 2.0))) / 6);
        return { energy: 1, press, close: 0.15 + 0.6 * press, her: { view: T < 23.1 ? 'tq' : 'front' } };
    }

    Sections.opening = {
        from: 0, to: B(12), shots: SHOTS,
        async setup(env) { return {}; },
        draw(g, env, T, d) {
            const { N } = env.state, shot = shotIndex(T + 1 / 48);
            if (shot <= 2) {
                const beatCol = [Ink.PAL.magenta, Ink.PAL.cyan, Ink.PAL.pink, Ink.PAL.violet][Math.floor(Song.beatAt(T)) & 3];
                const cam = streetCam(shot, T, env);
                return OpeningStreet.frame(g, env, N, T, d, cam, { beatCol, skyCam: cam.sky });
            }
            return OpeningParty.frame(g, env, N, T, d, partyCam(shot, T, env), partyOpts(shot, T));
        },
    };
})();
