---
name: revisar
description: Bucle de revisión y auto-mejora de illomotion. Úsala después de CADA render o cambio visible de una escena, cuando el usuario dé feedback sobre un vídeo ("esto no se lee", "más rápido", "me gusta X"), y al cerrar un experimento. Hace la crítica automática con fotogramas reales, corrige la escena y convierte lo aprendido en cambios permanentes de las skills y del motor.
---

# Revisar: crítica, corrección y aprendizaje

Cada prueba tiene que dejar el repo mejor de lo que estaba. El bucle tiene dos mitades:
la **crítica automática** (sin el usuario, antes de enseñarle nada) y el **feedback del
usuario**. Las dos acaban igual: en cambios a la escena y, si la lección generaliza, en
cambios a las skills o al motor.

## A · Crítica automática (antes de enseñar nada al usuario)

1. `node engine/review.mjs <scene.js>` → lee `review/auto.md` y mira `review/hoja.jpg`
   con la herramienta Read. Los avisos objetivos (errores, no determinista, cortes fuera
   de golpe, tramos quietos) **se arreglan siempre**, o se justifica en `review.md` por qué
   son intencionados.
2. Fotos fijas de los momentos clave a tamaño real:
   `node engine/render.mjs <scene.js> --at 1.2,3.5,5.8` y míralas (out/stills/). Mira
   sobre todo los instantes de lectura de texto, los contactos (manos que agarran, cosas
   que chocan) y el último fotograma.
3. Pasa el **checklist general** (abajo) y el **checklist del estilo** (en su skill).
   Escribe cada fallo como *qué se ve · en qué segundo · por qué falla*.
4. Corrige, vuelve a 1. **Máximo 3 rondas automáticas**; si algo no mejora en 3, se lo
   planteas al usuario como duda en vez de seguir girando.
5. Anota la ronda en `review.md`: `### Ronda N (auto)`, lo visto, lo cambiado.

Sé duro: el fallo más común de la auto-crítica es aprobar por cansancio. Si dudas entre
"se lee" y "no se lee", **no se lee**.

### Checklist general

- **Lectura:** cada texto está en pantalla al menos ~0,4 s por palabra corta + 1 s, con
  contraste suficiente y sin tapar nada. Nada importante en el 5 % del borde (en vertical
  deja libres los 250 px de abajo y los 150 de arriba, donde caen los botones de las redes).
- **Claridad:** cada plano se entiende sin sonido y sin explicación. Un solo foco de
  atención por momento; si hay dos cosas moviéndose, una manda.
- **Movimiento:** anticipación y asentamiento (nada arranca ni para en seco salvo a
  propósito), curvas de ease, nada quieto más de 1 s salvo el cierre, nada que tiemble
  sin querer.
- **Fotosensibilidad:** nada de más de 3 destellos por segundo (cambios bruscos del brillo
  general). `review.mjs` los mide; en vídeos psicodélicos es obligatorio.
- **Ritmo:** cortes en golpe; los golpes visuales (impactos, sellos, apariciones) caen
  en golpe también.
- **Origen y física:** todo lo que emana (vapor, humo, chispas, líquido, papeles que
  salen de una caja) nace visiblemente en su fuente y no por detrás o por encima de
  ella. Las cosas se apoyan donde deben y caen hacia abajo. Míralo en una foto fija
  del instante en que aparece.
- **Continuidad:** personajes y objetos iguales entre planos y respecto a la prueba de
  estilo aprobada; la dirección de mirada y de movimiento es coherente entre cortes.
- **Composición:** regla de tercios o simetría deliberada, horizonte recto salvo
  intención, márgenes coherentes, jerarquía de tamaños clara.
- **Exactitud:** nada promete más que la fuente (web, brief). Marcas de terceros solo
  como iconos genéricos.
- **Final:** el último fotograma aguanta como póster y el mensaje final se lee entero.

## B · Feedback del usuario

1. Enséñale el resultado: MP4 (`render.mjs`) y la hoja de contacto. Dile en una línea
   qué has corregido por tu cuenta y qué dudas te quedan.
2. Anota su feedback **literal** en `review.md` (`### Ronda N (usuario)`), y debajo tu
   traducción a cambios concretos.
3. Aplica, vuelve a A.

## C · Destilar: del experimento a las skills

Al cerrar cada ronda con feedback del usuario, y al cerrar el experimento, pregúntate por
cada lección: **¿serviría en otro vídeo?**

| La lección es sobre… | Va a… |
|---|---|
| este vídeo en concreto (este texto, esta marca) | solo `review.md` |
| el estilo (cómo se ve el papel, la paleta, los personajes) | la skill `estilo-*`: *Reglas*, *Checklist* o *Lecciones* |
| narrativa, ritmo, guion, lectura | `animar/SKILL.md` o el checklist general de aquí |
| un error técnico, algo lento, una utilidad que faltaba | arréglalo en `engine/` o en el kit y anótalo en `motor/SKILL.md` |
| algo que la revisión automática pudo detectar y no detectó | amplía `engine/review.mjs` |
| sonido | `sonido/SKILL.md` |

Formato de una lección: `- AAAA-MM-DD · <experimento> · <regla en imperativo, una línea>`.
Escribe reglas, no anécdotas: "Los sellos se ven desde arriba, nunca contra una pared de
lado", no "el sello de la ronda 2 quedaba raro".

**Mantenimiento de las skills:** cuando una sección *Lecciones* pase de ~15 entradas,
consolida: sube las que se repiten a *Reglas* o al *Checklist*, borra las superadas.
Una skill larga y contradictoria es peor que una corta. Si una lección contradice una
regla, gana la más reciente y confirmada por el usuario: corrige la regla.

Actualiza la fila del experimento en `sandbox/INDEX.md` y haz commit:
`revisar(<experimento>): ronda N · <lección principal>`, con las skills tocadas en el
mismo commit, para que se vea qué prueba produjo qué cambio.

## Lecciones

<!-- Lecciones sobre el propio proceso de revisión. -->
- 2026-09-24 · primero-cafe · La hoja a 480 px no enseña los detalles de las caras (unos ojos cerrados que parecían mirar abajo): mira siempre fotos fijas a tamaño real de los primeros planos.
- 2026-09-24 · primero-cafe · Cuando veas a ojo un fallo que `review.mjs` pudo medir (hueco en el borde), amplía `review.mjs` y pruébalo con una escena rota a propósito antes de fiarte.
- 2026-09-24 · primero-cafe · Juzgué el vapor por su forma y no por su origen, y el usuario vio que salía de detrás de la taza. Por cada elemento que aparece, pregúntate de dónde sale (ya en el checklist).
- 2026-09-24 · cadaver-exquisito · El aviso de «saltos» por diferencia de imagen da falsos positivos en patrones densos y no mide lo que importa: ahora `review.mjs` cuenta destellos fotograma a fotograma y separa los saltos de los cortes (probado con una escena estroboscópica).
- 2026-09-24 · cadaver-exquisito · En una pieza larga, revisa primero con `--times` los instantes que has cambiado; la hoja entera solo al cerrar la ronda.
