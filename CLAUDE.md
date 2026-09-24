# illomotion

Sandbox para generar animaciones y vídeos **con código** y Claude, y para que cada prueba
mejore las skills que las generan. Todo en español.

## Mapa

| Ruta | Qué es |
|---|---|
| `.claude/skills/animar/` | **Empieza aquí** para cualquier vídeo: el proceso del brief al MP4 |
| `.claude/skills/motor/` | Contrato de escena, determinismo, comandos |
| `.claude/skills/revisar/` | Bucle de crítica automática + feedback, y cómo se destilan las lecciones |
| `.claude/skills/sonido/` | Música, efectos, mezcla |
| `.claude/skills/estilo-*/` | Una skill por estilo visual |
| `.claude/skills/nuevo-estilo/` | Cómo añadir un estilo |
| `engine/` | Motor: `player.html`, `core.js`, `render.mjs`, `review.mjs`, `new.mjs`, `mix.mjs`, `serve.mjs` |
| `styles/<estilo>/` | Kit de dibujo y `template.js` de cada estilo |
| `sandbox/` | Un experimento por carpeta (`AAAA-MM-DD-nombre/`), con índice en `INDEX.md` |
| `referencias/` | Proyectos terminados que sirven de modelo (Fube · «La caja y el torno») |
| `assets/sfx/`, `fonts/` | Efectos de sonido y fuentes con licencia libre |

## Comandos

```bash
sh engine/setup.sh                                  # dependencias + ffmpeg (lo hace el hook)
node engine/new.mjs <nombre> --style papel-recortado --aspect 16:9 --duration 6
npm run preview                                     # http://127.0.0.1:5173
node engine/review.mjs sandbox/<exp>/scene.js       # revisión automática + hoja de contacto
node engine/render.mjs sandbox/<exp>/scene.js --at 1,2.5   # fotos fijas
node engine/render.mjs sandbox/<exp>/scene.js --size 1920  # MP4
```

## El bucle (obligatorio)

1. Nunca des por buena una animación sin renderizarla y **mirar** fotogramas (Read sobre
   `review/hoja.jpg` y `out/stills/*.png`).
2. Tras cada render: skill **revisar** (crítica automática, hasta 3 rondas) antes de
   enseñárselo al usuario.
3. Con el feedback del usuario: corregir y **destilar** lo generalizable a la skill que
   toque (estilo, animar, motor, sonido) o arreglar el motor.
4. Commit por ronda: `revisar(<experimento>): ronda N · <lección>`, experimento y skills
   juntos.

## Convenciones

- Escenas deterministas: nada de `Math.random`, `Date` ni estado entre fotogramas.
- Se suben: código, `brief.md`, `review.md`, `review/hoja.jpg`, `review/auto.md`, `audio.json`.
  No se suben: `out/` (MP4, fotogramas), `.wav`, música de terceros, claves.
- Comentarios y textos en español, como el resto del repo.
- Si cambias `engine/`, pasa `review.mjs` a `styles/*/template.js` y al último experimento
  para comprobar que nada se ha roto.
