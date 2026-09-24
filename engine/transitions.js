// Transitions between shots or between styles: global Trans. Load it from `uses`.
// They all take the form Trans.x(g, env, u, options), with u ∈ [0, 1] the transition's
// progress (usually Ease.seg(t, start, end)). `a` and `b` are functions (g) => void that
// paint the outgoing and incoming shot in logical coordinates; either may be called
// with another transform applied, so they must paint full-bleed.
// Catalog and when to use each one: .claude/skills/transitions/SKILL.md
const Trans = (() => {
    const E = Ease;
    const diag = (env) => Math.hypot(env.W, env.H);
    // logarithmic zoom: feels equally fast at the start and at the end
    const logLerp = (a, b, u) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * u);

    // Places the shot's point `from` at screen position `to`, scaled ×s.
    function zoomAt(g, s, from, to, rot = 0) {
        g.translate(to[0], to[1]);
        g.rotate(rot);
        g.scale(s, s);
        g.translate(-from[0], -from[1]);
    }

    function circle(g, x, y, r) {
        g.beginPath();
        g.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
    }

    /**
     * ENTER THROUGH A POINT (eye, mouth, keyhole, screen): the camera pushes toward (cx, cy)
     * of `a`, that point travels to the center and `b` opens inside it, arriving spinning and growing.
     * r0: radius of the "hole" in `a` before the zoom. zoom: how far `a` pushes in.
     * edge(g, x, y, r): optional, paints the rim of the hole (the eyelid, the lips).
     */
    // fadeIn: [u0, u1] during which `b` appears inside the hole; before that you see `a`'s
    // own point (the pupil, the spiral) growing, which is what sells the "entering".
    function enter(g, env, u, { a, b, cx, cy, r0 = 40, zoom = 40, spin = 0.8, edge = null, fadeIn = [0.12, 0.45] }) {
        const z = logLerp(1, zoom, E.in(u));
        const pos = E.lerpPt([cx, cy], [env.W / 2, env.H / 2], E.inOut(Math.min(1, u * 1.4)));
        const R = r0 * z;
        if (R < diag(env)) {
            g.save();
            zoomAt(g, z, [cx, cy], pos);
            a(g);
            g.restore();
        }
        g.save();
        circle(g, pos[0], pos[1], R);
        g.clip();
        g.globalAlpha = E.seg(u, fadeIn[0], fadeIn[1]);
        const s = E.lerp(0.35, 1, E.out(u));
        zoomAt(g, s, [env.W / 2, env.H / 2], pos, (1 - E.out(u)) * spin);
        b(g);
        g.restore();
        if (edge && R < diag(env)) edge(g, pos[0], pos[1], R);
    }

    /**
     * IRIS: `b` appears inside a circle that grows from (cx, cy) over `a`, which
     * stays still. It is `enter` without the camera: good for "unfolding" a world from an object.
     */
    function iris(g, env, u, { a, b, cx, cy, edge = null }) {
        a(g);
        const R = E.in(u) * diag(env) * 1.05;
        g.save();
        circle(g, cx, cy, R);
        g.clip();
        b(g);
        g.restore();
        if (edge) edge(g, cx, cy, R);
    }

    /**
     * ENGULF: clouds (spores, smoke, ink, foam) that come out of `origin` and grow until
     * they cover `a`. Inside the clouds `b` is already there. Optional puff(g, x, y, r, i) paints
     * each cloud's rim in `a`'s style, so the change reads as something from `a`.
     */
    function engulf(g, env, u, { a, b, origin, seed = 'engulf', count = 22, spread = 1, puff = null }) {
        a(g);
        const r = Motion.rng(seed);
        const D = diag(env);
        const blobs = [];
        for (let i = 0; i < count; i++) {
            const delay = r() * 0.45, ang = r() * Math.PI * 2, dist = (0.15 + r() * 0.6) * D * 0.5 * spread;
            const p = E.out(E.seg(u, delay, delay + 0.55));
            if (p <= 0) continue;
            const x = origin[0] + Math.cos(ang) * dist * p, y = origin[1] + Math.sin(ang) * dist * p;
            blobs.push([x, y, (0.08 + r() * 0.1) * D * p + E.in(u) * D * 0.6, i]);
        }
        // the rims go BEFORE `b`: `b` covers the part of each rim that falls inside
        // another cloud and only the outer outline remains (otherwise you get a tangle of rings)
        if (puff) for (const [x, y, R, i] of blobs) puff(g, x, y, R, i);
        g.save();
        g.beginPath();
        for (const [x, y, R] of blobs) {
            g.moveTo(x + R, y);
            g.arc(x, y, R, 0, Math.PI * 2);
        }
        g.clip();
        b(g);
        g.restore();
    }

    /**
     * VORTEX: `a` twists in a spiral around (cx, cy) and shrinks to a point.
     * Behind it is `b` (often just a dark background from which the next thing is born).
     * Painted in rings: each ring turns more the closer it is to the center.
     */
    function vortex(g, env, u, { a, b = null, cx, cy, turns = 2.5, rings = 48 }) {
        if (b) b(g);
        const src = Motion.layer(env, 'trans:vortex', a);
        const R = diag(env);
        const shrink = 1 - E.in(u);
        if (shrink <= 0.002) return;
        for (let i = 0; i < rings; i++) {
            const r0 = (R * i) / rings, r1 = (R * (i + 1)) / rings + 1.5;
            const near = 1 - (r0 + r1) / 2 / R;
            const ang = turns * Math.PI * 2 * E.in(u) * Math.pow(near, 1.5);
            g.save();
            g.translate(cx, cy);
            g.scale(shrink, shrink);
            g.rotate(ang);
            g.beginPath();
            g.arc(0, 0, r1, 0, Math.PI * 2);
            g.arc(0, 0, r0, 0, Math.PI * 2, true);
            g.clip();
            g.translate(-cx, -cy);
            Motion.drawLayer(g, env, src);
            g.restore();
        }
    }

    /**
     * PICTURE IN PICTURE: the camera pulls back and `inner`, which filled the screen,
     * ends up inside a circle or rectangle of `outer` (a painting, a screen, a
     * drawing). With u going from 1 to 0 it does the reverse: entering the picture.
     * at: { x, y, r } (circle) or { x, y, w, h } (rectangle), in `outer` coordinates.
     * rim(g, at) optional: the frame, in `outer` coordinates.
     */
    function frame(g, env, u, { inner, outer, at, rim = null }) {
        const e = E.inOut(u);
        const fitS = at.r ? (2 * at.r) / env.H : Math.max(at.w / env.W, at.h / env.H);
        // `outer` starts very close (the hole fills the screen) and pulls back to s = 1
        const so = logLerp(1 / fitS, 1, e);
        // the hole starts at the center of the screen and ends in its place
        const pos = E.lerpPt([env.W / 2, env.H / 2], [at.x, at.y], e);
        g.save();
        zoomAt(g, so, [at.x, at.y], pos);
        // inside `outer`, paint its content and on top the hole with `inner`
        outer(g);
        g.save();
        if (at.r) circle(g, at.x, at.y, at.r);
        else (g.beginPath(), g.rect(at.x - at.w / 2, at.y - at.h / 2, at.w, at.h));
        g.clip();
        zoomAt(g, fitS, [env.W / 2, env.H / 2], [at.x, at.y]);
        inner(g);
        g.restore();
        if (rim) rim(g, at);
        g.restore();
        // a round hole doesn't cover the corners at first: outside the circle we keep
        // painting `inner` (at the same scale) and fade it out as it pulls back
        if (at.r && u < 0.35) {
            g.save();
            g.globalAlpha = Math.pow(1 - E.seg(u, 0, 0.35), 2);
            g.beginPath();
            g.rect(0, 0, env.W, env.H);
            circle(g, pos[0], pos[1], at.r * so);
            g.clip('evenodd');
            zoomAt(g, fitS * so, [env.W / 2, env.H / 2], pos);
            inner(g);
            g.restore();
        }
    }

    return { zoomAt, logLerp, enter, iris, engulf, vortex, frame };
})();
