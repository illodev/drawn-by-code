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
                const hole = [[-1300, -460], [480, -470], [520, -300], [540, 800], [-1300, 800]];
                F.cave(g, { box: big, holes: [S.curve(hole, true, 6)], reveal: 70, wash: 0.7, seed: 'door-rock', ...L,
                    soot: (x, y) => S.clamp((-y - 420) / 300 + 0.2) });
                F.door(g, { x: -262, y: 6, h: 560, w: 330, far: 1.22, flip: true, seed: 'door', ...L });
                // the cricket in its cage, hung from the rock above the way out
                F.cage(g, { x: 300, y: -380, s: 1.15, seed: 'cage', ...L });
                F.tongs(g, { x: 620, y: -380, rot: 0.05, len: 520, seed: 'door-tongs', ...L });
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
                F.cave(g, { box: big, holes: [mouth], reveal: 80, revealDepth: 220, wash: 0.85, dado: 380, seed: 'mouth', ...L,
                    soot: (x, y) => S.clamp((-y - 300) / 400) * 0.6 });
                F.horseshoe(g, { x: 0, y: -330, s: 0.8, rot: 0, worn: 1, seed: 'luck', ...L });
                F.plate(g, { x: -520, y: -180, r: 74, seed: 'pl-mouth', motif: 'granada', ...L });
                // the bridle by the door, waiting
                F.bridle(g, { x: 440, y: -250, s: 0.95, seed: 'bridle', ...L });
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
                F.owl(g, { x: 330, y: -213, s: 1.05, seed: 'zumaya', ...L, lights: [skyL, { x: 0, y: 0, z: 1200, c: [0.2, 0.11, 0.05], r0: 1e9 }] });
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
                const k = 1000 / (Z.sky - Z.moon + 1000); // the moon's units in the sky's, at the end
                F.sky(g, { box, mx: 0, my: 0, R: Tableau.forge.R * 1.25, n: 1600, calm: { x: -480, y: 380, w: 960, h: 380 } });
                tooth(g, box);
            },
        },
    ];
};
// depths from z0 (the first stratum's middle sheet)
Tableau.forge.Z = { vaultNear: -150, vault: 0, vaultWall: 150, hearthNear: 470, hearth: 620, hearthWall: 770, door: 1080, mouth: 1230, grove: 1700, groveFar: 1880, moon: 2900, sky: 3300 };
Tableau.forge.R = 300; // the moon's radius in her layer's units
Tableau.forge.depth = Tableau.forge.Z.moon; // z0 → the moon (the film ends on her)
Tableau.forge.hole = 0; // no way out: the last picture
