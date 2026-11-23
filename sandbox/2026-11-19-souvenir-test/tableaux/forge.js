// Picture 9, the last · The forge and the moon: Lorca's «Romance de la luna, luna» without
// its people. «La luna vino a la fragua con su polisón de nardos»: a Sacromonte cave forge
// in firelight, and outside it the olive grove and the full moon the film ends on.
//
// The order is the poem's night, from inside out. We come in by the fire (the first thing
// seen, through the black sound hole of the picture before) into the cave's first room: its
// vault, the copper and the Granada plates on the whitewash, all of it lit from the forge
// beyond the arch (A). Then the forge itself: the hearth and its fire, the anvil, the
// bellows, the tongs and hammers, the tin «for necklaces and white rings» on a nail (B).
// Then the cave's mouth, its door open, a horseshoe over it for luck, the bridle waiting
// for the horseman «tocando el tambor del llano», the cricket in its cage (C). Out of the
// mouth the light turns cold: the olive grove, «bronce y sueño», the owl («cómo canta la
// zumaya») and a will-o'-the-wisp between the trunks (Falla's «El amor brujo») (D). Last,
// the moon, whole, her bustle of tuberoses round her lower half, on the night sky: the film
// ends on her. The fire is painted and lights everything inside (warm rims, blue-black
// shadow sides); the moon lights everything outside, from behind, cold.
//
// Hidden, for whoever knows: the pomegranate on the Fajalauza plate (Granada's own sign and
// ware); a tuberose floret fallen on the anvil (the moon has been at the forge); the
// crescent on the bridle's brass; the hill's conglomerate and its river pebbles where the
// lime has flaked (Sacromonte is dug in it); a smith's tally in charcoal on the whitewash;
// the añil-blue dado of a southern house; the cat's hole in the door.
//
//   Tableau.forge(z0) → layers; the first stratum at z0.  .depth: z0 → the moon's layer.
//   .hole = 0: the film ends here. The sky is `SKY` behind the moon.
window.Tableau = window.Tableau || {};
Tableau.forge = (z0) => {
    const S = Souvenir, F = Forge;
    const Z = Tableau.forge.Z;
    // where the fire is (the coal bed's flame) and the moon, in the picture's own depth
    const FIRE_AT = { x: -330, y: 20, z: Z.hearth };
    const MOON_AT = { x: 0, y: 0, z: Z.moon };
    const k3 = (c, k) => c.map((v) => v * k);
    // the lights as a layer at depth zl sees them (z: how far in front of it)
    const lights = (zl, o = {}) => {
        const L = {
            fire: { x: FIRE_AT.x, y: FIRE_AT.y, z: zl - FIRE_AT.z + (o.fireLift ?? 0), c: k3(F.FIRE, o.fire ?? 1), r0: o.r0 ?? 820, wrap: 0.25 },
            amb: o.amb ?? F.DARK,
            lights: o.extra ?? [],
        };
        if (o.moon) L.moon = { x: MOON_AT.x, y: MOON_AT.y, z: zl - MOON_AT.z, c: k3(F.MOON, o.moon), r0: 1e9, wrap: 0.3 };
        return L;
    };
    const big = { x: -1200, y: -720, w: 2400, h: 1440 };
    const plate = { x: -1300, y: -780, w: 2600, h: 1560 };
    const tooth = (g, box) => S.tooth(g, box, { amp: 0.05 });
    // charcoal strokes: a tally, a sum
    const tally = (g, x, y, n, rot = -0.05) => {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.strokeStyle = 'rgba(24,18,20,0.75)';
        g.lineCap = 'round';
        for (let i = 0; i < n; i++) {
            g.lineWidth = 2.4 - (i % 3) * 0.3;
            g.beginPath();
            if (i % 5 === 4) {
                g.moveTo(-6 + Math.floor(i / 5) * 46, 4);
                g.lineTo(34 + Math.floor(i / 5) * 46, -22);
            } else {
                const xx = (i % 5) * 8 + Math.floor(i / 5) * 46;
                g.moveTo(xx, -26 + (i % 2) * 2);
                g.lineTo(xx + 1.5, 8 - (i % 3));
            }
            g.stroke();
        }
        g.restore();
    };
    // the arch between the first room and the forge
    const arch = (() => {
        const pts = [];
        for (let i = 0; i <= 28; i++) {
            const a = Math.PI + (i / 28) * Math.PI;
            pts.push([Math.cos(a) * 292 + 6 * Math.sin(i * 1.7), -60 + Math.sin(a) * 216 + 4 * Math.cos(i * 2.3)]);
        }
        pts.push([296, 226], [120, 230], [-120, 228], [-294, 224]);
        return pts;
    })();
    // the forge room's doorway, under its lintel
    const doorway = [[-214, -196], [226, -194], [232, 40], [238, 262], [-222, 266], [-218, 40]];
    // the cave's mouth to the night: dug, round-headed, uneven
    const mouth = (() => {
        const pts = [];
        for (let i = 0; i <= 30; i++) {
            const a = Math.PI + (i / 30) * Math.PI;
            pts.push([Math.cos(a) * 250 + 10 * Math.sin(i * 1.3), -40 + Math.sin(a) * 236 * (1 + 0.08 * Math.cos(a)) + 7 * Math.cos(i * 1.9)]);
        }
        pts.push([256, 120], [262, 268], [0, 276], [-262, 266], [-254, 120]);
        return pts;
    })();

    return [
        // ===================================================== A · the vault and its copper
        {
            // the near lip of the vault and a pillar of the rock, lit from below by the glow
            id: 'forge-vault-near', z: z0 + Z.vaultNear, box: big, res: 0.8, brush: false,
            paint(g) {
                const L = lights(Z.vaultNear, { extra: [{ x: 0, y: 260, z: 420, c: [0.9, 0.44, 0.18], r0: 560 }] });
                const hole = [];
                for (let i = 0; i <= 40; i++) {
                    const a = Math.PI + (i / 40) * Math.PI;
                    hole.push([Math.cos(a) * 900 + 30 * Math.sin(i * 0.9), -40 + Math.sin(a) * 420 + 20 * Math.cos(i * 1.4)]);
                }
                hole.push([905, 760], [-905, 760]);
                F.cave(g, { box: big, holes: [hole], reveal: 90, revealDepth: 160, wash: 0.8, seed: 'vault-lip', ...L,
                    soot: (x, y) => S.clamp((-y - 380) / 300) });
                // a big pan hung from the vault, and a copper basin leaning on the floor
                F.pan(g, { x: 960, y: -380, r: 210, view: 'back', seed: 'near-pan', sooty: 0.8, lift: 30, ...L });
                F.pan(g, { x: -1010, y: 470, r: 250, view: 'inside', seed: 'near-basin', lift: 30, ...L });
                tooth(g, big);
            },
        },
        {
            // copper hung from the vault on chains and cords, overlapping the wall's
            id: 'forge-vault-hung', z: z0 + Z.vault, box: big, brush: false,
            paint(g) {
                const L = lights(Z.vault, { extra: [{ x: 0, y: 240, z: 360, c: [0.95, 0.46, 0.19], r0: 480 }] });
                // the chain of the cauldron up into the vault
                const chain = (x0, y0, y1) => {
                    for (let y = y1; y < y0; y += 15) {
                        g.strokeStyle = '#1a1416';
                        g.lineWidth = 3.4;
                        g.beginPath();
                        g.ellipse(x0, y + 7, Math.abs(y / 15) % 2 < 1 ? 5 : 1.6, 8, 0, 0, 7);
                        g.stroke();
                        g.strokeStyle = 'rgba(255,170,100,0.35)';
                        g.lineWidth = 1;
                        g.stroke();
                    }
                };
                const c1 = F.cauldron(g, { x: -660, y: -150, w: 280, seed: 'vault-cauldron', ...L });
                chain(c1.hook[0], c1.hook[1], -740);
                const cord = (x0, y0, y1) => {
                    g.strokeStyle = '#3a2a20';
                    g.lineWidth = 2.6;
                    g.beginPath();
                    g.moveTo(x0, y0);
                    g.quadraticCurveTo(x0 + 4, (y0 + y1) / 2, x0 + 2, y1);
                    g.stroke();
                };
                // a bed warmer hung by its handle's loop, a pan on a cord
                cord(700, -760, -470);
                F.warmer(g, { x: 700, y: 140, r: 96, hlen: 500, seed: 'vault-warmer', ...L });
                cord(470, -760, -330);
                F.pan(g, { x: 470, y: -160, r: 88, view: 'inside', seed: 'vault-pan2', lift: 8, ...L });
                // smoke under the vault, lit from below
                F.smoke(g, { x: 0, y: -380, h: 360, w: 1700, n: 22, glow: 0.7, alpha: 0.22, seed: 'vault-smoke' });
                tooth(g, big);
            },
        },
        {
            // the first room's wall (the stratum's body): whitewash on the hill's conglomerate,
            // the arch to the forge, plates and pans on nails, soot from the smoke that comes
            // through the arch, an añil dado
            id: 'forge-vault-wall', z: z0 + Z.vaultWall, box: big, brush: false,
            paint(g) {
                // the forge's light comes through the arch and off the floor: a pool round the arch
                const bounce = { x: 0, y: 260, z: 300, c: [1.15, 0.56, 0.22], r0: 400 };
                const L = lights(Z.vaultWall, { fireLift: 220, extra: [bounce] });
                F.cave(g, { box: big, holes: [arch], reveal: 54, wash: 0.92, dado: 360, seed: 'vault-wall', ...L,
                    soot: (x, y) => S.clamp((-y - 260) / 520 + 0.7 * Math.exp(-((x / 300) ** 2)) * S.clamp((-y - 240) / 260)),
                    detail: (q) => {
                        tally(q, -380, 300, 13);
                        tally(q, 320, 286, 7, 0.04);
                    } });
                F.plate(g, { x: -500, y: -250, r: 96, seed: 'pl-granada', motif: 'granada', ...L });
                F.plate(g, { x: -760, y: -40, r: 80, seed: 'pl-bird', motif: 'bird', ...L });
                F.plate(g, { x: 520, y: -300, r: 104, seed: 'pl-flower', motif: 'flower', ...L });
                F.plate(g, { x: 800, y: -90, r: 72, seed: 'pl-bird2', motif: 'bird', ...L });
                F.pan(g, { x: -470, y: 110, r: 82, view: 'back', seed: 'w-pan1', ...L });
                F.pan(g, { x: -1000, y: -260, r: 120, view: 'back', seed: 'w-pan2', sooty: 0.3, ...L });
                F.pan(g, { x: 420, y: 70, r: 66, view: 'inside', seed: 'w-pan3', ...L });
                F.pan(g, { x: 640, y: 250, r: 104, view: 'back', seed: 'w-pan4', ...L });
                F.pan(g, { x: -760, y: 260, r: 96, view: 'inside', seed: 'w-pan5', ...L });
                F.pan(g, { x: 1000, y: 170, r: 130, view: 'back', seed: 'w-pan6', ...L });
                // higher, in the soot: two more plates and a small pan
                F.plate(g, { x: -330, y: -470, r: 64, seed: 'pl-high1', motif: 'flower', ...L });
                F.plate(g, { x: 330, y: -500, r: 70, seed: 'pl-high2', motif: 'granada', ...L });
                F.pan(g, { x: -820, y: -480, r: 74, view: 'inside', seed: 'w-pan7', ...L });
                // the cook's copper on nails between them
                F.utensil(g, { x: -620, y: -120, kind: 'ladle', len: 260, seed: 'ladle', ...L });
                F.utensil(g, { x: -340, y: -190, kind: 'skimmer', len: 250, seed: 'skimmer', ...L });
                F.utensil(g, { x: 900, y: -330, kind: 'chocolatera', s: 1.1, seed: 'choc', ...L });
                F.utensil(g, { x: 360, y: -230, kind: 'ladle', len: 200, s: 0.9, seed: 'ladle2', ...L });
                tooth(g, big);
            },
        },
        // ===================================================== B · the forge
        {
            // the bellows, the tongs leaning, smoke and sparks going over
            id: 'forge-hearth-near', z: z0 + Z.hearthNear, box: big, res: 0.85, brush: false,
            paint(g) {
                const L = lights(Z.hearthNear, { fireLift: 300, r0: 650 });
                F.bellows(g, { x: -760, y: 330, s: 1.2, seed: 'bellows', ...L });
                F.tongs(g, { x: 700, y: -180, rot: -0.12, len: 760, seed: 'near-tongs', ...L });
                F.tongs(g, { x: 770, y: -120, rot: -0.2, len: 700, seed: 'near-tongs2', open: 0.1, ...L });
                F.smoke(g, { x: -200, y: -300, h: 500, w: 1600, n: 24, glow: 0.9, alpha: 0.26, seed: 'near-smoke' });
                F.sparks(g, { x: -300, y: -200, n: 50, h: 520, w: 900, seed: 'near-sparks' });
                tooth(g, big);
            },
        },
        {
            // the hearth and its fire on the left of the way, the anvil on the right
            id: 'forge-hearth', z: z0 + Z.hearth, box: big, brush: false,
            paint(g) {
                const L = lights(Z.hearth, { fireLift: 60, r0: 600, extra: [{ dir: [0.1, -0.2, 1], c: [0.05, 0.035, 0.03] }] });
                // the floor: beaten earth with scale and ash, in front of both
                const floor = [[-1200, 420], [1200, 400], [1200, 720], [-1200, 720]];
                F.cave(g, { box: { x: -1200, y: 300, w: 2400, h: 420 }, holes: [], wash: 0.0, rock: 10, seed: 'forge-floor', ...L,
                    soot: (x, y) => 0.5 });
                g.save();
                g.globalCompositeOperation = 'destination-in';
                g.beginPath();
                S.trace(g, S.curve(floor, true, 4));
                g.rect(-1200, -720, 2400, 1020);
                g.fill();
                g.restore();
                F.hearth(g, { x: -330, y: 140, seed: 'hearth', flame: 300, sparkH: 620, sparkN: 60, ...L });
                F.tongs(g, { x: -300, y: 105, rot: -2.05, len: 470, hot: 0.85, seed: 'fire-tongs', ...L });
                const an = F.anvil(g, { x: 405, y: 290, s: 0.92, seed: 'anvil', ...L });
                F.horseshoe(g, { x: an.hornL[0] + 30, y: an.hornL[1] + 30, s: 0.62, rot: 0.25, hot: 0.95, seed: 'hot-shoe', ...L });
                F.hammer(g, { x: 640, y: 380, rot: -0.35, s: 0.95, seed: 'anvil-hammer', ...L });
                // fallen from the moon's bustle onto the anvil's face
                F.floret(g, { x: 520, y: an.face[1] - 4, size: 22, tilt: 0.45, rot: 0.3, k: 17, ...L });
                tooth(g, big);
            },
        },
        {
            // the forge room's back wall (the body): black with soot round the hood, the
            // doorway out under its lintel, the tools on their rack, tin on a nail
            id: 'forge-hearth-wall', z: z0 + Z.hearthWall, box: big, brush: false,
            paint(g) {
                const L = lights(Z.hearthWall, { r0: 620 });
                F.cave(g, { box: big, holes: [doorway], reveal: 34, wash: 0.9, dado: 400, seed: 'forge-wall', ...L,
                    soot: (x, y) => S.clamp((-y - 60) / 380 + 0.95 * Math.exp(-(((x + 380) / 380) ** 2)) * S.clamp((-y + 120) / 300) + 0.3),
                    detail: (q) => tally(q, 330, 300, 22, 0.02) });
                F.hood(g, { x: -450, y: -150, w: 400, h: 600, seed: 'hood', ...L });
                F.timber(g, [[-300, -258], [310, -250], [314, -186], [-296, -190]], { seed: 'lintel', soot: 0.55, ...L });
                // the rack: a batten with tongs and hammers
                F.timber(g, [[330, -330], [1000, -322], [1000, -296], [330, -302]], { seed: 'rack', soot: 0.3, R: 6, ...L });
                for (let i = 0; i < 4; i++) F.tongs(g, { x: 380 + i * 70, y: -320, rot: 0.04 * (i - 1.5), len: 380 + i * 30, seed: 'rack-tongs' + i, open: 0.03 + i * 0.02, ...L });
                F.hammer(g, { x: 740, y: -250, rot: Math.PI, s: 0.85, seed: 'rack-h1', ...L });
                F.hammer(g, { x: 830, y: -250, rot: Math.PI + 0.06, s: 0.75, seed: 'rack-h2', ...L });
                F.hammer(g, { x: 920, y: -250, rot: Math.PI - 0.04, s: 0.95, seed: 'rack-h3', ...L });
                // new shoes on a wire, an old one, nails
                for (let i = 0; i < 5; i++) F.horseshoe(g, { x: 450 + i * 92, y: 160 + Math.sin(i) * 6, s: 0.5, rot: Math.PI + (i - 2) * 0.05, seed: 'wall-shoe' + i, ...L });
                F.tin(g, { x: 340, y: 40, s: 1.25, seed: 'tin', ...L });
                tooth(g, big);
            },
        },
        // ===================================================== C · the mouth
        {
            // the door open into the cave, and a pillar of the rock with the bridle on its peg
            id: 'forge-door', z: z0 + Z.door, box: big, res: 0.9, brush: false,
            paint(g) {
                const L = lights(Z.door, { moon: 0.4, fire: 0.6, r0: 900 });
                const hole = [[-1300, -470], [660, -480], [690, -300], [720, 800], [-1300, 800]];
                F.cave(g, { box: big, holes: [S.curve(hole, true, 6)], reveal: 70, wash: 0.7, seed: 'door-rock', ...L,
                    soot: (x, y) => S.clamp((-y - 420) / 300 + 0.2) });
                F.door(g, { x: -262, y: 6, h: 560, w: 330, far: 1.22, flip: true, seed: 'door', ...L });
                // the cricket in its cage, hung from the rock above the way out
                F.cage(g, { x: 330, y: -400, s: 1.15, seed: 'cage', ...L });
                F.tongs(g, { x: 800, y: -400, rot: 0.05, len: 520, seed: 'door-tongs', ...L });
                tooth(g, big);
            },
        },
        {
            // the mouth (the body of the stratum): the cave's front wall from inside, warm,
            // its round-headed opening onto the night, a horseshoe over it for luck
            id: 'forge-mouth', z: z0 + Z.mouth, box: big, brush: false,
            paint(g) {
                // the forge's light is far behind now; the moon comes in at the mouth, cold
                const L = lights(Z.mouth, { moon: 0.7, fire: 0.36, r0: 900, extra: [{ x: 0, y: 60, z: 260, c: [0.3, 0.38, 0.62], r0: 380 }] });
                F.cave(g, { box: big, holes: [mouth], reveal: 80, revealDepth: 220, revealRock: true, wash: 0.85, dado: 380, seed: 'mouth', ...L,
                    soot: (x, y) => S.clamp((-y - 300) / 400) * 0.6 });
                F.horseshoe(g, { x: 0, y: -330, s: 0.8, rot: 0, worn: 1, seed: 'luck', ...L });
                F.plate(g, { x: -520, y: -180, r: 74, seed: 'pl-mouth', motif: 'granada', ...L });
                // the bridle by the door, waiting; a pan and a ladle by it; tin for the fair
                F.bridle(g, { x: 440, y: -250, s: 0.95, seed: 'bridle', ...L });
                F.pan(g, { x: -440, y: 120, r: 70, view: 'back', seed: 'm-pan', ...L });
                F.utensil(g, { x: -660, y: -40, kind: 'skimmer', len: 200, s: 0.9, seed: 'm-skim', ...L });
                F.tin(g, { x: 330, y: 200, s: 1.1, n: 4, seed: 'm-tin', ...L });
                F.horseshoe(g, { x: 640, y: 40, s: 0.55, rot: Math.PI, worn: 1, seed: 'm-shoe', ...L });
                F.plate(g, { x: -330, y: -390, r: 60, seed: 'pl-mouth2', motif: 'bird', ...L });
                F.pan(g, { x: 640, y: -420, r: 66, view: 'back', seed: 'm-pan2', ...L });
                tooth(g, big);
            },
        },
        // ===================================================== D · the olive grove
        {
            // two old olives framing the way, a prickly pear and an agave at their feet, the
            // owl on a limb, the ground ploughed, their shadows coming towards us
            id: 'forge-grove-near', z: z0 + Z.grove, box: big, brush: false,
            paint(g) {
                // the moon from behind (silver rims), the forge's light from the mouth behind us
                // (bronze faces: «bronce y sueño»), the sky's own glow
                const L = lights(Z.grove, { moon: 2.4, fire: 0.13, r0: 1e9, amb: [0.035, 0.045, 0.1] });
                const skyL = { dir: [0, -1, 0.5], c: [0.1, 0.12, 0.22] };
                L.lights = [skyL];
                // the ground: furrows and clods towards the trees
                F.cave(g, { box: { x: -1200, y: 220, w: 2400, h: 500 }, holes: [], earth: true, rock: 14, seed: 'grove-ground', ...L,
                    soot: () => 0.25 });
                g.save();
                g.globalCompositeOperation = 'destination-in';
                g.beginPath();
                S.trace(g, S.curve([[-1200, 330], [-600, 300], [0, 290], [600, 296], [1200, 320], [1200, 720], [-1200, 720]], true, 6));
                g.rect(-1200, -720, 2400, 300);
                g.fill();
                g.restore();
                F.furrows(g, { box: { x: -1200, y: 290, w: 2400, h: 430 }, vx: 0, vy: 300, n: 30, seed: 'near-furrows', warm: 0.6 });
                const keep = { cx: 0, cy: -30, rx: 340, ry: 250 };
                F.oliveTree(g, { x: -720, y: 640, h: 1250, lean: 0.2, spread: 0.8, seed: 'olive-L', shadowLen: 160, keep, ...L });
                // the right tree reaches a limb in over the way, under its crown: the owl's perch
                F.oliveTree(g, { x: 740, y: 660, h: 1200, lean: -0.25, spread: 0.8, seed: 'olive-R', shadowLen: 160, keep, ...L,
                    limbs: [{ path: [[-60, -420], [-240, -700], [-420, -860], [-560, -930]], w0: 70, w1: 26 }] });
                F.owl(g, { x: 330, y: -213, s: 1.05, seed: 'zumaya', ...L, fire: { ...L.fire, c: [0.1, 0.06, 0.03] }, lights: [skyL, { dir: [0.2, -0.4, 1], c: [0.14, 0.16, 0.24] }] });
                F.chumbera(g, { x: -930, y: 720, h: 520, seed: 'chumbera', ...L });
                F.agave(g, { x: 980, y: 720, s: 1.1, n: 13, len: 280, seed: 'agave', ...L });
                tooth(g, big);
            },
        },
        {
            // the grove beyond (the body): rows of olives, their crowns closing over, the
            // furrows going away, a will-o'-the-wisp low between the trunks; the moon shows in
            // the gap between the crowns
            id: 'forge-grove', z: z0 + Z.groveFar, box: plate, res: 0.8, brush: false,
            paint(g) {
                const L = lights(Z.groveFar, { moon: 2.2, fire: 0.05, r0: 1e9, amb: [0.035, 0.045, 0.1] });
                L.lights = [{ dir: [0, -1, 0.5], c: [0.1, 0.12, 0.22] }];
                // the far hills, and across the valley the palace on its hill (no sky here: the
                // gaps between the crowns show the real one, and the moon)
                F.hills(g, { y: 120, seed: 'far-hills', palace: { x: 40, s: 0.75 } });
                // the ground of the grove, under the hills: clipped to its own edge
                g.save();
                g.beginPath();
                S.trace(g, S.curve([[-1300, 262], [-700, 222], [-200, 204], [0, 200], [300, 206], [800, 226], [1300, 258], [1300, 780], [-1300, 780]], true, 6));
                g.clip();
                F.cave(g, { box: { x: -1300, y: 190, w: 2600, h: 590 }, holes: [], earth: true, rock: 10, seed: 'grove-far-ground', res: 0.5, ...L });
                g.restore();
                F.furrows(g, { box: { x: -1300, y: 200, w: 2600, h: 580 }, vx: 0, vy: 205, n: 34, seed: 'far-furrows', warm: 0.2 });
                const rows = [[-1150, 260, 700], [-820, 230, 560], [-520, 210, 460], [520, 214, 470], [830, 236, 560], [1150, 262, 700], [-420, 186, 300], [430, 188, 310]];
                const keep = { cx: 0, cy: -20, rx: 300, ry: 230 };
                for (const [x, y, h] of rows) F.oliveTree(g, { x, y, h, seed: 'far-olive' + x, lean: -x / 3000, spread: 1.2, density: 0.7, leaf: 1.1, olives: 0, shadowLen: 60, keep, hollow: false, ...L });
                F.wisp(g, { x: -160, y: 120, r: 20, seed: 'wisp' });
                F.wisp(g, { x: 230, y: 150, r: 9, seed: 'wisp2' });
                // the crowns close over: high foliage across the top, leaving the gap
                const crowns = [];
                for (let i = 0; i < 26; i++) {
                    const a = (i / 26) * Math.PI * 2, rx = 520 + 260 * Math.abs(Math.sin(i * 1.7)), ry = 360 + 90 * Math.cos(i * 2.1);
                    const cx = Math.cos(a) * rx * 1.5, cy = Math.sin(a) * ry * 1.3 - 120;
                    const R0 = 150 + 60 * Math.abs(Math.sin(i * 3.1));
                    if (cy > 120 || Math.hypot(cx / (300 + R0), (cy + 20) / (230 + R0)) < 1) continue;
                    crowns.push([cx, cy, R0]);
                }
                F.foliage(g, crowns, { Ls: F.lightsOf(L, 0, 0, 1, 0), seed: 'far-crowns', density: 1.2, leaf: 1.2, olives: 0.01 });
                tooth(g, plate);
            },
        },
        // ===================================================== the moon and the sky
        {
            // the full moon, the best-painted thing of the picture: the last image of the film
            id: 'forge-moon', z: z0 + Z.moon, box: { x: -1000, y: -820, w: 2000, h: 1640 }, res: 1.0, brush: false, far: [0.3, 0.42],
            paint(g) {
                F.halo(g, { x: 0, y: 0, r: Tableau.forge.R });
                F.moon(g, { x: 0, y: 0, r: Tableau.forge.R });
                // her bustle of tuberoses, round her lower half; the band below her stays calm
                F.bustle(g, { R: Tableau.forge.R, floor: 362, moon: { x: 0, y: -40, z: 420, c: [1.05, 1.12, 1.35], r0: 1e9 }, amb: [0.07, 0.08, 0.14] });
            },
        },
        {
            // the night: deep blue, stars, a few cirrus lit by her; calm under her for the lettering
            id: 'forge-sky', z: z0 + Z.sky, box: { x: -1700, y: -1050, w: 3400, h: 2100 }, res: 0.55, brush: false, far: [0.22, 0.34],
            paint(g) {
                const box = { x: -1700, y: -1050, w: 3400, h: 2100 };
                F.sky(g, { box, mx: 0, my: 0, R: Tableau.forge.R * 1.25, n: 1600, calm: { x: -480, y: 380, w: 960, h: 380 } });
                tooth(g, box);
            },
        },
    ];
};
// depths from z0 (the first stratum's middle sheet)
Tableau.forge.Z = { vaultNear: -150, vault: 0, vaultWall: 150, hearthNear: 470, hearth: 620, hearthWall: 770, door: 1080, mouth: 1230, grove: 1700, groveFar: 1880, moon: 3050, sky: 3450 };
Tableau.forge.R = 300; // the moon's radius in her layer's units
Tableau.forge.depth = Tableau.forge.Z.moon; // z0 → the moon (the film ends on her)
Tableau.forge.hole = 0; // no way out: the last picture

// Round 7 · the forge as ONE stratum of loose things (the second passage, in the format of
// the first): no cave, no wall, no opening. The body is the forge's own matter heaped round
// the way through: hammered copper (pans, basins, cauldrons) lying on one another like
// scales, cut olive branches across them, smoke and a drift of sparks; the fire is a thing
// on the middle sheet, low on the left (the itinerant smith's fire-pan, its coal bed and
// flames), and everything is lit from it: warm rims against blue-black. The side of things
// that faces the way through takes a little of the moon's cold light, from far behind it.
//   far  (z + 150): the heap, and on it a Fajalauza plate, tin rings on a nail, tuberoses,
//                   the scops owl on an olive limb, a will-o'-the-wisp low in the gap's edge
//   mid  (z):       the fire-pan, the bridle with its brasses, the cricket's cage, tongs
//                   and a hammer lying across
//   near (z − 160): the anvil on its stump with the glowing horseshoe (a tuberose floret
//                   fallen on its face, to find) and the bellows, both cut by the frame
Tableau.forge.stratum = (z) => {
    const S = Souvenir, F = Forge;
    const box = { x: -1200, y: -720, w: 2400, h: 1440 };
    // the fire: the fire-pan's flame on the middle sheet, low on the left
    const FIRE = { x: -560, y: 120 };
    const AMB = [0.012, 0.014, 0.04]; // what the fire does not reach: blue-black
    const lightsAt = (dz, o = {}) => ({
        // dz: this sheet's depth from the middle sheet (the fire's)
        fire: { x: FIRE.x, y: FIRE.y, z: -dz + (o.lift ?? 140), c: F.FIRE.map((v) => v * (o.fire ?? 1.25)), r0: o.r0 ?? 900, wrap: 0.1 },
        moon: { x: 0, y: -20, z: -2600, c: F.MOON.map((v) => v * (o.moon ?? 0.45)), r0: 1e9, wrap: 0.2 },
        amb: AMB,
    });
    const gapR = (x, y, pad = 0) => Math.hypot(x / (430 + pad), y / (300 + pad));
    const tooth = (g) => S.tooth(g, box, { amp: 0.05 });
    return [
        {
            // the heap, the stratum's body, and on it the small things
            id: 'forge-s-far', z: z + 150, box, res: 0.85, brush: false,
            paint(g) {
                const L = lightsAt(150);
                const r = Motion.rng('forge-heap2');
                // the dark under the heap: soot and shadow (no chink shows the night), kept out of the gap
                F.softSheet(g, 24, (q) => {
                    for (let i = 0; i < 160; i++) {
                        const x = (r() * 2 - 1) * 1250, y = (r() * 2 - 1) * 760;
                        if (gapR(x, y) < 1.3) continue;
                        q.fillStyle = `rgba(${10 + Math.round(r() * 10)},${8 + Math.round(r() * 6)},${14 + Math.round(r() * 8)},0.98)`;
                        q.beginPath();
                        q.arc(x, y, 90 + r() * 120, 0, Math.PI * 2);
                        q.fill();
                    }
                }, 'source-over');
                // the copper: fewer, larger pieces of every kind, lying on one another
                const KINDS = ['cauldron', 'pan', 'pan', 'inside', 'pan', 'inside', 'edge', 'verd', 'dent', 'pan', 'inside', 'edge'];
                const spots = [];
                for (let i = 0; i < 4000 && spots.length < 44; i++) {
                    const x = (r() * 2 - 1) * 1250, y = (r() * 2 - 1) * 760;
                    const size = [100, 140, 185, 240][Math.floor(r() * 4)] * (0.9 + r() * 0.2);
                    const edge = 1.05 + size / 520 + 0.2 * S.noise2(x * 0.004, y * 0.004, 5);
                    if (gapR(x, y) < edge) continue;
                    if (spots.some((q) => Math.hypot(q[0] - x, q[1] - y) < (q[2] + size) * 0.52)) continue;
                    spots.push([x, y, size, KINDS[spots.length % KINDS.length]]);
                }
                // three big cauldrons on the outside of the heap
                spots.push([-980, -470, 300, 'cauldron'], [1010, 520, 320, 'cauldron'], [-1020, 560, 260, 'cauldron']);
                spots.sort((p, q) => gapR(q[0], q[1]) - gapR(p[0], p[1]));
                // each piece baked once per (kind, the fire's direction as it sees it, in eighths
                // of a turn) at a reference size, then pasted turned and scaled
                const res = F.resOf(g), REF = 115, cache = new Map();
                const baked = (kind, bucket, v) => {
                    const key = [kind, bucket, v].join('/');
                    if (!cache.has(key)) {
                        const a = bucket * (Math.PI / 4), fire = { dir: [Math.cos(a), Math.sin(a), 0.22], c: F.FIRE.map((c) => c * 0.95), wrap: 0.05 };
                        const bx = kind === 'cauldron' ? { x: -REF * 1.2, y: -REF * 1.75, w: REF * 2.4, h: REF * 2.6 } : { x: -REF - 30, y: -REF * 1.8, w: REF * 2 + 60, h: REF * 2.9 };
                        cache.set(key, S.sheet(bx, res, (q) => {
                            if (kind === 'cauldron') F.cauldron(q, { x: 0, y: 0, w: REF * 1.9, seed: 'hc' + bucket + v, fire, amb: AMB });
                            else F.pan(q, { x: 0, y: 0, r: REF, rot: 0, view: kind === 'inside' ? 'inside' : 'back', sooty: v ? 0.7 : 0.2, nail: false, seed: 'hp' + kind + bucket + v,
                                verd: kind === 'verd' ? 0.75 : 0, dent: kind === 'dent' ? true : undefined, dentAt: kind === 'dent' ? 0.6 : undefined, fire, amb: AMB });
                        }));
                    }
                    return cache.get(key);
                };
                spots.forEach(([x, y, size, kind], i) => {
                    const cauldron = kind === 'cauldron', edgeOn = kind === 'edge';
                    const rot = cauldron ? (i % 3 - 1) * 0.25 : Math.atan2(y, x) + Math.PI / 2 + ((i * 0.37) % 1 - 0.5) * 1.4;
                    const toFire = Math.atan2(FIRE.y - y, FIRE.x - x) - rot;
                    const bucket = ((Math.round(toFire / (Math.PI / 4)) % 8) + 8) % 8;
                    const sp = baked(edgeOn ? 'pan' : kind, bucket, i % 2), sc = size / REF;
                    // a dark gap of shadow under every piece
                    F.shadow(g, sp, x, y, sc, { rot, dx: 14 * sc, dy: 20 * sc, blur: 16, alpha: 0.9, color: '#030208' });
                    if (edgeOn) S.put(g, sp, { x, y, rot, sx: sc, sy: sc * 0.34 });
                    else S.put(g, sp, { x, y, rot, s: sc });
                });
                // the fire's light falls off across the heap into blue-black
                g.save();
                g.globalCompositeOperation = 'source-atop';
                const fall = g.createRadialGradient(FIRE.x, FIRE.y, 300, FIRE.x, FIRE.y, 1900);
                fall.addColorStop(0, 'rgba(4,3,12,0)');
                fall.addColorStop(0.4, 'rgba(4,3,12,0.25)');
                fall.addColorStop(1, 'rgba(4,3,12,0.72)');
                g.fillStyle = fall;
                g.fillRect(box.x, box.y, box.w, box.h);
                g.restore();
                // cut olive branches lying across the copper, their silver undersides catching the fire
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2 + 0.5 + r() * 0.4;
                    const ex = Math.cos(a) * 560, ey = Math.sin(a) * 400;
                    const fx = Math.cos(a) * 1150, fy = Math.sin(a) * 780;
                    const t = a + (i % 2 ? 0.3 : -0.3);
                    F.branch(g, { path: [[fx, fy], [(fx + ex) / 2 + Math.cos(t) * 70, (fy + ey) / 2 + Math.sin(t) * 70], [ex, ey]], w0: 54, w1: 12, leaves: 4, R: 95, leaf: 1.7, density: 0.8, seed: 'heap-b' + i, warm: 0.85, mass: 0.2, ...L });
                }
                // on the heap: plates, tin rings on a nail, the bridle, tuberoses, the owl on a limb
                F.plate(g, { x: -470, y: -300, r: 120, seed: 's-plate', motif: 'granada', ...L });
                F.plate(g, { x: 520, y: 330, r: 96, seed: 's-plate2', motif: 'bird', ...L });
                F.tin(g, { x: -200, y: -470, s: 1.9, n: 5, seed: 's-tin', ...L });
                F.bridle(g, { x: 640, y: -610, s: 1.05, seed: 's-bridle', ...L });
                for (let k = 0; k < 3; k++) F.tuberose(g, { path: [[-140 + k * 40, 600], [-200 + k * 30, 520], [-260 + k * 22, 440], [-300 + k * 18, 380]], size: 34, n: 6, seed: 's-nardo' + k, ...L, amb: [0.18, 0.16, 0.2] });
                F.branch(g, { path: [[1000, -330], [700, -300], [380, -300]], w0: 60, w1: 22, leaves: 2, R: 80, leaf: 1.6, seed: 's-owl-limb', warm: 0.85, mass: 0.2, ...L });
                F.owl(g, { x: 470, y: -318, s: 1.8, seed: 's-zumaya', ...L, fire: { ...L.fire, c: F.FIRE.map((v) => v * 1.8), z: 260 } });
                F.wisp(g, { x: -880, y: -40, r: 18, seed: 's-wisp' });
                tooth(g);
            },
        },
        {
            // the fire-pan and its flames on the left, the anvil on its stump on the right: the emblem
            id: 'forge-s-mid', z, box, brush: false,
            paint(g) {
                const L = lightsAt(0, { lift: 120 });
                F.hearth(g, { x: FIRE.x, y: FIRE.y + 150, s: 1.3, dish: true, seed: 's-fire', flame: 300, sparkH: 380, sparkN: 50, ...L });
                F.wispSmoke(g, { x: FIRE.x - 30, y: FIRE.y - 260, h: 460, w: 22, lean: -0.25, seed: 'w1' });
                F.wispSmoke(g, { x: FIRE.x + 60, y: FIRE.y - 230, h: 380, w: 16, lean: -0.4, seed: 'w2' });
                F.tongs(g, { x: FIRE.x + 90, y: FIRE.y + 80, rot: -2.0, len: 520, hot: 0.85, seed: 's-tongs', ...L });
                const an = F.anvil(g, { x: 560, y: 140, s: 1.08, seed: 's-anvil', ...L });
                F.horseshoe(g, { x: an.hornL[0] + 32, y: an.hornL[1] + 32, s: 0.7, rot: 0.25, hot: 0.95, seed: 's-hot-shoe', ...L });
                F.hammer(g, { x: 640, y: an.face[1] - 18, rot: -0.85, s: 0.85, seed: 's-hammer', ...L });
                F.floret(g, { x: 510, y: an.face[1] - 4, size: 24, tilt: 0.45, rot: 0.3, k: 17, ...L });
                F.cage(g, { x: -460, y: -470, s: 1.9, seed: 's-cage', ...L });
                tooth(g);
            },
        },
        {
            // what the camera brushes past: the bellows and a big hung cauldron, cut by the frame
            id: 'forge-s-near', z: z - 160, box, res: 0.85, brush: false,
            paint(g) {
                const L = lightsAt(-160, { lift: 300 });
                const c = F.cauldron(g, { x: 820, y: -330, w: 560, seed: 's-near-cauldron', ...L });
                for (let y = c.hook[1] - 15; y > -760; y -= 22) {
                    g.strokeStyle = '#140e10';
                    g.lineWidth = 6;
                    g.beginPath();
                    g.ellipse(c.hook[0], y, Math.abs(y / 22) % 2 < 1 ? 8 : 2.6, 12, 0, 0, 7);
                    g.stroke();
                    g.strokeStyle = 'rgba(255,170,100,0.4)';
                    g.lineWidth = 1.5;
                    g.stroke();
                }
                F.bellows(g, { x: -860, y: 420, s: 1.45, seed: 's-bellows', ...L });
                tooth(g);
            },
        },
    ];
};

// Round 8 · the forge as LOOSE pieces (the last world: the camera at its fastest, and right
// after it the full moon). Every thing its own layer, floating at its own depth in z ± 280,
// composed in rings round the axis (nothing within 260 of it), all of them lit by ONE fire:
// the fire-pan, itself one of the pieces (low left of the axis, at the slab's middle depth),
// is a point light in the stratum's own units, so every piece takes its light from where
// the fire really is (a piece beside it raked, one across the ring faint, one in front of it
// lit from behind: a rim), with a cold breath of the moon from far down the axis on the side
// of each piece that faces the way through, and blue-black where neither reaches.
//
//   heroes (14), going round: the Fajalauza plate (0°), the chocolate pot, the big hung
//   cauldron, a hammer, the bed warmer, the cricket's cage, THE FIRE-PAN, a pair of tongs,
//   the bellows (its nozzle turned to the fire), the scops owl on a cut olive limb, the
//   bridle with its brasses, the tin rings and necklace, the anvil (a tuberose floret fallen
//   on its face, to find), a big tinned pan; to find: a will-o'-the-wisp far out, the
//   cricket in its cage, the moon's crescent on the bridle, a horseshoe nail bent where it
//   was clinched.
//   matter (77): the forge's body broken up: copper (pans of every size and face, a ladle, a
//   skimmer, sheet offcuts, raised blanks, curls off the shears), coals and charcoal alight,
//   sparks, horseshoes (new, worn, hot), pinches of nails, hot bar stock, shards of a
//   Fajalauza plate, tin rings, horse brasses on their straps, tuberose spikes and single
//   florets (white wax, faintly cream: no longer lavender), cut olive sprigs.
Tableau.forge.loose = (z) => {
    const S = Souvenir, F = Forge, DEG = Math.PI / 180;
    const at = (deg, R) => [Math.cos(deg * DEG) * R, Math.sin(deg * DEG) * R];
    // the fire: the fire-pan's flame (its coal bed at FP, the flame's heart above it)
    const FP = at(152, 640), FIRE = { x: FP[0] - 10, y: FP[1] - 110, dz: 20 };
    const AMB = [0.016, 0.018, 0.05];
    const LIFT = 260; // the fire stands a little in front of the slab: the near pieces are raked, not black
    // `white`: for glaze, tin and wax, the fire's light a little paler, as a painter keeps a
    // white thing white in firelight (cream, not copper)
    const PALE = [1.7, 1.52, 1.3];
    const lightsAt = (dz, o = {}) => ({
        fire: { x: FIRE.x, y: FIRE.y, z: dz - FIRE.dz + LIFT, c: F.FIRE.map((v, i) => (v + ((o.white ?? 0) * (PALE[i] - v))) * (o.fire ?? 1.08)), r0: o.r0 ?? 1050, wrap: 0.12 },
        moon: { x: 0, y: 0, z: dz - 2600, c: F.MOON.map((v) => v * (o.moon ?? 0.5)), r0: 1e9, wrap: 0.28 },
        amb: o.amb ?? AMB,
    });
    // turn a drawer that paints upright by `a` about (cx, cy): the lights go the other way
    const turn = (g, cx, cy, a, L, draw) => {
        const c = Math.cos(-a), s = Math.sin(-a);
        const rp = (Lt) => (!Lt ? Lt : Lt.dir ? { ...Lt, dir: [Lt.dir[0] * c - Lt.dir[1] * s, Lt.dir[0] * s + Lt.dir[1] * c, Lt.dir[2]] } : { ...Lt, x: cx + (Lt.x - cx) * c - (Lt.y - cy) * s, y: cy + (Lt.x - cx) * s + (Lt.y - cy) * c });
        g.save();
        g.translate(cx, cy);
        g.rotate(a);
        g.translate(-cx, -cy);
        draw({ ...L, fire: rp(L.fire), moon: rp(L.moon) });
        g.restore();
    };
    const out = [];
    // one layer: its middle (x, y), a generous half-size, depth offset dz
    const piece = (id, dz, x, y, half, draw, o = {}) => out.push({
        id: 'forge-l-' + id, z: z + dz, loose: o.loose ?? true, brush: false, res: o.res,
        box: { x: x - half, y: y - half, w: half * 2, h: half * 2 },
        paint: (g) => draw(g, lightsAt(dz, o.light)),
        _r: Math.hypot(x, y), _x: x, _y: y, _dz: dz, _half: o.size ?? half * 0.7,
    });

    // ================================================================= the heroes
    // going round from the plate (0°): the fire at 152°, the anvil and the bellows on either
    // side of it (a forge's own order), the white things (plate, tin, warmer) across from it
    {
        const [x, y] = at(0, 520);
        piece('plate', 250, x, y, 330, (g, L) => F.plate(g, { x, y, r: 230, seed: 'l-plate', motif: 'granada', hung: false, ...L }), { size: 460, light: { white: 0.5 } });
    }
    {
        const [x, y] = at(22, 900);
        piece('cazo', -270, x, y, 600, (g, L) => F.pan(g, { x, y: y + 80, r: 262, rot: 2.2, view: 'inside', seed: 'l-cazo', nail: false, lift: 0, ...L }), { size: 560 });
    }
    {
        const [x, y] = at(50, 760);
        piece('cauldron', 160, x, y, 580, (g, L) => F.cauldron(g, { x, y: y + 90, w: 520, seed: 'l-cauldron', ...L }), { size: 560 });
    }
    {
        const [x, y] = at(78, 540);
        piece('hammer', 50, x, y, 440, (g, L) => F.hammer(g, { x: x + 90, y: y - 180, rot: -0.55, s: 1.95, seed: 'l-hammer', ...L }), { size: 480 });
    }
    {
        const [x, y] = at(104, 900);
        piece('chocolatera', -150, x, y, 500, (g, L) => turn(g, x, y, 0.4, L, (Lr) => F.utensil(g, { x: x + 60, y: y - 205, kind: 'chocolatera', s: 2.5, hung: false, seed: 'l-choc', ...Lr })), { size: 500 });
    }
    {
        // the bellows, lying as it would on the floor by the fire, its nozzle towards it
        const [x, y] = at(124, 760);
        piece('bellows', -60, x, y, 760, (g, L) => turn(g, x, y, -0.3, L, (Lr) => F.bellows(g, { x: x - 150, y, s: 1.3, seed: 'l-bellows', ...Lr })), { size: 660, res: 0.9 });
    }
    // the fire-pan: coals, flame, sparks; the light of the whole stratum
    piece('fire', FIRE.dz, FP[0], FP[1] - 120, 800, (g, L) => {
        F.hearth(g, { x: FP[0], y: FP[1], s: 1.45, dish: true, seed: 'l-fire', flame: 420, sparkH: 520, sparkN: 80, ...L, fire: { ...L.fire, z: 160 } });
        F.wispSmoke(g, { x: FP[0] - 30, y: FP[1] - 330, h: 300, w: 16, lean: -0.3, seed: 'l-w1' });
    }, { size: 680 });
    {
        // the anvil beside the fire (a tuberose floret fallen on its face, to find)
        const [x, y] = at(184, 800);
        piece('anvil', -130, x, y, 480, (g, L) => turn(g, x, y, 0.12, L, (Lr) => {
            const an = F.anvil(g, { x, y: y + 30, s: 1.42, stump: false, seed: 'l-anvil', ...Lr });
            F.floret(g, { x: an.face[0] + 175, y: an.face[1] + 2, size: 28, tilt: 0.42, rot: 0.3, k: 17, cream: true, ...Lr, amb: [0.2, 0.18, 0.16] });
        }), { size: 640 });
    }
    {
        const [x, y] = at(212, 560);
        piece('cage', -210, x, y, 520, (g, L) => turn(g, x, y, 0.35, L, (Lr) => F.cage(g, { x, y: y - 200, s: 3.4, seed: 'l-cage', hung: false, ...Lr })), { size: 420 });
    }
    {
        const [x, y] = at(236, 880);
        piece('tongs', 230, x, y, 480, (g, L) => F.tongs(g, { x: x + 30, y: y - 320, rot: -0.35, len: 680, open: 0.035, seed: 'l-tongs', ...L }), { size: 500 });
    }
    {
        const [x, y] = at(260, 660);
        piece('owl', 110, x, y, 540, (g, L) => {
            F.branch(g, { path: [[x - 330, y + 130], [x - 60, y + 96], [x + 180, y + 120], [x + 320, y + 50]], w0: 50, w1: 12, leaves: 5, R: 90, leaf: 1.5, density: 0.9, seed: 'l-owl-limb', warm: 0.85, mass: 0.2, ...L });
            F.owl(g, { x: x - 40, y: y + 92, s: 3.2, seed: 'l-zumaya', ...L, fire: { ...L.fire, c: F.FIRE.map((v) => v * 1.9) } });
        }, { size: 600 });
    }
    {
        const [x, y] = at(286, 780);
        piece('bridle', -240, x, y, 560, (g, L) => turn(g, x, y, 0.25, L, (Lr) => F.bridle(g, { x, y: y - 370, s: 1.6, seed: 'l-bridle', hung: false, ...Lr })), { size: 560 });
    }
    {
        const [x, y] = at(310, 470);
        piece('tin', 190, x, y, 400, (g, L) => F.tin(g, { x: x - 40, y: y - 170, s: 2.6, n: 5, seed: 'l-tin', hung: false, ...L }), { size: 420, light: { white: 0.55, moon: 1.1 } });
    }
    {
        // the bed warmer, turned so its handle runs out from the axis
        const [x, y] = at(336, 860);
        piece('warmer', -20, x, y, 880, (g, L) => turn(g, x, y, Math.atan2(y, x) - Math.PI / 2 + 0.25, L, (Lr) => F.warmer(g, { x, y: y + 150, r: 168, hlen: 420, seed: 'l-warmer', hung: false, ...Lr })), { size: 640, res: 0.85 });
    }
    // to find: the will-o'-the-wisp, far out on the dark side, cold
    {
        const [x, y] = at(205, 1250);
        piece('wisp', 270, x, y, 160, (g) => F.wisp(g, { x, y, r: 20, seed: 'l-wisp' }), { size: 60 });
    }

    // ================================================================= the matter
    const r = Motion.rng('forge-loose-matter');
    // kinds and how many (80): copper 23, coals 13, sparks 6, horseshoes 5, nails 3, tin 4,
    // tuberoses 10, olive 6, hot bars 2, shards 5, brasses 3
    const KINDS = [
        ...Array(6).fill('pan'), 'ladle', 'ladle', 'skimmer', 'skimmer', 'pot', 'pot', 'choc', ...Array(5).fill('sheet'), 'blank', 'blank', 'strip', 'strip', 'strip',
        ...Array(9).fill('coal'), ...Array(4).fill('charcoal'),
        ...Array(6).fill('sparks'),
        ...Array(5).fill('shoe'),
        ...Array(3).fill('nails'),
        ...Array(4).fill('rings'),
        ...Array(6).fill('nardo'), ...Array(4).fill('floret'),
        ...Array(6).fill('olive'),
        ...Array(2).fill('bar'),
        ...Array(5).fill('shard'),
        ...Array(3).fill('brass'),
    ];
    // sizes in units across
    const SIZE = { pot: [190, 240], choc: [200, 240], pan: [180, 250], ladle: [200, 250], skimmer: [200, 250], sheet: [160, 220], blank: [140, 200], strip: [130, 190], coal: [100, 190], charcoal: [110, 190], sparks: [170, 260], shoe: [140, 190], nails: [90, 130], rings: [160, 220], nardo: [230, 300], floret: [80, 130], olive: [220, 300], bar: [240, 320], shard: [150, 220], brass: [120, 180] };
    // order the kinds so no two of a kind come in a row (the scatter then mixes them)
    const order = KINDS.map((k, i) => [k, (i * 0.618034) % 1]).sort((a, b) => a[1] - b[1]).map((p) => p[0]);
    // small things that may come in close to the way through
    const INNER = new Set(['floret', 'nails', 'coal', 'brass', 'shoe', 'blank', 'charcoal']);
    const heroes = out.slice();
    const placed = heroes.map((h) => ({ x: h._x, y: h._y, dz: h._dz, s: h._half }));
    const fd = (x, y) => Math.hypot(x - FIRE.x, y - FIRE.y);
    let n = 0;
    for (const kind of order) {
        const [s0, s1] = SIZE[kind], size = s0 + (s1 - s0) * r();
        // best of 40 candidates: the one farthest from everything already placed (blue noise on
        // the frame, so the pieces fill it evenly), denser near the inside; sparks and coals
        // keep near the fire. The depth goes round the slab in golden steps.
        let x = 0, y = 0, best = -Infinity;
        const dz = -272 + 544 * ((n * 0.618034 + 0.31) % 1);
        for (let tries = 0; tries < 40; tries++) {
            const inner = INNER.has(kind) && n % 2 === 0, R = inner ? 275 + size * 0.5 + 120 * r() : 270 + size * 0.5 + 600 * Math.pow(r(), 1.5), a = r() * Math.PI * 2;
            const cx = Math.cos(a) * R, cy = Math.sin(a) * R;
            let score = Infinity;
            for (const p of placed) {
                // apart on the frame, and a little more for things at nearly the same depth
                const gap = Math.hypot(p.x - cx, p.y - cy) - (p.s + size) * 0.5 * (Math.abs(p.dz - dz) < 90 ? 1 : 0.6);
                if (gap < score) score = gap;
            }
            if ((kind === 'sparks' || kind === 'coal') && fd(cx, cy) > 850) score -= 400;
            if (score > best) {
                best = score;
                x = cx;
                y = cy;
            }
        }
        placed.push({ x, y, dz, s: size });
        const id = kind + n++, seed = 'lm-' + id, rot = r() * Math.PI * 2, rr = r(), heat = S.clamp(1.1 - fd(x, y) / 800) * (0.6 + 0.4 * rr);
        const half = size * 0.95 + 40;
        if (kind === 'pan') {
            const view = n % 7 === 0 ? 'back' : 'inside', rad = size * (n % 7 === 0 ? 0.32 : 0.4);
            piece(id, dz, x, y, size + 60, (g, L) => F.pan(g, { x, y: y + rad * 0.4, r: rad, rot, view, seed, nail: false, lift: 0, sooty: 0.2 + rr * 0.7, verd: n % 5 === 2 ? 0.7 : 0, dent: n % 4 === 1 ? true : undefined, ...L }), { size });
        } else if (kind === 'pot') {
            // a small cauldron off its hook, on its side as it floats
            piece(id, dz, x, y, size + 80, (g, L) => turn(g, x, y, rot, L, (Lr) => F.cauldron(g, { x, y: y + size * 0.12, w: size * 0.8, seed, ...Lr })), { size });
        } else if (kind === 'choc') {
            piece(id, dz, x, y, size + 80, (g, L) => turn(g, x, y, rot, L, (Lr) => F.utensil(g, { x: x + size * 0.1, y: y - size * 0.35, kind: 'chocolatera', s: size / 200, hung: false, seed, ...Lr })), { size });
        } else if (kind === 'ladle' || kind === 'skimmer') {
            piece(id, dz, x, y, size + 60, (g, L) => turn(g, x, y, rot, L, (Lr) => F.utensil(g, { x, y: y - size * 0.55, kind, len: size * 0.55, s: 0.9, hung: false, seed, ...Lr })), { size });
        } else if (kind === 'sheet' || kind === 'blank' || kind === 'strip') {
            piece(id, dz, x, y, half, (g, L) => F.offcut(g, { x, y, size, rot, kind, seed, ...L }), { size });
        } else if (kind === 'coal' || kind === 'charcoal') {
            piece(id, dz, x, y, half, (g, L) => F.coal(g, { x, y, r: size * 0.5, rot, kind, seed, heat, ...L }), { size });
        } else if (kind === 'sparks') {
            // sparks flying off the fire: their streaks run away from it
            piece(id, dz, x, y, size + 60, (g) => turn(g, x, y, Math.atan2(y - FIRE.y, x - FIRE.x) + Math.PI / 2, {}, () => F.sparks(g, { x, y: y + size * 0.4, n: 10 + Math.round(rr * 16), h: size * 0.8, w: size * 0.6, seed })), { size: size * 0.6 });
        } else if (kind === 'shoe') {
            const hot = n % 3 === 0 ? 0.9 : 0, worn = n % 3 === 1 ? 1 : 0;
            piece(id, dz, x, y, half, (g, L) => F.horseshoe(g, { x, y, s: size / 150, rot, hot, worn, seed, ...L }), { size });
        } else if (kind === 'nails') {
            piece(id, dz, x, y, half, (g, L) => F.hsnails(g, { x, y, len: size * 0.8, n: 2 + (n % 3), seed, ...L }), { size });
        } else if (kind === 'rings') {
            piece(id, dz, x, y, size + 60, (g, L) => turn(g, x, y, rot, L, (Lr) => F.tin(g, { x, y: y - size * 0.45, s: size / 220, n: 1 + (n % 3), seed, hung: false, ...Lr })), { size, light: { white: 0.55, moon: 1.1 } });
        } else if (kind === 'nardo') {
            const len = size, a = rot, bend = (rr - 0.5) * 1.2;
            const path = [0, 0.33, 0.66, 1].map((u) => [x + Math.cos(a + bend * u) * (u - 0.5) * len, y + Math.sin(a + bend * u) * (u - 0.5) * len]);
            piece(id, dz, x, y, size + 70, (g, L) => F.tuberose(g, { path, size: 22 + rr * 8, n: 4 + (n % 4), seed, cream: true, ...L, amb: [0.2, 0.18, 0.15] }), { size, light: { white: 0.4 } });
        } else if (kind === 'floret') {
            piece(id, dz, x, y, half, (g, L) => F.floret(g, { x, y, size: size * 0.55, tilt: 0.45 + rr * 0.5, rot, k: 100 + n * 7, open: rr < 0.25 ? 0.6 : 1, cream: true, ...L, amb: [0.2, 0.18, 0.15] }), { size, light: { white: 0.4 } });
        } else if (kind === 'olive') {
            const len = size, a = rot;
            const path = [[x - Math.cos(a) * len * 0.5, y - Math.sin(a) * len * 0.5], [x + Math.cos(a + 0.3) * len * 0.05, y + Math.sin(a + 0.3) * len * 0.05], [x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5]];
            piece(id, dz, x, y, size + 60, (g, L) => F.branch(g, { path, w0: 12, w1: 4, leaves: 3 + (n % 2), R: 56, leaf: 1.15, density: 0.8, seed, warm: 0.85, mass: 0.15, ...L }), { size });
        } else if (kind === 'bar') {
            piece(id, dz, x, y, size * 0.75 + 50, (g, L) => F.bar(g, { x, y, len: size, w: 13 + rr * 6, rot, hot: 0.5 + 0.5 * heat, scroll: n % 2 === 0, seed, ...L }), { size });
        } else if (kind === 'shard') {
            // a shard of a Fajalauza plate: a wedge of the rim, broken across the well
            const pr = size * 1.1, a0 = rot, span = 0.7 + rr * 0.6;
            const pts = [[x + Math.cos(a0 + span * 0.5) * pr * 0.18, y + Math.sin(a0 + span * 0.5) * pr * 0.18]];
            for (let i = 0; i <= 10; i++) pts.push([x + Math.cos(a0 + (i / 10) * span) * pr * 1.05, y + Math.sin(a0 + (i / 10) * span) * pr * 1.05]);
            pts.push([x + Math.cos(a0 + span * 0.8) * pr * 0.45, y + Math.sin(a0 + span * 0.8) * pr * 0.45]);
            // the breaks: jagged
            const breaks = [];
            const jag = (p, q, k) => {
                const o2 = [p];
                for (let i = 1; i < 6; i++) {
                    const u = i / 6, h = S.noise2(u * 3, k, S.seedOf(seed)) * 7;
                    o2.push([p[0] + (q[0] - p[0]) * u - (q[1] - p[1]) / Math.hypot(q[0] - p[0], q[1] - p[1]) * h, p[1] + (q[1] - p[1]) * u + (q[0] - p[0]) / Math.hypot(q[0] - p[0], q[1] - p[1]) * h]);
                }
                o2.push(q);
                return o2;
            };
            const rim = pts.slice(1, 12), inner = [pts[12], pts[0]];
            const b1 = jag(rim[rim.length - 1], inner[0], 1), b2 = jag(inner[0], inner[1], 2), b3 = jag(inner[1], rim[0], 3);
            breaks.push(b1, b2, b3);
            const poly = [...rim, ...b1.slice(1), ...b2.slice(1), ...b3.slice(1, -1)];
            // the plate it came from: its middle where the wedge's apex points
            const cx = x, cy = y;
            piece(id, dz, x, y, pr * 1.3 + 40, (g, L) => {
                g.save();
                g.beginPath();
                S.trace(g, poly);
                g.clip();
                F.plate(g, { x: cx, y: cy, r: pr, seed, motif: ['granada', 'bird', 'flower'][n % 3], hung: false, ...L });
                g.restore();
                // the break: the red body showing its thickness, lit on the fire's side
                g.lineJoin = 'round';
                for (const b of breaks) {
                    g.strokeStyle = 'rgba(150,72,44,0.95)';
                    g.lineWidth = 3.2;
                    g.beginPath();
                    S.trace(g, b, false);
                    g.stroke();
                    g.strokeStyle = 'rgba(214,140,96,0.55)';
                    g.lineWidth = 1;
                    g.stroke();
                }
            }, { size, light: { white: 0.5 } });
        } else if (kind === 'brass') {
            // a horse brass on its leather tab
            const a = rot, len = size * 0.9, br = size * 0.24;
            const p0 = [x - Math.cos(a) * len * 0.5, y - Math.sin(a) * len * 0.5], p1 = [x + Math.cos(a) * len * 0.2, y + Math.sin(a) * len * 0.2];
            piece(id, dz, x, y, half, (g, L) => {
                const Ls = F.lightsOf(L, 0, 0, 1, 0);
                F.strap(g, S.curve([p0, [(p0[0] + p1[0]) / 2 + 6, (p0[1] + p1[1]) / 2], p1], false, 8), br * 0.9, { Ls, amb: L.amb, seed: seed + 's', studs: br * 1.3 });
                F.brass(g, { x: x + Math.cos(a) * len * 0.35, y: y + Math.sin(a) * len * 0.35, r: br, kind: ['crescent', 'sun', 'sun'][n % 3], Ls, amb: L.amb, seed });
            }, { size });
        }
    }
    return out;
};
