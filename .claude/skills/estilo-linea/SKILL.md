---
name: estilo-linea
description: (En pruebas) Estilo línea: trazo negro sobre papel blanco que tiembla a propósito (line boil), como animación dibujada a mano a 12 dibujos por segundo. Úsala para garabatos, bocetos, explicativos a mano, momentos de «era un dibujo» o al trabajar con styles/linea/.
---

# Estilo · Línea

En pruebas. Primer uso: `sandbox/2026-09-24-cadaver-exquisito/` (el garabato, 23,5–27,5 s).

## Código

`styles/linea/kit.js` → `Linea`: `stroke(g, pts, { t, seed, width, jitter, closed, fps })`
(trazo que tiembla en doses), `circle`, `paper` (papel con fibra), `drawing(t)` (número
de dibujo), `INK` y `PAPER`.

## Reglas del estilo

- **El temblor es el estilo, pero determinista:** cambia cada 1/12 s con la semilla del trazo
  y el número de dibujo, nunca con `Math.random`. Cada trazo tiene su semilla.
- **Blanco y negro;** el color se reserva para lo que importa (el hilo conductor). Si algo
  tiene color en este estilo, es porque es especial.
- **Personajes de pocas líneas** (cabeza redonda, ojos de punto, cuerpo de palo), con
  poses claras: la silueta tiene que leerse.
- **Grosor 4–6** en unidades de 1600; más fino desaparece al reducir.

## Checklist del estilo

- [ ] ¿El temblor va en doses (no a 24 fps) y es igual en cada render?
- [ ] ¿Solo tiene color lo que debe destacar?
- [ ] ¿Se leen las poses sin detalle?

## Lecciones
