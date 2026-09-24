// 2026-09-24-pixel-building · style pixel-art
// A 1:1 replica, made as a study, of a pixel-art loop (author to be credited, see brief.md):
// a building in cutaway with tiny characters living in it, a van and a street sign.
//
// The art is 230×230 pixels (4.696 video px each at 1080) at 10 fps, 51 frames. Every
// sprite in building.js was measured on the reference with styles/pixel-art/grab.mjs:
// the per-cell colour of every frame, clustered into the artist's palette, the still
// street as the per-cell mode, and each moving thing as an actor with its drawings and
// the drawing it shows at each of the 51 frames.
//
// Cast (building.js, in grid cells):
//   street        the building in cutaway, roof, van, ladder, statue, ground line (still)
//   signpost      LISBON / N.TOKYO (still)
//   roofMan       the man on the machine eating, the fruit glinting (dishGlint)
//   roofKid       the cyan-haired kid in red waving on the roof edge
//   machineLights the lights on the walking machine
//   birds         two black birds on the cornice; one flaps
//   windowCat     the cat in the arched window
//   officeMan     the old man at the desk, top-left room (plus officeShelf, laptopLed)
//   plantAndTiger the plant creature on the shelf and the tiger on the sofa
//   tvScreen      the dots blinking on the TV, middle-left room
//   doorAndEye    the eye bubble and the door, middle-right room
//   deskWorker    the man at the desk, green room; heartBubble his speech bubble
//   courierAndStatue the courier at the statue, left street
//   vanLetters, vanDriver  F.A.S.T and the driver
//   blueCreature  the blue creature and the painter in the ground floor (painterFoot)
//   cellarDoor    what peeks out of the arched door
//   passerby      the man walking by the sign and his speech bubble
//   signCat       the cat on the sign
Motion.scene({
    fps: 10,
    duration: 5.1,
    logical: [1000, 1000],
    // the transcribed sprites are the artist's pixels: they live in private/ (never committed)
    uses: ['styles/pixel-art/pixel.js', { src: 'sandbox/2026-09-24-pixel-building/private/building.js', optional: true }],
    shots: [[0, 5.1, 'Building']],

    setup() {
        if (typeof Building === 'undefined') return { missing: true };
        const B = Building;
        const pal = Pixel.palette(B.symbols, B.palette);
        return {
            scr: Pixel.screen(B.cells, B.rows),
            pieces: B.pieces.map((p) => ({ ...p, s: Pixel.sprite(p.map, pal) })),
            actors: B.actors.map((a) => ({ ...a, s: a.draws.map((d) => Pixel.sprite(d, pal)) })),
        };
    },

    draw(g, t, env) {
        if (env.state.missing) {
            g.fillStyle = '#93a8f4';
            g.fillRect(0, 0, 1000, 1000);
            g.fillStyle = '#1b1e3a';
            g.font = '30px monospace';
            g.textAlign = 'center';
            g.fillText('private/building.js is not in the repo (the artist\'s pixels)', 500, 500);
            return;
        }
        const { scr, pieces, actors } = env.state;
        // the art's frame: one drawing per 1/10 s, exactly as measured (no easing anywhere)
        const f = Math.min(50, Pixel.frame(t, 10));
        scr.clear(Building.bg);
        for (const p of pieces) scr.blit(p.s, p.x, p.y);
        for (const a of actors) scr.blit(a.s[a.seq[f]], a.x, a.y);
        scr.present(g, env);
    },
});
