// pier-pressure · dev: the set alone (Gull Harbor): back, counter, fore. With GUIDES (or
// window.SHOW_GUIDES) it also draws a 1 m grid on the quay out to the lip, outlined reference
// figures 1.4 m and 1.8 m tall (0.5 wide) at the hut's hatch, at Z = 2.6, 5 and 8, on the pier and
// beside each prop, and a stand-in for Dot inside the hut (clipped to the hatch, under the
// counter), to prove every size and layer against the camera.
const GUIDES = false;
Motion.scene({
    fps: 24, duration: 2, logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', 'sandbox/2026-11-14-pier-pressure/cam.js', 'sandbox/2026-11-14-pier-pressure/set.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    shots: [[0, 2, 'Gull Harbor']],
    draw(g, t, env) {
        const A = Harbor.AT, guides = GUIDES || window.SHOW_GUIDES;
        Harbor.back(g, env, t);
        if (guides) {
            // Dot's stand-in: 1.8 m tall, 0.5 wide, where she stands; only what the hatch shows
            const [X, , Z] = A.dot.foot, a = Cam.pt([X - 0.25, 0, Z]), b = Cam.pt([X + 0.25, 1.8, Z]);
            g.save();
            g.beginPath();
            A.dot.hatch.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
            g.closePath();
            g.clip();
            g.fillStyle = 'rgba(0,150,70,0.75)';
            g.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
            g.restore();
        }
        Harbor.counter(g, env);
        Harbor.fore(g, env, t);
        if (!guides) return;
        const line = (a, b, col, w = 1) => {
            const q = Cam.poly([a, b]);
            if (q.length < 2) return;
            g.strokeStyle = col;
            g.lineWidth = w;
            g.beginPath();
            g.moveTo(...q[0]);
            g.lineTo(...q[1]);
            g.stroke();
        };
        // the grid: a line every metre in X and in Z, out to the lip; X = 0 and every fifth Z heavier
        for (let X = -12; X <= 8; X++) line([X, 0, 1.9], [X, 0, A.lip.z(X)], X === 0 ? 'rgba(200,0,60,0.7)' : 'rgba(0,70,200,0.45)', X === 0 ? 1.6 : 1);
        for (let Z = 2; Z <= 19; Z++) {
            const x1 = Math.min(8, A.lip.x(Z));
            if (x1 > -12) line([-12, 0, Z], [x1, 0, Z], Z % 5 === 0 ? 'rgba(200,0,60,0.6)' : 'rgba(0,70,200,0.45)', Z % 5 === 0 ? 1.4 : 1);
        }
        g.font = '13px sans-serif';
        g.fillStyle = 'rgba(0,40,160,0.9)';
        for (let Z = 3; Z <= 11; Z++) g.fillText('Z' + Z, ...Cam.pt([0.03, 0, Z]));
        // the horizon, and the two points the quay's and the pier's lines run to
        line([-400, Cam.EYE, 1000], [400, Cam.EYE, 1000], 'rgba(200,0,60,0.5)');
        // the figures: boxes 0.5 m wide, 1.4 m (a kid) and 1.8 m (an adult) tall, facing the camera
        const fig = ([X, Y, Z], h, col, label) => {
            const a = Cam.pt([X - 0.25, Y, Z]), b = Cam.pt([X + 0.25, Y + h, Z]);
            g.strokeStyle = col;
            g.lineWidth = 2;
            g.strokeRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
            g.fillStyle = col;
            g.fillText(label, a[0] + 2, b[1] - 3);
        };
        for (const [p, label] of A.guides) {
            fig(p, 1.4, 'rgba(230,0,120,0.95)', '1.4 ' + label);
            fig([p[0] + 0.55, p[1], p[2]], 1.8, 'rgba(0,120,60,0.95)', '1.8');
        }
        // the foreground props' boxes, the hatch, the landing spot
        g.strokeStyle = 'rgba(255,120,0,0.9)';
        g.lineWidth = 1.5;
        for (const k of Object.keys(A.fore)) g.strokeRect(...A.fore[k].box);
        g.strokeRect(...A.dot.clip);
        const [kx, ky] = Cam.pt([A.kit[0], 0, A.kit[1]]);
        g.beginPath();
        g.ellipse(kx, ky, 0.3 * Cam.scale(A.kit[1]), 0.3 * Cam.scale(A.kit[1]) * (Cam.EYE / A.kit[1]), 0, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = 'rgba(255,120,0,0.9)';
        g.fillText('kit', kx - 8, ky + 4);
        const [bx, by] = Cam.pt(A.bollard.top);
        g.fillRect(bx - 4, by - 4, 8, 8);
    },
});
