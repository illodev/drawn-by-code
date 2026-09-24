---
name: nuevo-estilo
description: Crea un estilo de animación nuevo en illomotion (kit de código + plantilla + skill + prueba de estilo). Úsala cuando el usuario pida un look que no cubre ningún estilo de styles/ (p. ej. tipografía cinética, flat/motion graphics de producto, UI mockups, pixel art, línea/boceto, 3D isométrico, explicativo tipo pizarra, glitch, retro VHS) o diga "prueba otro estilo".
---

# Nuevo estilo

Un estilo son tres cosas que se mantienen juntas:

```
styles/<estilo>/
  <kit>.js        helpers de dibujo reutilizables (global con nombre propio, p. ej. Kinetic)
  template.js     escena mínima que funciona: la copia engine/new.mjs
.claude/skills/estilo-<estilo>/SKILL.md
```

## Pasos

1. **Definir el look en palabras** con el usuario, y con 2–3 referencias si las tiene:
   paleta (con hex), tipografía(s), tipo de movimiento (elástico, mecánico, orgánico),
   textura (limpio, grano, papel), cámara, qué está prohibido. Si trae un vídeo, extrae
   una hoja de contacto con
   `ffmpeg -i ref.mp4 -vf "fps=1,scale=480:-1,tile=4x3" -frames:v 1 hoja.jpg` y mírala.
2. **Fuentes:** solo con licencia libre (OFL) y en `fonts/` junto a su licencia.
3. **Kit:** empieza pequeño, con lo que la prueba necesite. Cumple las reglas de **motor**
   (determinismo, caché). Si algo sirve para todos los estilos, va a `engine/core.js`.
4. **template.js:** 3–4 s que enseñen el estilo en miniatura: fondo, una pieza que entra
   con su movimiento característico, un texto. Debe pasar `review.mjs` sin avisos.
5. **Skill:** copia la estructura de abajo. Las *Reglas* y el *Checklist* son lo que hace
   que dos vídeos del mismo estilo parezcan de la misma mano.
6. **Prueba de estilo** en `sandbox/` con `engine/new.mjs … --style <estilo>`, bucle de
   **revisar** y aprobación del usuario. Hasta entonces, el estilo está *en pruebas* (dilo
   en la descripción de la skill).
7. Añade el estilo a la tabla de `README.md`.

## Plantilla de la skill

```markdown
---
name: estilo-<estilo>
description: Estilo <nombre>: <cómo se ve en una frase>. Úsala cuando se pida <tipos de vídeo / palabras clave> o al trabajar con styles/<estilo>/.
---

# Estilo · <Nombre>

Referencia aprobada: sandbox/<experimento>/ (review/hoja.jpg)

## Código
<qué ofrece el kit y cómo se usa>

## Reglas del estilo
<paleta, tipografía, movimiento, cámara, textura, prohibido>

## Checklist del estilo
- [ ] …

## Lecciones
```
