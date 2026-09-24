# Revisiones · cadaver-exquisito

Referencia: *Rick and Morty · Exquisite Corpse*. Del análisis (hojas de contacto de todo el
vídeo y a 5 fps en cuatro cambios de estilo) salieron las cuatro transiciones que se usan
aquí: engullir (0:15), cuadro dentro del cuadro (1:04), vórtice (2:31) y entrar por la boca
(3:17).

## Ronda 1 (auto · hoja completa)

- **Entrar por el ojo (5,2 s):** el portal sustituía al ojo desde el primer fotograma y se
  veía un disco rosa plano. → `fadeIn` en `Trans.enter`: primero se ve la espiral del ojo.
- **Engullir (11 s):** cada nube dejaba su aro entero y salía una maraña encima de la luz
  líquida. → en `Trans.engulf`, los bordes se pintan antes que `b`.
- **Medusa:** 34 manchas grandes, una sopa sin forma. → 5 de fondo pequeñas y apartadas a
  los bordes, campana en cúpula (magenta) y 4 tentáculos finos (turquesa).
- **Canica:** demasiado pequeña para ser el hilo conductor (radio 24 → 32–40) y
  desaparecía en 18,0 s. → radio mínimo de 10 en el punto del vórtice.
- **Caleidoscopio:** tras el cambio de tono, colores marrones. → `saturate` 1,5 y giro de
  tono de 110°; las bandas del fondo, de mayor a menor.
- Kits: el derretido del cartel salía en pinchos (→ gotas redondas) y la luz líquida
  hacía moiré en el centro de las manchas (→ anillos en escala logarítmica con tope).

## Ronda 2 (auto · fotos fijas a tamaño real + audio)

- La hoja arrugada (28 s) era un polígono con rayas. → facetas de luz y sombra, y recorte
  también al rectángulo de la hoja (asomaban facetas fuera).
- El caleidoscopio cambiaba casi entero cada 1/6 s. → giro 0,3 rad/s y piezas a la mitad
  de velocidad. `review.mjs` ahora mide **destellos** (0 aquí) y separa los saltos de los
  cortes.
- Audio: la rana y la vuelta quedaban casi mudas frente al bombo. → colchón y sitar más
  altos y bombo más bajo.
- **Intencionado:** en 18,0 s `review.mjs` marca un fotograma plano: es el punto (la canica
  de radio 10) del que nace el caleidoscopio.

## Ronda 3 (usuario)

_Pendiente de feedback._
