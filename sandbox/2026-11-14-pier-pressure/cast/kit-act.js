// pier-pressure · Kit's acting: her two drawings (cast/kit-drawn.js) posed part by part.
// Global: KitAct. Load after drawn.js and kit-drawn.js.
//
//   KitAct.stand(g, x, y, s, { crouch, droop, arm, nod, lean, only })
//       her standing drawing, the soles of her boots on (x, y), s units per drawing unit.
//       crouch: how far her upper body has come down over her legs (drawing units, up to ~36:
//       seen from the front, a crouch is the shorts coming down over the shins, the knees
//       spreading); droop: how far the bunches of hair hang (radians, negative = flying up);
//       arm: the thumb arm away from its drawn place (negative = lowered); nod: the head
//       tipped forward; lean: the upper body turned about the hips.
//   KitAct.air(g, x, y, s, { lift, tilt, flail })
//       her jump drawing, its lowest boot on (x, y); lift: the bunches streaming up behind her
//       fall; tilt: the whole body's rotation; flail: the arms and boots, −1…1.
//   KitAct.board(g, x, y, s, rot)   her board alone (the standing drawing's), wheels on (x, y)
const KitAct = (() => {
    const FEET = 708, MID = 235; // the soles' line and the figure's middle in the standing drawing
    const UPPER = ['shorts', 'torso', 'armR', 'bunchL', 'bunchR', 'head', 'armL'];
    function stand(g, x, y, s, o = {}) {
        const { crouch = 0, droop = 0, arm = 0, nod = 0, lean = 0 } = o;
        const HIP = [250, 440];
        // every part of the upper body comes down together, turned about the hips; then each
        // has its own move about its own joint
        const up = (at, rot, extra = {}) => {
            const c = Math.cos(lean), sn = Math.sin(lean), rx = at[0] - HIP[0], ry = at[1] - HIP[1];
            return { at, rot: lean + rot, dx: HIP[0] + rx * c - ry * sn - at[0], dy: HIP[1] + rx * sn + ry * c - at[1] + crouch, ...extra };
        };
        const head = up([258, 240], nod, {});
        head.dy += crouch * 0.08; // the neck gives a little too
        const hp = (p) => { // a point of the head, where the head has taken it
            const c = Math.cos(head.rot), sn = Math.sin(head.rot), rx = p[0] - 258, ry = p[1] - 240;
            return [258 + head.dx + rx * c - ry * sn, 240 + head.dy + rx * sn + ry * c];
        };
        const bunch = (pivot, sign) => {
            const q = hp(pivot);
            return { at: pivot, rot: head.rot + sign * droop, dx: q[0] - pivot[0], dy: q[1] - pivot[1] };
        };
        Drawn.draw(g, 'kit', 'stand', x - MID * s, y - FEET * s, s, {
            only: o.only, hide: o.hide,
            layers: [['wheels', 'board', 'legs', 'bootR', 'bootL'], UPPER],
            parts: {
                shorts: up([250, 470], 0, { sx: 1 + crouch * 0.0022 }), // the knees spread
                torso: up(HIP, 0),
                armR: up([330, 300], 0),
                armL: up([176, 320], arm), // about the elbow, inside the sleeve's opening
                head,
                bunchL: bunch([175, 68], -1),
                bunchR: bunch([335, 68], 1),
            },
        });
    }
    function air(g, x, y, s, o = {}) {
        const { lift = 0, tilt = 0, flail = 0 } = o;
        g.save();
        g.translate(x, y);
        g.rotate(tilt);
        Drawn.draw(g, 'kit', 'jump', -380 * s, -604 * s, s, {
            parts: {
                head: { at: [312, 296], rot: flail * 0.04 },
                bunchL: { at: [182, 140], rot: lift * 0.9 },
                bunchR: { at: [332, 92], rot: -lift * 0.7 },
                armL: { at: [196, 300], rot: flail * 0.14 + lift * 0.2 },
                armR: { at: [436, 276], rot: -flail * 0.1 - lift * 0.15 },
                bootNear: { at: [478, 400], rot: flail * 0.05 },
                bootFar: { at: [262, 452], rot: -flail * 0.08 },
            },
        });
        g.restore();
    }
    // The board alone. In her standing drawing her boot hides half the deck, so the deck is
    // drawn here whole (measured on the sheet: its far edge runs on under the boot's sole), over
    // the drawing's own trucks and wheels. Its middle is (140, 648), its wheels' feet at 708.
    const DECK = [[14, 600], [18, 592], [30, 587], [60, 585], [100, 588], [140, 596], [180, 606], [225, 619], [258, 628, 1], [264, 633], [262, 641, 1], [240, 646], [205, 653], [180, 655], [150, 650], [120, 642], [60, 628], [24, 613]];
    const GRIP = [[16, 598], [20, 591], [30, 588], [60, 586.6], [100, 589.6], [140, 597.4], [180, 607.4], [225, 620.4], [256, 629, 1], [254, 633, 1], [240, 636.6], [204, 645.4], [180, 646.6], [150, 641.6], [120, 634], [60, 620], [24, 603]];
    function board(g, x, y, s, rot = 0) {
        const T = SkateToon;
        g.save();
        g.translate(x, y - 60 * s);
        g.rotate(rot);
        Drawn.draw(g, 'kit', 'stand', -140 * s, -648 * s, s, { only: ['wheels'] });
        g.translate(-140 * s, -648 * s);
        g.scale(s, s);
        T.shape(g, DECK, { fill: '#daa973', w: 2, seed: 'kit-deck', amp: 0.1 });
        T.shape(g, GRIP, { fill: '#3b3b3b', w: 1.6, seed: 'kit-grip', amp: 0.1 });
        for (const [bx, by] of [[36, 596], [48, 599], [214, 627], [228, 631]]) {
            g.fillStyle = '#1c1c1c';
            g.beginPath();
            g.arc(bx, by, 1.5, 0, Math.PI * 2);
            g.fill();
        }
        g.restore();
    }
    // Her key poses for the drop (cast/kit-drop-drawn.js): for each, where her feet are in the
    // drawing (the middle between her soles, on their line; for the two poses in the air, the
    // lowest point of her boots under her middle) and its scale against the standing pose
    // `proud`: the two sheets were drawn at different sizes (calibrated on dev/ref/scene.js).
    const DROP = {
        tuck: { at: [200, 512], k: 1.06 }, reach: { at: [238, 655], k: 1.06 }, contact: { at: [204, 598], k: 1.06 },
        crouch: { at: [238, 388], k: 1 }, rise: { at: [218, 566], k: 1 }, proud: { at: [190, 640], k: 1 },
    };
    // pose(g, name, x, y, s, { rot, sx, sy }): her feet on (x, y); s: units per pixel of `proud`
    function pose(g, name, x, y, s, o = {}) {
        const d = DROP[name], z = s * d.k;
        g.save();
        g.translate(x, y);
        g.rotate(o.rot ?? 0);
        g.scale(o.sx ?? 1, o.sy ?? 1);
        Drawn.draw(g, 'kit', name, -d.at[0] * z, -d.at[1] * z, z);
        g.restore();
    }
    return { pose, DROP, stand, air, board, FEET, MID, BOARD_DX: 140 - MID };
})();
