# Revisiones · primero-cafe

Cada ronda: qué se vio (auto y a ojo), qué se cambió y qué lección sale. Las lecciones
que valen para otros vídeos se suben a la skill correspondiente (ver revisar/SKILL.md).

## Ronda 1 (auto)

- `review.mjs`: tramo quieto de 0,83 a 2,17 s. Con las «z» diminutas y una respiración
  de 1,5 %, a efectos prácticos no pasa nada.
- A ojo (hoja): la taza ocupa un 15 % del ancho y el plano queda vacío. La ficha tapa el
  asa en «Frase». El vapor son tiras planas sin filo ni textura, fuera de estilo.
- Del motor: la tira de energía se normalizaba contra el barrido de cámara y los
  movimientos pequeños no se veían.

**Cambios:** taza ×1,5 con balanceo y respiración del 3 %, «z» de 64–104 px, ficha más a
la derecha, vapor rehecho como recortes fijos que suben, se inclinan y se desvanecen, y
escala de raíz cuadrada en la tira de energía de `review.mjs`.

## Ronda 2 (auto)

- A ojo: tras el barrido de cámara (4–4,5 s) asoma una franja vacía por la derecha. El
  fondo y la mesa del kit no cubrían el recorrido de la cámara. `review.mjs` no lo vio.
- La frase final se quedaba pequeña para ser el mensaje.

**Cambios:** `paperBg` con `bleed` configurable (400 por defecto, en todos los lados) y la
mesa más ancha. `review.mjs` ahora avisa de **huecos transparentes** (probado con una
escena rota a propósito). Ficha de 620×270 y texto a 88.

## Ronda 3 (auto, fotos fijas a tamaño real)

- 0,54 s: los ojos cerrados enseñaban el blanco bajo la pestaña y parecían mirar hacia
  abajo, no dormir. En la hoja a 480 px no se apreciaba.
- 5,08 s: el guiño se lee. 5,96 s: el último fotograma aguanta como póster.

**Cambios:** con el ojo cerrado, el párpado tapa todo el blanco. Efectos añadidos
(`audio.json`): golpe al caer, pops al abrir los ojos, *swoosh* de la ficha, rotulador y
tap del guiño.

## Ronda 4 (usuario)

> «El vídeo de la taza está bien, pero el humo sale fuera de la taza, no del café.»

- Causa: el vapor se pintaba **detrás** de la taza, con la base escondida tras el cuerpo,
  así que asomaba por detrás del borde. La revisión automática no lo cazó porque el
  checklist no preguntaba **de dónde sale** cada cosa.
- **Cambios:** el vapor se pinta delante, en unidades de la taza, recortado a «encima de
  la línea del café» ∪ «dentro de la elipse del café». Cada tira empieza entera bajo la
  superficie y asoma al subir. Ahora sigue a la taza en el aplastamiento y el balanceo.
- **Lecciones:** checklist general de `revisar` (origen de lo que emana) y regla del
  estilo (cómo recortarlo).

## Ronda 5 (usuario)

> «Mira una taza con humo real. El tuyo parecen un poco tentáculos quizás.» (con una foto
> de referencia)

- Lo que tiene el vapor real de la foto y no tenía el mío: nace **finísimo** y casi
  invisible, se **ensancha y se difumina** al subir, **deriva hacia un lado**, se
  **riza** y acaba en punta, y es **translúcido** con capas superpuestas. Mis tiras eran
  cilindros del mismo grosor, opacos, verticales y con punta redonda: tentáculos.
- **Cambios:** `kit.wisp()` nuevo en el estilo, una cinta de papel de seda (halo ancho y
  tenue + núcleo más denso, sin filo blanco) con perfil fino-ancho-fino, ondulación que
  crece, deriva y rizo final. Dos volutas por foco en vez de tres, que suben, derivan a la
  derecha, se ensanchan y se desvanecen. Siguen siendo recortes fijos: no hierven.
- **Lecciones:** en `animar`, estilizar un fenómeno real partiendo de una referencia real;
  en el estilo, la receta del vapor y del humo.

