---
name: estilo-caleidoscopio
description: Estilo caleidoscopio: simetría radial con espejos, piezas que salen del centro, rotación y ciclos de color. Úsala para clímax psicodélicos, mandalas, visuales de música en bucle o al trabajar con styles/caleidoscopio/.
---

# Estilo · Caleidoscopio

Aprobado. Referencia: `sandbox/2026-09-24-cadaver-exquisito/` (clímax, 18–22 s).

## Código

`styles/caleidoscopio/kit.js` → `Kaleido.draw(g, env, { source, n, cx, cy, rot, scale,
hue, sat, key })` convierte en caleidoscopio lo que pinte `source(g)`: se ve la cuña de
ángulo 0..2π/n alrededor de (cx, cy), repetida y en espejo. `Kaleido.beads` pinta un anillo
de cuentas.

## Reglas del estilo

- **Las piezas cuentan una historia:** usa pedazos reconocibles de lo que ya ha salido
  (ojos, sombreros, manchas, el hilo conductor), no confeti genérico.
- **Hipnótico, no estroboscópico:** giro global ≤ 0,3 rad/s, piezas a 60–120 unidades/s.
  La energía la dan el pulso en cada golpe (`scale` × `Motion.pulse`) y un cambio de tono
  en un golpe fuerte.
- **Un cubo en el centro sin espejo** (el hilo conductor) para que el ojo tenga dónde
  descansar.
- **El fondo de la cuña, bandas oscuras** que salen del centro, pintadas de mayor a menor.
- Tras `hue-rotate`, sube `saturate` (1,3–1,5): si no, los colores se ensucian.

## Checklist del estilo

- [ ] `review.mjs` no da **Destellos**, y los «saltos grandes» no molestan al verlo.
- [ ] ¿Se reconocen las piezas?
- [ ] ¿Hay un centro donde mirar?

## Lecciones

- 2026-09-24 · cadaver-exquisito · A 0,55 rad/s y 240 u/s el caleidoscopio cambiaba casi entero cada 1/6 s: más lento se ve mejor y sigue pareciendo un clímax.
