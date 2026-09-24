// Pixel art template: a tiny street at 192 pixels across, 10 frames a second. A girl walks
// in and stops, a heart pops over her head; a cat on the roof wags its tail.
Motion.scene({
    fps: 10,
    duration: 3.6,
    logical: [1600, 900],
    uses: ['styles/pixel-art/pixel.js'],
    shots: [[0, 3.6, 'Template']],

    setup(env) {
        const pal = Pixel.palette({
            K: '#2b2b3a', S: '#f2c7a0', H: '#5a3825', R: '#e0525b', B: '#3d5aa8', W: '#fefefc',
            C: '#e98c67', c: '#c46f4f', G: '#cdc7be', g: '#8a8881', Y: '#f5c619', D: '#6e3121', T: '#ee7404', t: '#aa5827',
            P: '#e87f88', L: '#dcdfe4',
        });
        const S = (rows) => Pixel.sprite(rows, pal);
        const head = ['..HHH..', '.HHHHH.', '.HSSSH.', '.SKSKS.', '.SSSSS.', '..RRR..'];
        return {
            scr: Pixel.fit(env, 192),
            // walk cycle: 4 drawings (contact, pass, contact, pass), one per frame
            walk: [
                S([...head, 'S.RRR.S', '..RRR..', '..BBB..', '.B...B.', '.K...K.']),
                S([...head, '.SRRRS.', '..RRR..', '..BBB..', '..B.B..', '..K.K..']),
                S([...head, 'S.RRR.S', '..RRR..', '..BBB..', '.B...B.', 'K....K.']),
                S([...head, '.SRRRS.', '..RRR..', '..BBB..', '..BB...', '..KK...']),
            ],
            stand: S([...head, '.SRRRS.', '..RRR..', '..BBB..', '..B.B..', '..K.K..']),
            // cat sitting on the roof, the tail in 4 drawings (up, mid, down, mid)
            cat: [
                ['T......K.K', 'T......KKK', 'T......KYK', '.T.KKKKKKK', '..KKKKKKK.', '...K.K.K.K'],
                ['.......K.K', 'T......KKK', 'T......KYK', 'T..KKKKKKK', '.TKKKKKKK.', '...K.K.K.K'],
                ['.......K.K', '.......KKK', '.......KYK', 'T..KKKKKKK', 'TTKKKKKKK.', '...K.K.K.K'],
                ['.......K.K', 'T......KKK', 'T......KYK', 'T..KKKKKKK', '.TKKKKKKK.', '...K.K.K.K'],
            ].map((rows) => S(rows.map((r) => r.replace(/T/g, 'K')))),
            // speech bubble: a pop (small), then the full bubble with its tail
            bubbleSmall: S(['.KKK.', 'KWWWK', 'KWRWK', '.KKK.']),
            bubble: S(['.KKKKKKK.', 'KWWWWWWWK', 'KWRRWRRWK', 'KWRRRRRWK', 'KWWRRRWWK', 'KWWWRWWWK', '.KKKKKKK.', '..KWK....', '..KK.....']),
            cloud: S(['....LLL.....', '..LLLLLLL...', '.LLLLLLLLLL.', 'LLLLLLLLLLLL']),
        };
    },

    draw(g, t, env) {
        const { scr, walk, stand, cat, bubbleSmall, bubble, cloud } = env.state;
        const f = Pixel.frame(t, 10);
        scr.clear('#97b1fd');

        // clouds drift one whole pixel every 3 frames (never sub-pixel)
        scr.blit(cloud, 20 + Math.floor(f / 3), 14);
        scr.blit(cloud, 130 + Math.floor(f / 4), 24);

        // the house: a lit side and a shade side, a cornice with its shadow, brick
        // marks in a darker ramp step, sills under the windows, a door in its frame
        const hx = 96, hy = 44;
        scr.rect(hx, hy, 64, 44, '#e98c67').rect(hx + 58, hy, 6, 44, '#c46f4f');
        for (const [bx, by] of [[4, 4], [20, 26], [50, 6], [8, 34], [44, 30], [28, 4], [52, 38]]) scr.rect(hx + bx, hy + by, 3, 1, '#d97a57');
        scr.rect(hx - 2, hy - 3, 68, 3, '#cdc7be').rect(hx - 2, hy, 68, 1, '#8a8881').rect(hx - 2, hy - 3, 68, 1, '#e0dcd9');
        const lit = Pixel.loop(t, [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1]);
        for (const [wx, on] of [[hx + 8, 1], [hx + 36, lit]]) {
            scr.rect(wx - 1, hy + 7, 16, 14, '#cdc7be').rect(wx - 1, hy + 7, 16, 1, '#e0dcd9');
            scr.rect(wx, hy + 8, 14, 12, on ? '#f5c619' : '#6e3121');
            if (on) scr.rect(wx, hy + 8, 14, 2, '#fbd552').rect(wx + 1, hy + 17, 12, 3, '#e2b04f');
            scr.rect(wx + 6, hy + 8, 2, 12, '#cdc7be');
            scr.rect(wx - 2, hy + 21, 18, 1, '#8a8881');
        }
        scr.rect(hx + 21, hy + 27, 14, 17, '#cdc7be').rect(hx + 22, hy + 28, 12, 16, '#6e3121');
        scr.rect(hx + 23, hy + 29, 10, 15, '#aa5827').rect(hx + 24, hy + 30, 3, 6, '#91481c').rect(hx + 29, hy + 30, 3, 6, '#91481c');
        scr.px(hx + 31, hy + 38, '#f5c619');
        scr.blit(cat[Pixel.loop(t, [0, 0, 1, 1, 2, 2, 3, 3])], hx + 44, hy - 9);

        // the ground is one line, as in the reference look; a street sign in the kit's font
        scr.rect(0, 88, 192, 1, '#6c87d4');
        scr.rect(14, 60, 1, 28, '#2b2b3a');
        const label = 'PIXEL ST';
        scr.rect(6, 52, scr.textWidth(label) + 6, 9, '#145df1').rect(6, 52, scr.textWidth(label) + 6, 1, '#51abd6');
        scr.text(label, 9, 54, '#fefefc');

        // the girl walks in one pixel per frame, then stops
        const stopF = 20, x = Math.min(40 + f, 40 + stopF);
        const girl = f < stopF ? walk[f % 4] : stand;
        scr.blit(girl, x, 77);
        // the heart pops on the frame after she stops: small for one frame, then full
        if (f === stopF + 2) scr.blit(bubbleSmall, x + 6, 70);
        if (f > stopF + 2) scr.blit(bubble, x + 5, 64);

        scr.present(g, env);
    },
});
