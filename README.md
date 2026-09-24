# illomotion

Animaciones y vídeos hechos **con código** por Claude: cada fotograma lo pinta JavaScript
en un `<canvas>`, de forma determinista, y se renderiza a MP4 con Chromium y ffmpeg. Sin
After Effects ni vídeo generado por IA.

El repo es a la vez **caja de herramientas** (motor + estilos + skills de Claude) y
**banco de pruebas**: cada experimento de `sandbox/` pasa por una revisión automática
(fotogramas reales, comprobaciones de determinismo, ritmo y movimiento) y por el feedback
humano. Lo aprendido vuelve a las skills, así que cada prueba mejora las siguientes.

## Empezar

Requisitos: Node 20 o superior, Chrome o Chromium y ffmpeg.

```bash
npm install
node engine/new.mjs mi-prueba --style papel-recortado --duration 5
npm run preview          # http://127.0.0.1:5173
```

Con Claude Code basta con pedirlo: *«hazme un vídeo de 10 s en papel recortado para…»*.
La skill `animar` guía el proceso: brief → guion → prueba de estilo → animática → final.

## Estilos

| Estilo | Estado | Referencia |
|---|---|---|
| `papel-recortado`: papel rasgado, rotulador, grano, letra a mano | aprobado | [La caja y el torno](referencias/fube-la-caja-y-el-torno/) |
| `cartel-70s`: colores ácidos planos, ecos, rayos, letras que se derriten | aprobado | [cadaver-exquisito](sandbox/2026-09-24-cadaver-exquisito/) |
| `luz-liquida`: manchas de aceite que se funden, proyección de los 60 | aprobado | [cadaver-exquisito](sandbox/2026-09-24-cadaver-exquisito/) |
| `caleidoscopio`: simetría de espejos, rotación, ciclos de color | aprobado | [cadaver-exquisito](sandbox/2026-09-24-cadaver-exquisito/) |
| `linea`: trazo negro que tiembla sobre papel blanco | aprobado | [cadaver-exquisito](sandbox/2026-09-24-cadaver-exquisito/) |

Transiciones entre estilos (entrar por un punto, iris, engullir, vórtice, cuadro dentro del
cuadro): `engine/transitions.js` y la skill `transiciones`.

Para añadir uno: skill `nuevo-estilo`.

## Cómo aprende

```
brief ─▶ scene.js ─▶ review.mjs ─▶ crítica de Claude ─▶ corrección  (≤3 rondas)
                                                     │
                                  feedback del usuario ◀┘
                                                     │
          ¿generaliza? ─▶ skill del estilo / animar / motor / sonido / review.mjs
                                                     │
                                            commit por ronda
```

Historial de experimentos y lecciones: [`sandbox/INDEX.md`](sandbox/INDEX.md).

## Licencias

Fuentes Patrick Hand y Geist con licencia SIL OFL 1.1 (`fonts/`). Los efectos de
`assets/sfx/` se generaron con ElevenLabs con la cuenta de Fube: el uso comercial exige
plan de pago. Personajes y logo del Fubiverso, propiedad de Fube.
