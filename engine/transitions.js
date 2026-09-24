// Transiciones entre planos o entre estilos: global Trans. Cárgalo desde `uses`.
// Todas tienen la forma Trans.x(g, env, u, opciones), con u ∈ [0, 1] el avance de la
// transición (normalmente Ease.seg(t, inicio, fin)). `a` y `b` son funciones (g) => void
// que pintan el plano de salida y el de llegada en coordenadas lógicas; cada una puede
// llamarse con otra transformación puesta, así que deben pintar a sangre.
// Catálogo y cuándo usar cada una: .claude/skills/transiciones/SKILL.md
const Trans = (() => {
    const E = Ease;
    const diag = (env) => Math.hypot(env.W, env.H);
    // zoom logarítmico: se nota igual de rápido al principio que al final
    const logLerp = (a, b, u) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * u);

    // Coloca el punto `from` del plano en la posición `to` de la pantalla, escalado ×s.
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
     * ENTRAR POR UN PUNTO (ojo, boca, cerradura, pantalla): la cámara empuja hacia (cx, cy)
     * de `a`, ese punto viaja al centro y dentro se abre `b`, que llega girando y creciendo.
     * r0: radio del «agujero» en `a` antes del zoom. zoom: cuánto se acerca `a`.
     * edge(g, x, y, r): opcional, pinta el borde del agujero (el párpado, los labios).
     */
    // fadeIn: [u0, u1] en que `b` aparece dentro del agujero; antes se ve el propio punto
    // de `a` (la pupila, la espiral) ampliándose, que es lo que vende el «entrar».
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
     * IRIS: `b` aparece dentro de un círculo que crece desde (cx, cy) sobre `a`, que
     * sigue quieto. Es `enter` sin cámara: sirve para «desplegar» un mundo desde un objeto.
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
     * ENGULLIR: nubes (esporas, humo, tinta, espuma) que salen de `origin` y crecen hasta
     * tapar `a`. Dentro de las nubes ya está `b`. puff(g, x, y, r, i) opcional pinta el
     * borde de cada nube en el estilo de `a`, así el cambio se lee como algo de `a`.
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
        // los bordes van ANTES que `b`: `b` tapa la parte de cada borde que cae dentro de
        // otra nube y solo queda el contorno exterior (si no, sale una maraña de aros)
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
     * VÓRTICE: `a` se retuerce en espiral alrededor de (cx, cy) y se encoge hasta un
     * punto. Detrás queda `b` (a menudo solo un fondo oscuro del que nacerá lo siguiente).
     * Se pinta por anillos: cada anillo gira más cuanto más cerca del centro.
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
     * CUADRO DENTRO DEL CUADRO: la cámara se aleja y `inner`, que llenaba la pantalla,
     * acaba dentro de un círculo o rectángulo de `outer` (un cuadro, una pantalla, un
     * dibujo). Con u de 1 a 0 hace el camino contrario: entrar en el cuadro.
     * at: { x, y, r } (círculo) o { x, y, w, h } (rectángulo), en coordenadas de `outer`.
     * rim(g, alcance) opcional: el marco, en coordenadas de `outer`.
     */
    function frame(g, env, u, { inner, outer, at, rim = null }) {
        const e = E.inOut(u);
        const fitS = at.r ? (2 * at.r) / env.H : Math.max(at.w / env.W, at.h / env.H);
        // `outer` empieza muy cerca (el hueco llena la pantalla) y se aleja hasta s = 1
        const so = logLerp(1 / fitS, 1, e);
        // el hueco empieza en el centro de la pantalla y acaba en su sitio
        const pos = E.lerpPt([env.W / 2, env.H / 2], [at.x, at.y], e);
        g.save();
        zoomAt(g, so, [at.x, at.y], pos);
        // dentro de `outer`, pintamos su contenido y encima el hueco con `inner`
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
        // un hueco redondo no cubre las esquinas al principio: fuera del círculo seguimos
        // pintando `inner` (con la misma escala) y lo desvanecemos mientras se aleja
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
