// Figure lab (round 12): every kind at a large size, standing, walking and reading a sheet.
Motion.scene({ fps: 24, duration: 1, logical: [1600, 900], uses: ['styles/sumi-e/sumi.js', 'sandbox/2026-11-04-red-thread/cast.js'],
    draw(g, t, env) {
        Sumi.paper(g, env, { x: 0, y: 0, w: 1600, h: 900 });
        const H = 560, y = 820;
        const P = (x, kind, face, o = {}) => Cast.figure(g, { x, y, h: o.h ?? H, face, kind, id: kind + x, t: 0.3, ...o });
        P(140, 'man', 1);
        const sh = [350 + 0.02 * H, y - H * 0.73];
        P(350, 'man', 1, { look: -0.55, lean: 0.08, hands: [[sh[0] + 0.13 * H, sh[1] + 0.17 * H], [sh[0] + 0.09 * H, sh[1] + 0.19 * H]], phone: 1, phoneAt: [sh[0] + 0.11 * H, sh[1] + 0.15 * H], phoneRot: -0.4 });
        P(600, 'man', -1, { feet: [[600 - 70, y], [600 + 55, y - 12]] });
        P(830, 'woman', 1);
        P(1040, 'woman', -1, { feet: [[1040 - 50, y], [1040 + 40, y - 8]] });
        P(1250, 'elder', 1, { lean: 0.28, cane: true, look: 0.2 });
        P(1450, 'elderm', -1, { lean: 0.28, cane: true, look: 0.2 });
    },
    post(ctx, t, env) { Sumi.grain(ctx, env, { amount: 0.5 }); } });
