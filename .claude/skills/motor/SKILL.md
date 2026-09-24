---
name: motor
description: Referencia técnica del motor de illomotion. Úsala al escribir o depurar el código de una escena (scene.js), al renderizar a MP4 o a fotos fijas, al tocar engine/ o un kit de estilo, o cuando algo tiembla, va lento o no carga. Cubre el contrato de Motion.scene, el determinismo, las unidades, la caché y los comandos.
---

# Motor

Canvas 2D en Chromium sin cabeza, fotograma a fotograma. Sin librerías de animación: el
tiempo es una variable `t` y cada fotograma es una **función pura de t**.

## Contrato de una escena

```js
Motion.scene({
    fps: 24, duration: 6.5,
    logical: [1600, 900],          // unidades lógicas; la salida se escala (k = px/unidad)
    uses: ['styles/papel-recortado/paper.js', 'styles/papel-recortado/kit.js', 'sandbox/x/cast.js'],
    fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' },
            { family: 'Geist', src: 'fonts/Geist-var.ttf', descriptors: { weight: '100 900' } }],
    bpm: 120, beatOffset: 0,       // rejilla musical (review.mjs comprueba los cortes)
    shots: [[0, 4, 'Taller'], [4, 8, 'Caja']],
    audio: { mix: 'mezcla.wav' },  // render.mjs lo añade solo
    setup(env) { return { kit: PaperKit.make(env) }; },  // → env.state
    draw(g, t, env) { ... },       // coordenadas lógicas; el lienzo ya viene escalado
    post(ctx, t, env) { ... },     // opcional, en PÍXELES: grano, viñeta
});
```

`env`: `W, H` (lógicas), `k`, `fps`, `duration`, `total`, `px: [ancho, alto]`, `state`.
Rutas de `uses` y `fonts` desde la raíz del repo.

Utilidades de `engine/core.js`: `Motion.rng(semilla)`, `noise1`, `sprite(clave, caja,
escala, dibujar)`, `shotAt`, `pulse(t, bpm)`, `beatIndex`, `onBeat`, `cam(g, env, cx, cy,
zoom, rot)`, `shake`, `keys([[t, v], …], t)`; y `Ease.seg/inOut/out/in/back/elastic/bump/
pop/lerp/lerpPt`. `Motion.layer(env, nombre, fn)` pinta un plano en un lienzo aparte
(del tamaño de salida) y `Motion.drawLayer` lo pega: para transiciones y espejos. El patrón de tiempo local es `const u = Ease.out(Ease.seg(t, 2.0, 2.6))`.

## Determinismo (regla de oro)

- Prohibido `Math.random()`, `Date`, `performance.now()` y el estado que se acumula entre
  fotogramas (posiciones que se van sumando, partículas vivas). Todo se calcula desde `t`.
- Aleatoriedad = `Motion.rng('semilla-estable')` o `Paper.rng`. La semilla identifica la
  pieza, **nunca el fotograma**, o la textura hierve.
- Simulaciones (caídas, lluvias de papel): fórmula cerrada por partícula con su semilla,
  o una simulación que se precalcula entera en `setup` y se indexa por fotograma.
- `review.mjs` pinta los fotogramas en otro orden y compara hashes: si avisa, hay estado.

## Escenas largas o con varios estilos

Un fichero por tramo en `tramos/` (cada uno añade su función a un objeto global, p. ej.
`Tramo.rana = (g, t, env) => …`), cargados desde `uses` junto con los kits de todos los
estilos. `scene.js` solo monta: decide qué tramo o qué transición toca en cada `t`. Ver
`sandbox/2026-09-24-cadaver-exquisito/`.

## Rendimiento

- Lo estático (fondos, recortes, texturas) se pinta una vez con `Motion.sprite` / el
  `sprite` del kit, con una clave que incluya todo lo que cambie su aspecto.
- La textura de rotulador es cara: `density` baja en piezas grandes, y siempre en caché.
- Objetivo: < 150 ms/fotograma en caliente a 1920. `review.mjs` lo mide.

## Comandos

```bash
npm run preview                                           # http://127.0.0.1:5173
node engine/review.mjs sandbox/x/scene.js                 # revisión automática + hoja
node engine/render.mjs sandbox/x/scene.js --at 1.5,3.2    # fotos fijas a 1920 → out/stills
node engine/render.mjs sandbox/x/scene.js --size 1920     # MP4 → out/x.mp4
node engine/render.mjs sandbox/x/scene.js --size 1080 --from 4 --to 8   # un tramo
node engine/mix.mjs sandbox/x/audio.json                  # mezcla.wav
```

Vista previa: espacio = pausa, ←/→ fotograma, mayús+←/→ un segundo, `&t=3.5` en la URL.
Chrome: se busca en `CHROME_PATH`, `/opt/pw-browsers`, y las rutas típicas de Linux/macOS.

## Depurar

- Pantalla negra o sin READY: `review.mjs` imprime el error de la página. Lo típico: una
  ruta de `uses` mal, una fuente que no carga o una excepción en `setup`.
- Texto en fuente del sistema en el primer fotograma: la fuente no está en `fonts`.
- Todo borroso: el sprite se cacheó con poca resolución (sube `res`) o se escala mucho.

## Lecciones

<!-- Se añaden desde el bucle de revisión: fecha · experimento · lección en una línea. -->
- 2026-09-24 · primero-cafe · Todo lo que va a sangre (fondos, suelos, mesas) debe cubrir el recorrido completo de la cámara: `paperBg(…, { bleed })` y piezas más anchas que el barrido. `review.mjs` avisa de «huecos transparentes».
- 2026-09-24 · primero-cafe · Para cachear una pieza que se mueve, dibuja el sprite en su origen y muévelo con `translate/rotate/scale`; la clave del sprite no debe depender de t.
