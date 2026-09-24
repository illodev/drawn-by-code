---
name: estilo-papel-recortado
description: Estilo de animación de papel recortado dibujado con código (bordes rasgados, relleno a rotulador, grano, letra manuscrita), el de «La caja y el torno» de Fube. Úsala cuando se pida un vídeo cálido, artesanal, de personajes o "tipo papel/collage/cutout/stop-motion", o al trabajar con styles/papel-recortado/.
---

# Estilo · Papel recortado

Referencia aprobada: `referencias/fube-la-caja-y-el-torno/` (mira
`prueba-de-estilo-hoja.jpg` y `reparto.jpg` antes de empezar).

## Código

- `styles/papel-recortado/paper.js` → `Paper`: `cutout(ctx, poly, color, seed, o)` es la
  pieza base (filo blanco rasgado + color + trazos de rotulador + sombra de papel pegado).
  Formas: `roundRect`, `ellipse`, `circleUnion` (nubes, siluetas blanditas), `noodle`
  (tiras para brazos y piernas), `bezier`. Trazos: `markerStroke`, `scribble` (letra
  ilegible), `marker` (textura). `grainTile` para el grano.
- `styles/papel-recortado/kit.js` → `PaperKit.make(env, { font })`: `hand` (texto que se
  escribe), `title` (texto + subrayado), `sfxWord` («¡zas!»), `paperBg`, `glow`, `sheet`,
  `ticket`, `grainPost` y la paleta `COL`.
- Personajes como **marionetas**: una función por personaje que recibe `{ t, armL, armR,
  legL, legR, look, blink, … }` y se dibuja con el origen **entre los pies** (arriba es
  negativo). Brazos y piernas son `noodle` por hombro-codo-mano. Ejemplo completo en
  `referencias/.../proyecto/characters.js`.
- Si la mano se apoya en el cuerpo, el brazo se pinta en dos pasadas (entero detrás y
  desde el codo delante) para que se lea como brazo en jarras y no como asa de taza.

## Reglas del estilo

- **Nada hierve:** cada pieza tiene su semilla fija. El rasgado y la textura son iguales en
  todos los fotogramas. La vida viene del movimiento (respirar, balancearse, parpadear),
  no del temblor del contorno.
- **Paleta:** fondo oscuro y apagado (berenjena `#3a2146`) con piezas saturadas encima
  (naranja `#f2643c`, menta `#6cc9a1`, amarillo `#e9b949`). Tinta `#2a1826`, nunca negro
  puro. Crema `#f4ecda` para el texto sobre oscuro.
- **Filo blanco** en todas las piezas protagonistas; los fondos van sin filo.
- **Sombra de papel pegado** corta y desplazada abajo a la derecha: la luz es siempre la
  misma en toda la pieza.
- **Letra:** Patrick Hand para todo lo manuscrito (rótulos, notas, onomatopeyas). Para
  marca y llamada a la acción, la tipografía de la marca (Geist en Fube), nunca la
  manuscrita. Subrayado a rotulador naranja que se dibuja justo después del texto.
- **Personajes:** ojos de párpado grueso y mirada de reojo, media sonrisa torcida; un tono
  más oscuro en las extremidades que en el cuerpo. Nada de coloretes si no son infantiles.
- **Cámara:** planos frontales como de teatrillo de papel; los movimientos, empujes suaves
  (`cam` con `inOut`). Los impactos se ven desde arriba o de frente, nunca de perfil
  contra una pared.
- **Lo que cambia de forma se anima como stop-motion:** vapor, humo, agua, llamas… son
  recortes fijos (sprite con su semilla) que se desplazan, giran, escalan y se
  desvanecen, varios escalonados. Nunca regeneres cada fotograma un contorno con filo
  rasgado que se deforma: el rasgado se recalcula y hierve.
- **Ojos:** abiertos, blanco + pupila + párpado grueso (un tono más oscuro que la cara)
  que nunca sube del todo. Cerrados, el párpado tapa **todo** el blanco y encima va la
  pestaña curva; si asoma blanco se lee «mira abajo», no «duerme».
- **Prohibido:** destellos, estrellas, confeti, bokeh, orbes de degradado y sombras
  difusas de programa de diseño. Si brilla, es papel más claro recortado.

## Checklist del estilo

- [ ] ¿Algún contorno o textura cambia entre dos fotogramas seguidos sin moverse la pieza?
- [ ] ¿Todas las piezas protagonistas tienen filo blanco y sombra hacia el mismo lado?
- [ ] ¿Hay algún degradado, brillo o negro puro?
- [ ] ¿El texto de marca va en la tipografía de marca y el manuscrito en Patrick Hand?
- [ ] ¿Los personajes son idénticos a su versión aprobada (proporciones, colores, cara)?
- [ ] ¿Los QR, sellos y documentos están completos y bien hechos, no a medias?
- [ ] ¿Se nota el grano en toda la imagen, incluido el texto?
- [ ] ¿Algo que cambia de forma (vapor, humo) está hecho con piezas fijas y no deformando un contorno rasgado?

## Lecciones

- 2026-09-23 · la-caja-y-el-torno · Varios personajes en fila saltando a la vez se leen como un error: escalónalos o dale el protagonismo a uno.
- 2026-09-23 · la-caja-y-el-torno · Los sellos y los impactos se ven desde arriba (la goma baja hacia cámara), no de lado contra una pared.
- 2026-09-23 · la-caja-y-el-torno · QR, sellos y documentos se dibujan completos y de verdad: los objetos a medias parecen un fallo.
- 2026-09-23 · la-caja-y-el-torno · Un chiste visual que necesita explicación (Excelord de posavasos bajo una taza) se quita.
- 2026-09-23 · la-caja-y-el-torno · Un escenario distinto por bloque; el mismo libro de páginas para todo se hace repetitivo.
- 2026-09-23 · la-caja-y-el-torno · Personajes siempre vivos: respiran, se balancean y parpadean con `t` aunque no actúen.
- 2026-09-24 · primero-cafe · El vapor como tira deformada sin filo quedaba plano y fuera de estilo; como recortes fijos que suben y se desvanecen, funciona (ya en Reglas).
- 2026-09-24 · primero-cafe · Un personaje-objeto (la taza) se lee como personaje solo con ojos de párpado grueso y una boca de rotulador: no hacen falta brazos para un plano corto.
