// The title and shot 13, The print (66–75 s). «CORRIENTE» is carved at the foot of the lit
// valley, one letter every three drawings; then the sheet is peeled off the block: under it
// the inked plank holds the same valley mirrored, the title backwards, the gouge on it.
(() => {
    const C = Corriente, W = C.W, R = C.R, { lerp } = C;
    const WORD = 'CORRIENTE', TX = 830, TY = 118, SIZE = 84;

    // carve the title letter by letter (k drawings since it started); IM Fell, cut out of the
    // black and roughened by the press like every other cut
    C.title = (blk, k) => {
        const n = Math.min(WORD.length, Math.floor(k / 3) + 1);
        blk.cut((g) => {
            g.save();
            g.font = `${SIZE}px IMFell`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
            const full = g.measureText(WORD).width, x0 = TX - full / 2;
            let x = x0;
            for (let i = 0; i < n; i++) {
                const ch = WORD[i], w = g.measureText(ch).width + 14;
                const p = i === n - 1 ? C.clamp(((k % 3) + 1) / 3) : 1;
                g.save(); g.beginPath(); g.rect(x - 4, TY - SIZE, (w + 8) * p, SIZE * 1.3); g.clip();
                g.textAlign = 'left'; g.fillText(ch, x, TY); g.restore();
                x += w;
            }
            // a rule cut under it, the width of the word
            if (n === WORD.length) W.groove(g, [[x0 - 20, TY + 26], [x0 - 20 + (full + 14 * 8 + 40) * C.clamp((k - 27) / 6), TY + 26]], 2.4, R('rule'), { taper: 6 });
            g.restore();
        });
    };

    // the final state of the lit valley as a print and as the inked block (made once)
    let sheet = null, plank = null;
    function make(blk, env) {
        if (sheet) return;
        const mkc = () => { const c = document.createElement('canvas'); c.width = env.px[0]; c.height = env.px[1]; return c; };
        sheet = mkc(); plank = mkc();
        C.shots.valleyLit(blk, 8.99, 107);
        blk.print(sheet.getContext('2d'), { key: 'final-print', seed: 107 });
        blk.printBlock(plank.getContext('2d'), { key: 'final-block' });
    }

    C.shots.print = (blk, t, d, env, g) => {
        make(blk, env);
        const [Wl, Hl] = [env.W, env.H];
        g.save();
        // the bench under the block (dark wood), seen as the camera draws back a little
        const back = Ease.inOut(C.clamp((t - 3) / 5)), s = lerp(1, 0.88, back);
        g.fillStyle = '#2b1d14'; g.fillRect(0, 0, Wl, Hl);
        g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2;
        for (let y = 8; y < Hl; y += 37) { g.beginPath(); g.moveTo(0, y); g.lineTo(Wl, y + 6); g.stroke(); }
        g.translate(Wl / 2, Hl / 2); g.scale(s, s); g.translate(-Wl / 2, -Hl / 2);
        // the block, mirrored (a print reads the other way round), and its shadow on the bench
        g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(10, 14, Wl, Hl);
        g.save(); g.translate(Wl, 0); g.scale(-1, 1); g.drawImage(plank, 0, 0, Wl, Hl); g.restore();
        // the gouge resting on the block once the sheet is off
        const pe = C.clamp((t - 0.75) / 2.25);
        if (pe > 0.6) {
            g.save(); g.translate(880, 560); g.rotate(-0.42);
            g.fillStyle = '#5a3a22'; g.beginPath(); g.ellipse(0, 0, 90, 17, 0, 0, 7); g.fill();
            g.strokeStyle = '#3b2414'; g.lineWidth = 1.5; for (let i = -60; i < 80; i += 18) { g.beginPath(); g.moveTo(i, -12); g.quadraticCurveTo(i + 10, 0, i, 12); g.stroke(); }
            g.fillStyle = '#9a9690'; g.fillRect(-190, -5, 104, 10); g.fillStyle = '#c9c4ba'; g.beginPath(); g.moveTo(-190, -5); g.lineTo(-214, 0); g.lineTo(-190, 5); g.closePath(); g.fill();
            g.restore();
        }
        // the sheet: it lifts from its lower left corner and peels away to the upper right
        if (pe < 1) {
            const e = Ease.inOut(pe), lift = (u, v) => e * 1.6 - (1 - u) * 0.6 - v * 0.4;
            const at = (u, v) => { const l = C.clamp(lift(u, v) * 1.4 + (1 - v) * e * 0.3), x = u * Wl, y = v * Hl; return [x + l * 900 + l * l * 300, y - l * 760 - l * 120]; };
            const q = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
            // its shadow on the block, then the sheet with a curl along its moving edge
            g.save(); g.globalAlpha = 0.35 * (1 - e); g.fillStyle = '#000'; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x + 18, y + 22) : g.moveTo(x + 18, y + 22))); g.closePath(); g.fill(); g.restore();
            Motion.quad(g, sheet, q, 12, null, { bend: (u, v) => { const l = C.clamp(lift(u, v) * 1.4); return [l * 120 * Math.sin(v * 3), -l * 140 * (1 - u)]; } });
        }
        g.restore();
        C.printed = true;
    };
})();
