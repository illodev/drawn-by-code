// Galileo's head at full detail, near profile facing right (his right side to the camera, the
// far eye hidden behind the bridge of the nose), built round the macro eye of segments/galileo.js
// so one drawing serves every zoom, from the eye filling the frame to the whole man on his roof.
// Global: GalHead.
//
//   GalHead.draw(press, o)   head units: the near eye's centre at (0, 0), the eye ≈ 350 wide;
//                            crown y ≈ -1480, chin y ≈ 1500 (a real head's thirds: hairline to
//                            brow = brow to the nose's base = base to chin); upright, facing +x
//                            (rotate outside to look up). o: { lid, look, pupil, brow, mouth }
//   GalHead.NECK             the neck's centre where it meets the collar (head units)
//   GalHead.MOUTH            where the breath comes out
//
// After portraits of Galileo at about 46 (Santi di Tito, c. 1601; Passignani, 1612): a high
// forehead, the hair receding from it and kept short round the back, reddish brown with some
// grey; a short full beard and a moustache; a straight, strong nose.
const GalHead = (() => {
    const { put, ink, line, smooth, taper, circle, ellipse } = Ph;
    const L = Ease.lerp;
    const SKIN = Cast.SKIN, SKIN_SH = Cast.SKIN_SH;
    const SKIN_DK = { 'yellow.s': 0.36, 'pink.s': 0.5, 'navy.s': 0.2 };
    const LINE = { 'pink.s': 0.55, 'navy.s': 0.4 };
    const HAIR = { 'pink.s': 0.6, yellow: 0.9, 'navy.s': 0.64 };
    const HAIR_LT = { 'pink.s': 0.5, yellow: 0.8, 'navy.s': 0.28 };
    const HAIR_DK = { 'pink.s': 0.5, yellow: 1, navy: 1 };
    const GREY = { 'yellow.s': 0.3, 'blue.s': 0.2, 'navy.s': 0.12 };
    const LIP = { 'pink.s': 0.36, 'yellow.s': 0.2, 'navy.s': 0.04 };

    // the skull and face: crown, forehead, brow ridge, nose (the macro eye's own contour), lips,
    // chin, the jaw's underside, the nape and the round back of the skull
    const HEAD = [[-800, -1510], [-420, -1500], [-120, -1420], [90, -1280], [210, -1100], [280, -880], [310, -620], [340, -360], [322, -200], [276, -70], [292, 60], [350, 240], [430, 440], [476, 600], [505, 660], [500, 700], [470, 725], [430, 732], [446, 770], [470, 832], [458, 866], [476, 900], [446, 950], [480, 1100], [470, 1260], [400, 1400], [200, 1500], [-100, 1540], [-500, 1420], [-850, 1180], [-1150, 1050], [-1550, 760], [-1850, 300], [-1950, -250], [-1820, -800], [-1450, -1250]];
    const NECK = [-560, 2000], MOUTH = [490, 890];
    const EAR = [[-880, -150], [-1000, -236], [-1120, -170], [-1172, 40], [-1136, 300], [-1066, 480], [-996, 620], [-930, 694], [-876, 650], [-884, 500], [-846, 300], [-860, 80]];
    const BEARD = [[-880, -80], [-770, -80], [-730, 260], [-460, 640], [-120, 820], [240, 900], [330, 950], [400, 975], [470, 960], [540, 1080], [566, 1300], [520, 1560], [400, 1760], [180, 1880], [-160, 1890], [-560, 1720], [-900, 1440], [-1080, 1120], [-1060, 820], [-960, 700], [-900, 500]];
    const MOUS = [[476, 744], [410, 736], [330, 770], [250, 850], [220, 940], [270, 920], [340, 858], [430, 826], [500, 812], [510, 780]];
    const HAIRB = [[-640, -780], [-780, -1060], [-1100, -1300], [-1480, -1280], [-1820, -920], [-2010, -350], [-2000, 200], [-1790, 650], [-1450, 930], [-1150, 1050], [-1030, 820], [-1100, 300], [-1130, -160], [-1000, -300], [-860, -260], [-780, -90], [-690, -400]];

    function draw(press, o = {}) {
        const P = Seg.galileo.parts, by = o.brow ?? 0, mo = o.mouth ?? 0;
        // (part: 'neck' draws only the neck, for a collar to go over it; 'head' all but the neck)
        const part = o.part ?? 'all';
        // the neck, in the jaw's shadow; the tendon from behind the ear to the collar
        const NECKP = [[-200, 1300], [60, 1700], [120, 2200], [-1300, 2200], [-1320, 1500], [-1250, 900]];
        if (part !== 'head') {
            put(press, (g) => smooth(g, NECKP), SKIN_SH);
            press.save(); press.clip((g) => smooth(g, NECKP));
            ink(press, (g) => g.rect(-1400, 1200, 1600, 1100), { 'navy.s': (g) => Riso.ramp(g, 0, 1400, 0, 1900, 0.3, 0.05), 'pink.s': 0.12 });
            line(press, [[-980, 900], [-700, 1500], [-420, 2150]], taper(60, 0.3, 0.3), { 'pink.s': 0.2, 'navy.s': 0.1 });
            press.restore();
            if (part === 'neck') return;
        }
        // the head's skin, turned from the light towards the back, the lit dome of the forehead
        put(press, (g) => smooth(g, HEAD), SKIN);
        press.save();
        press.clip((g) => smooth(g, HEAD));
        ink(press, (g) => g.rect(-2300, -1600, 3000, 3300), { 'pink.s': (g) => Riso.ramp(g, -900, 0, -330, 0, 0.26, 0), 'navy.s': (g) => Riso.ramp(g, -900, 0, -330, 0, 0.1, 0) });
        ink(press, (g) => g.rect(-2300, -1600, 3000, 3300), { 'pink.s': (g) => Riso.ramp(g, 0, 700, 0, 1400, 0, 0.2) });
        press.knockout((g) => { g.fillStyle = Riso.radial(g, -60, -1140, 20, 420, 0.5, 0); g.beginPath(); g.ellipse(-60, -1140, 460, 190, -0.2, 0, 6.2832); g.fill(); });
        // the cheekbone's plane and the hollow below it, the fold from the nose's wing to the mouth
        ink(press, ellipse(-200, 560, 420, 200, -0.1), { 'pink.s': (g) => Riso.radial(g, -200, 560, 20, 420, 0.16, 0) });
        line(press, [[360, 600], [310, 700], [270, 820]], taper(10, 0.2, 0.6), { 'pink.s': 0.35, 'navy.s': 0.12 });
        // forehead lines above the brow and on the high forehead
        for (const [y, x0, x1] of [[-640, -300, 190], [-720, -200, 170], [-800, -80, 160]]) line(press, [[x0, y], [(x0 + x1) / 2, y - 20], [x1, y + 6]], taper(6), { 'pink.s': 0.36, 'navy.s': 0.1 });
        // a few freckles over the dome
        const rf = Motion.rng('galdome');
        for (let i = 0; i < 70; i++) { const x = -1300 + rf() * 1500, y = -1400 + rf() * 700; ink(press, circle(x, y, 3 + rf() * 4), rf() < 0.5 ? { 'pink.s': 0.3 } : { 'yellow.s': 0.4, 'pink.s': 0.2 }); }
        press.restore();
        // the eye, brow, socket and nose's side: the macro's own drawing
        P.eyeMacro(press, [0, 0], { lid: o.lid ?? 0, look: o.look ?? 0.7, pupil: o.pupil ?? 1, brow: by, bare: true, temple: false });
        // the nose: its ridge, the wing and the nostril under the tip
        line(press, [[300, -170], [292, 60], [350, 240], [430, 440], [490, 620], [506, 680], [476, 724]], taper(7, 0.1, 0.1), LINE);
        line(press, [[334, 610], [300, 660], [330, 712], [400, 720]], taper(8, 0.2, 0.3), LINE);
        ink(press, (g) => smooth(g, [[330, 612], [420, 590], [460, 640], [380, 610]]), { 'pink.s': 0.18 });
        put(press, (g) => smooth(g, [[396, 706], [436, 700], [456, 714], [424, 722]]), SKIN_DK);
        // the lips: the lower one full and lit; the mouth opens a little in surprise
        if (mo > 0) put(press, (g) => smooth(g, [[330, 870], [430, 866], [476, 880 + mo * 40], [420, 900 + mo * 70], [340, 890 + mo * 40]]), { navy: 1, 'pink.s': 0.6 });
        put(press, (g) => smooth(g, [[320, 900 + mo * 60], [410, 884 + mo * 70], [462, 900 + mo * 60], [440, 940 + mo * 60], [370, 950 + mo * 60]]), LIP);
        press.knockout(ellipse(420, 912 + mo * 60, 30, 10, -0.1));
        // the beard: from the sideburn down round the jaw and the chin, full and short; its shadow
        // side under the jaw; hundreds of short strands following the growth, some grey
        put(press, (g) => smooth(g, BEARD), HAIR);
        press.save();
        press.clip((g) => smooth(g, BEARD));
        ink(press, (g) => smooth(g, [[-1100, 900], [-500, 1300], [100, 1500], [600, 1600], [600, 2000], [-1100, 2000]]), { navy: 0.55 });
        ink(press, (g) => smooth(g, [[-700, 200], [-300, 700], [200, 950], [500, 1150], [300, 1250], [-200, 1050], [-700, 700]]), { 'yellow.s': 0.2 });
        const rb = Motion.rng('galbeard');
        for (let i = 0; i < 700; i++) {
            const x = -1080 + rb() * 1650, y = -80 + rb() * 1970;
            // growth: down the cheek, forward and down on the chin, down and back under the jaw
            const a = Math.PI / 2 - 0.35 + (x + 500) * -0.00032 + (rb() - 0.5) * 0.6, l = 70 + rb() * 90;
            const c = rb();
            line(press, [[x, y], [x + Math.cos(a) * l * 0.5 + 10, y + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l, y + Math.sin(a) * l]], taper(14 + rb() * 10, 0.1, 0.8), c < 0.28 ? HAIR_LT : c < 0.58 ? HAIR_DK : c < 0.66 ? GREY : HAIR);
        }
        press.restore();
        // the beard's ragged edge: tufts breaking its outline
        const re = Motion.rng('galbeard-edge');
        for (let i = 0; i < 70; i++) {
            const u = re(), [x, y] = Ph.sample(BEARD, true, 4)[Math.floor(u * Ph.sample(BEARD, true, 4).length)];
            line(press, [[x, y], [x + 18 + re() * 30, y + 40 + re() * 50]], taper(16 + re() * 8, 0.1, 0.9), re() < 0.5 ? HAIR : HAIR_DK);
        }
        // the beard thins out up the cheek: short sparse hairs above its edge
        const rc = Motion.rng('galcheek');
        for (let i = 0; i < 110; i++) {
            const u = rc(), x = L(-730, 240, u), y = (u < 0.35 ? L(260, 640, u / 0.35) : L(640, 900, (u - 0.35) / 0.65)) - (x < -600 ? 300 : 0) - rc() * rc() * 150;
            line(press, [[x, y], [x + 8, y + 30 + rc() * 30]], taper(8 + rc() * 5, 0.1, 0.8), rc() < 0.5 ? HAIR : HAIR_DK);
        }
        // the moustache over the upper lip, drooping past the corner into the beard
        put(press, (g) => smooth(g, MOUS), HAIR);
        const rm = Motion.rng('galmou');
        for (let i = 0; i < 70; i++) {
            const u = rm(), x = 500 - u * 250, y = 760 + u * 60 + (rm() - 0.5) * 50;
            line(press, [[x, y], [x - 30 - u * 40, y + 40 + rm() * 40]], taper(12 + rm() * 6, 0.1, 0.8), rm() < 0.35 ? HAIR_LT : rm() < 0.7 ? HAIR_DK : HAIR);
        }
        // the hair: receding from the forehead, kept short round the back and over the ear;
        // combed back in locks, some grey above the ear; thin strands across the crown
        put(press, (g) => smooth(g, HAIRB), HAIR);
        press.save();
        press.clip((g) => smooth(g, HAIRB));
        ink(press, (g) => smooth(g, [[-2300, 0], [-1600, 500], [-1200, 1100], [-2300, 1100]]), { navy: 0.55 });
        // strands combed back: from the temple towards the crown's back, turning down at the nape
        const rs = Motion.rng('galhair');
        for (let i = 0; i < 520; i++) {
            const x = -2050 + rs() * 1420, y = -1320 + rs() * 2380, a = Math.PI - 0.25 + ((y + 1300) / 2400) * 1.35 + (rs() - 0.5) * 0.25, l = 110 + rs() * 140;
            const c = rs();
            line(press, [[x, y], [x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5 + 8], [x + Math.cos(a) * l, y + Math.sin(a) * l]], taper(10 + rs() * 8, 0.1, 0.7), c < 0.3 ? HAIR_LT : c < 0.62 ? HAIR_DK : c < 0.72 ? GREY : HAIR);
        }
        press.restore();
        // the receding line breaks up: thin strands reaching onto the bald dome
        for (let i = 0; i < 40; i++) {
            const u = rs(), p = [L(-640, -1450, u) + (rs() - 0.5) * 60, L(-780, -1280, Math.sqrt(u)) + (rs() - 0.5) * 60];
            line(press, [p, [p[0] + 40 + rs() * 50, p[1] - 30 - rs() * 30]], taper(6, 0.2, 0.8), rs() < 0.5 ? HAIR : GREY);
        }
        for (const [pts, w, lit] of [
            [[[-700, -720], [-980, -1020], [-1380, -1180], [-1760, -960]], 150, HAIR_LT],
            [[[-760, -440], [-1080, -720], [-1480, -780], [-1880, -520]], 160, HAIR_LT],
            [[[-820, -220], [-1180, -420], [-1560, -340], [-1920, -40]], 150, HAIR_LT],
            [[[-1200, -60], [-1420, 220], [-1680, 440], [-1800, 560]], 140, HAIR_LT],
            [[[-1150, 420], [-1300, 660], [-1480, 840], [-1400, 960]], 120, HAIR_LT],
        ]) P.lock(press, pts, w, HAIR, lit, HAIR_DK);
        const rh = Motion.rng('galnape');
        for (let i = 0; i < 90; i++) {
            const u = rh(), p = Ph.sample(HAIRB, true, 4)[Math.floor(u * Ph.sample(HAIRB, true, 4).length)];
            if (p[0] > -700) continue;
            line(press, [p, [p[0] - 20 - rh() * 20, p[1] + 30 + rh() * 40]], taper(10, 0.1, 0.8), rh() < 0.5 ? HAIR_DK : HAIR);
        }
        for (let i = 0; i < 9; i++) line(press, [[-640 - i * 30, -900 - i * 40], [-900 - i * 60, -1140 - i * 10], [-1300 - i * 50, -1220 + i * 20]], taper(6, 0.1, 0.4), i % 3 ? HAIR : GREY);
        // the ear: helix, antihelix, the bowl in shade, the tragus, the lobe
        put(press, (g) => smooth(g, EAR), SKIN);
        press.save(); press.clip((g) => smooth(g, EAR));
        ink(press, (g) => g.rect(-1200, -300, 400, 1100), { 'pink.s': (g) => Riso.ramp(g, -1180, 0, -880, 0, 0.3, 0.1) });
        press.restore();
        put(press, (g) => smooth(g, [[-900, 120], [-1010, 80], [-1060, 220], [-1020, 400], [-940, 430], [-900, 300]]), SKIN_SH);
        put(press, ellipse(-950, 250, 44, 90), SKIN_DK);
        line(press, [[-900, -130], [-1000, -196], [-1110, -140], [-1140, 60], [-1100, 300], [-1030, 470], [-970, 560]], taper(22, 0.2, 0.4), { 'pink.s': 0.3, 'navy.s': 0.12 });
        line(press, [[-980, -110], [-1060, 60], [-1040, 260], [-990, 380]], taper(18, 0.3, 0.3), LINE);
        line(press, [[-1010, -40], [-940, -20]], taper(12), LINE);
        put(press, (g) => smooth(g, [[-872, 200], [-840, 250], [-860, 320], [-900, 290]]), SKIN);
        put(press, ellipse(-940, 620, 50, 64, 0.3), { 'pink.s': 0.22, 'yellow.s': 0.12 });
    }
    return { draw, NECK, MOUTH, HEAD };
})();
