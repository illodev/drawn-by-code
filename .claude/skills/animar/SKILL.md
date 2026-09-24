---
name: animar
description: Dirige la creación de una animación o vídeo con código en illomotion, del brief al MP4 final. Úsala siempre que el usuario pida un vídeo, animación, motion graphics, explainer, vídeo de producto/lanzamiento, reel, intro, logo animado o "una prueba" de un estilo; también para retomar un experimento de sandbox/. Orquesta las demás skills (motor, revisar, sonido y la skill del estilo elegido).
---

# Animar: del brief al vídeo

Todo vídeo se hace **con código** (canvas 2D, determinista, fotograma a fotograma) y se
revisa mirando fotogramas reales. Nunca se da por bueno algo que no se ha renderizado y
mirado. El proceso es el de «La caja y el torno» (`referencias/fube-la-caja-y-el-torno/`),
que salió bien: léete su `GUION.md` la primera vez.

## 0 · Antes de nada

- `sh engine/setup.sh` si no hay `node_modules/` o falta `ffmpeg`.
- Lee `sandbox/INDEX.md` (qué se ha probado ya) y la skill del estilo que toque.
- Estilos disponibles: carpetas de `styles/` con su skill `.claude/skills/estilo-*`. Si
  el pedido no encaja en ninguno, usa la skill **nuevo-estilo** antes de seguir.

## 1 · Brief (no animes sin él)

`node engine/new.mjs <nombre> --style <estilo> --aspect 16:9 --duration <s>` crea
`sandbox/AAAA-MM-DD-<nombre>/` con `brief.md`, `scene.js` y `review.md`.

Rellena `brief.md` con el usuario (pregunta solo lo que no puedas deducir): para qué es,
idea en una frase, texto literal en pantalla, formato, música, lo que no debe pasar. Si
hay producto o marca, **nada promete más que su web**: anota las fuentes de cada promesa.

## 2 · Guion plano a plano

Tabla `Tiempo | Plano | Qué pasa` en el brief. Reglas que ya nos han costado caras:

- **Una idea visual que evoluciona** (la caja que se vacía y el jarrón que crece) vale más
  que una lista de escenas. Busca el objeto que cambia a lo largo del vídeo.
- **Varía la estructura** de cada bloque: la misma fórmula repetida aburre al tercer uso.
- **Cortes en golpe de música.** A 120 BPM, múltiplos de 0,5 s. Declara `bpm` en la escena
  y `review.mjs` avisará de los cortes fuera de golpe.
- **Nada quieto más de 1 s** salvo el cierre: un silencio visual parece un fallo.
- **Cada chiste se tiene que leer** a velocidad normal y sin explicación.
- **Clímax corto** (2–3 s). Seis segundos de clímax cansan.
- **Estiliza desde lo real:** antes de dibujar un fenómeno o un gesto (vapor, humo, agua,
  fuego, tela, un salto, un andar), mira una referencia real (foto o vídeo) y apunta sus
  3–4 rasgos que lo hacen reconocible. El estilo simplifica esos rasgos, no se los
  inventa: si no, sale el cliché (el vapor de tres tentáculos).
- **Varios estilos en un vídeo** (cadáver exquisito): un **hilo conductor** que cruza
  todos los tramos (un objeto siempre visible y lo más saturado del plano) y transiciones
  que pasan a través de él (skill **transiciones**). Cada tramo, un estilo claramente
  distinto, no el mismo con otros colores. Si puede cerrar en bucle, que cierre.
- Para piezas largas, cruza 2–3 propuestas de guion distintas y quédate con lo mejor de
  cada una antes de animar.

## 3 · Prueba de estilo (4–7 s)

Un solo plano, el más representativo, a calidad final. Es donde se fija el aspecto de los
personajes y de la tipografía: **lo aprobado aquí no se cambia después** (Fubi cambió
entre la prueba y la animática y hubo que deshacerlo). Pasa el bucle de **revisar** y
enséñasela al usuario antes de seguir.

## 4 · Animática

La estructura entera con rótulo de tiempo y nombre de plano, sin pulir. Sirve para
juzgar ritmo y comprensión. Itera versiones (v1, v2…) con **revisar**; guarda en
`review.md` qué no funcionó de cada una.

## 5 · Final

Pulido, audio (skill **sonido**), versiones de formato si hacen falta (vertical 9:16
recompuesto, no recortado). Render: `node engine/render.mjs <scene.js> --size 1920`.

## Cómo organizar una escena grande

Para más de un plano, la escena declara `shots: [[inicio, fin, 'Nombre'], …]` y `draw`
reparte con `Motion.shotAt(shots, t)`. Una función por plano (`shotX(g, t)`), piezas
comunes (personajes, props) en funciones o en un fichero aparte en la carpeta del
experimento, cargado desde `uses`. Mira `referencias/.../proyecto/film.js`.

## Al terminar cada sesión de trabajo

1. `review.md` al día y la fila de `sandbox/INDEX.md` con estado y lección principal.
2. Lecciones generalizables subidas a su skill (ver **revisar**).
3. Commit con el experimento y las skills tocadas. Los vídeos y fotogramas (`out/`) no se
   suben; la hoja de contacto (`review/hoja.jpg`) sí, es el historial visual.
