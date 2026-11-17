// The old woman: shot 3, The oil lamp (12–15 s), at her window from outside, and shot 11,
// The last oil lamp (51–57 s), in her room under the new bulb. Oil and match light are
// paper white; the bulb is the only ochre.
(() => {
    const C = Corriente, W = C.W, R = C.R, { lerp, poly, fillPoly } = C;

    // her pose seated at a table, in profile facing right (units: the room's scale)
    const SIT = { head: [520, 330], neck: [514, 352], shoulderL: [500, 366], shoulderR: [528, 368], hipL: [492, 470], hipR: [524, 472], elbowL: [520, 420], elbowR: [552, 418], handL: [566, 452], handR: [588, 448], kneeL: [570, 486], kneeR: [574, 490], footL: [566, 560], footR: [580, 562] };
    const UP = { ...SIT, head: [516, 326], neck: [512, 350] };
    const LEAN = { ...SIT, head: [560, 372], neck: [548, 384], shoulderL: [520, 386], shoulderR: [548, 392], elbowL: [548, 440], elbowR: [574, 440], handL: [584, 462], handR: [604, 458] };

    function oldWoman(b, P, o = {}) {
        b.ink((g) => C.figure(g, P, { limb: 16, scale: 1.4, kerchief: true, face: 1, skirt: 10, tilt: o.tilt ?? 0 }));
        b.cut((g) => C.figureCuts(g, P, { limb: 16, scale: 1.4, seed: 'ow', side: o.side ?? 1, folds: 4, w: 1.5 }));
    }

    // --- shot 3: her window at night; a match, then the oil lamp -------------------------
    C.shots.oilLamp = (blk, t, d) => {
        blk.begin();
        blk.base('ow-window', (b) => {
            C.night(b);
            // the wall around the window: rubble stone, moonlit a little on the left
            b.hatch({ box: [0, 0, 1280, 720], dir: (x, y) => 0.06 * Math.sin(x / 50 + y / 30), sp: 5, len: [8, 30], gap: [6, 20], run: [1, 2], wMin: 1.1, wMax: 4, fit: 8, seed: 'owwall', tone: (x, y) => 0.2 * (1 - x / 1700) * (0.25 + 1.5 * W.noise2('owst', x / 40, y / 26) ** 2) });
            // the opening (the room behind is dark), its lintel and sill cut
            b.ink((g) => g.fillRect(380, 150, 520, 450));
            b.cut((g) => { const r = R('owwin'); W.groove(g, [[372, 146], [908, 146]], 3.4, r); W.groove(g, [[366, 606], [914, 606]], 4.4, r); W.groove(g, [[378, 150], [378, 600]], 2, r); });
        });
        // she is there in the dark, unseen until the match flares
        const strike = 9, light = 21;
        const sx = 380 + 40 + 120, sy = 120;
        if (d >= strike) {
            // the light inside: the room behind her carved out from the flame (the match, then the lamp)
            const fx = d >= light ? 724 : 640, fy = d >= light ? 490 : 420, rad = d >= light ? 1 : (d - strike < 2 ? 0.9 : 0.6);
            blk.hatch({ box: [380, 150, 900, 600], clip: (g) => g.rect(380, 150, 520, 450), dir: (x, y) => Math.atan2(y - fy, x - fx), sp: 3.2, len: [8, 26], gap: [5, 14], wMin: 1, wMax: 3, fit: 6, seed: 'ow-in' + (d >= light ? 'l' : 'm'), tone: (x, y) => rad * 0.5 * Math.exp(-(((x - fx) ** 2 + (y - fy) ** 2) / 60000)) });
            const P = C.movePose(SIT, sx - 420, sy - 120 + 60, 1);
            oldWoman(blk, P, { side: -1 });
            // the match travels from her hand to the lamp's wick
            const k = d - strike, f = C.clamp(k / (light - strike)), mx = lerp(P.handR[0] + 6, 724, f), my = lerp(P.handR[1] - 14, 488, f);
            if (d < light + 3) {
                C.flame(blk, mx, my, k < 2 ? 22 : 12, d, { halo: k < 2 ? 3.4 : 2.2 });
                blk.cut((g) => W.groove(g, [[mx, my], [mx - 14, my + 10]], 1.6, R('match')));
            }
        }
        // the lamp: a glass chimney on a base, on the sill; its flame from the wick on
        blk.ink((g) => { g.beginPath(); g.ellipse(724, 560, 34, 9, 0, 0, 7); g.fill(); g.fillRect(708, 520, 32, 40); g.beginPath(); g.ellipse(724, 520, 20, 8, 0, 0, 7); g.fill(); });
        blk.cut((g) => { const r = R('lampglass'); W.groove(g, [[704, 518], [698, 470], [706, 440]], 1.4, r); W.groove(g, [[744, 518], [750, 470], [742, 440]], 1.4, r); W.groove(g, [[690, 560], [758, 560]], 1.6, r); });
        if (d >= light) {
            C.flame(blk, 724, 500, 30, d, { halo: 3.2 });
            blk.cut((g) => { const r = R('ow-glow'); W.hatch(g, { box: [560, 300, 900, 600], dir: (x, y) => Math.atan2(y - 480, x - 724), sp: 3, len: [6, 18], gap: [6, 16], wMin: 0.9, wMax: 2.2, seed: 'owglow', tone: (x, y) => 0.32 * Math.exp(-(((x - 724) ** 2 + (y - 480) ** 2) / 9000)) }); void r; });
        }
    };

    // --- shot 11: the last oil lamp (51–57 s) -------------------------------------------
    const BULB = [640, 150];
    C.shots.lastLamp = (blk, t, d) => {
        const on = 9, look = 15, lean = 32, blow = 40;
        blk.begin();
        // closer than the room's own drawing: the whole shot is scaled about her table, so the
        // set is drawn every drawing (a cached base would lose the camera)
        const Z = 1.5, CX = 640, CY = 380;
        for (const g of [blk.key, blk.och]) { g.save(); g.translate(CX, CY); g.scale(Z, Z); g.translate(-CX, -CY); }
        const room = (fn) => fn(blk);
        room((b) => {
            C.night(b);
            // the back wall in plaster: long soft cuts; a shelf with a clock and two jars
            b.hatch({ box: [0, 0, 1280, 560], dir: 0.03, sp: 5, len: [30, 120], gap: [20, 60], wMin: 1, wMax: 3, fit: 10, seed: 'room-wall', tone: 0.07 });
            b.cut((g) => { const r = R('shelf'); W.groove(g, [[820, 300], [1120, 300]], 3, r); g.beginPath(); g.arc(900, 262, 26, 0, 7); g.lineWidth = 2.2; g.stroke(); W.groove(g, [[900, 262], [900, 244]], 1.4, r); W.groove(g, [[900, 262], [914, 268]], 1.4, r); W.groove(g, [[990, 298], [990, 250], [1030, 250], [1030, 298]], 1.6, r); });
            // the table: its top edge and a leg
            b.cut((g) => { const r = R('table'); W.groove(g, [[560, 560], [1000, 560]], 3.4, r); W.groove(g, [[600, 566], [600, 720]], 2.2, r); W.groove(g, [[960, 566], [960, 720]], 2.2, r); });
            // the bulb hangs on its cord from the ceiling
            b.cut((g) => W.groove(g, [[BULB[0], -10], [BULB[0], BULB[1] - 22]], 1.4, R('cord')));
            b.ink((g) => { g.beginPath(); g.ellipse(BULB[0], BULB[1], 12, 16, 0, 0, 7); g.fill(); g.fillRect(BULB[0] - 7, BULB[1] - 28, 14, 14); });
            b.cut((g) => W.groove(g, [[BULB[0] - 12, BULB[1] - 4], [BULB[0] - 8, BULB[1] + 10]], 1.2, R('glass')));
        });
        // the bulb comes on: carved, ochre, its light carved into the whole room
        if (d >= on) {
            const k = d - on, p = C.clamp((k + 1) / 3);
            C.bulb(blk, BULB[0], BULB[1], 10, 13, k, { rays: 5, ring: 2.6 });
            const roomR = (g) => g.rect(-200, -200, 1680, 1120);
            blk.ochre((g) => { g.beginPath(); g.ellipse(BULB[0], BULB[1] + 160, 700 * p, 520 * p, 0, 0, 7); g.fill(); });
            blk.hatch({ box: [100, 0, 1180, 720], clip: roomR, dir: (x, y) => 0.04 * Math.sin(x / 80), sp: 3.4, len: [16, 70], gap: [8, 26], wMin: 1, wMax: 3.4, fit: 8, seed: 'room-lit', tone: (x, y) => p * 0.3 * Math.exp(-(((x - BULB[0]) ** 2) / 260000 + ((y - BULB[1] - 160) ** 2) / 180000)) });
        }
        // the oil lamp on the table, burning until she blows it out
        blk.ink((g) => { g.beginPath(); g.ellipse(760, 552, 34, 9, 0, 0, 7); g.fill(); g.fillRect(744, 512, 32, 40); g.beginPath(); g.ellipse(760, 512, 20, 8, 0, 0, 7); g.fill(); });
        blk.cut((g) => { const r = R('lampglass2'); W.groove(g, [[740, 510], [734, 462], [742, 432]], 1.4, r); W.groove(g, [[780, 510], [786, 462], [778, 432]], 1.4, r); });
        // the ochre block is cut away round the oil flame: its light stays paper white
        blk.ochre((g) => { g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(760, 470, 30, 48, 0, 0, 7); g.fill(); });
        if (d < blow + 2) C.flame(blk, 760, 492, d < blow ? 30 : 30 - (d - blow) * 10, d, { halo: d < on ? 3 : 0, lean: d >= blow ? -14 : 0 });
        else if (d < blow + 26) blk.cut((g) => { const r = R('smoke'), k = d - blow - 2; for (let i = 0; i < 5; i++) { const yy = 480 - k * 4 - i * 14, xx = 760 + Math.sin((k + i * 3) * 0.4) * (4 + i * 2); W.gouge(g, xx - 3, yy, xx + 5, yy - 10, 1.1, r, { bend: 0.4 }); } });
        // her: seated, looks up at the bulb, then leans and blows the flame out
        let P = SIT;
        if (d >= look && d < lean) P = C.mixPose(SIT, UP, C.clamp((d - look) / 2));
        else if (d >= lean) P = C.mixPose(UP, LEAN, C.clamp((d - lean) / 6));
        oldWoman(blk, C.movePose(P, 0, 70, 1), { side: 1, tilt: d >= look && d < lean ? -0.25 : 0 });
        for (const g of [blk.key, blk.och]) g.restore();
    };
})();
