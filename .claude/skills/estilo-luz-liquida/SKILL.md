---
name: estilo-luz-liquida
description: (En pruebas) Estilo luz líquida: las proyecciones de aceite y tinta de los conciertos de los 60, con manchas que fluyen, se funden (metaballs), cambian de color y tienen anillos como el aceite sobre agua. Úsala para vídeos psicodélicos, hipnóticos, líquidos u orgánicos, o al trabajar con styles/luz-liquida/.
---

# Estilo · Luz líquida

En pruebas. Primer uso: `sandbox/2026-09-24-cadaver-exquisito/` (tramo de la medusa, 12–16,5 s).

## Código

`styles/luz-liquida/kit.js` → `Liquid`: `field(g, env, blobs, { res, bg, bands, hueShift,
glow, threshold, sat })` pinta el campo de manchas `[{ x, y, r, hue }]`; `drift(seed, n, t,
env, o)` da manchas que derivan solas; `glowDot` es un punto de luz nítido encima.

El campo se calcula por píxel a baja resolución (`res` = 360 px de ancho) y se amplía con
suavizado: ese desenfoque ES el aspecto de proyección. Cuesta unos 30 ms por fotograma con
unas 40 manchas.

## Reglas del estilo

- **Fondo casi negro**: la luz solo está en las manchas y en su halo.
- **Pocas manchas grandes.** Con muchas, todo se funde en una sopa de color: para formar
  una figura (una medusa, una cara), aparta el resto a los bordes y hazlo más pequeño.
- **Las figuras se construyen con manchas** (una campana en arco + un núcleo, tentáculos
  en cadena) que llegan desde posiciones dispersas: así la figura «se condensa».
- **Color por familias:** un tono por parte de la figura (campana magenta, tentáculos
  turquesa); `hueShift` rota todo despacio (20–30 °/s).
- **Anillos suaves:** 2–3 anillos por mancha como máximo; lo más denso, liso.
- Lo que debe leerse encima (el hilo conductor, un texto) va nítido y con `glowDot`.

## Checklist del estilo

- [ ] ¿Se lee la figura, o es una sopa de manchas?
- [ ] ¿Hay dianas o moiré en el centro de las manchas?
- [ ] ¿El fondo queda oscuro y limpio?

## Lecciones

- 2026-09-24 · cadaver-exquisito · Los anillos en lineal se apiñan en el centro de cada mancha (moiré); en escala logarítmica y con tope salen como aceite (ya en `field`).
- 2026-09-24 · cadaver-exquisito · 34 manchas grandes = sopa; 5 de fondo pequeñas y apartadas + la figura = se lee la medusa.
