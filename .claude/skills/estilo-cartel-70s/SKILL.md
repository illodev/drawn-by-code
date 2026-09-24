---
name: estilo-cartel-70s
description: (En pruebas) Estilo cartel psicodélico de los 70 (Fillmore, Yellow Submarine) dibujado con código. Colores planos y ácidos, contornos gruesos, ecos concéntricos, rayos de sol, formas que ondulan y letras que se derriten. Úsala para vídeos psicodélicos, retro, groovy o de conciertos, o al trabajar con styles/cartel-70s/.
---

# Estilo · Cartel de los 70

En pruebas. Primer uso: `sandbox/2026-09-24-cadaver-exquisito/` (tramo de la seta, 6,5–10,5 s).

## Código

`styles/cartel-70s/kit.js` → `Groovy`: `PAL` (paletas `acido`, `atardecer`, `submarino`),
`sunburst` (rayos a sangre), `rings` (anillos que ondulan), `wavy(pts, amp, freq, fase)`
(el contorno respira), `shape(g, pts, relleno, { ink, width, echoes, echoStep })` (forma
plana con filete de tinta y **ecos**), `ellipse`, `line`, `melt` (texto que cae y se
derrite en gotas) y `path`. Tipografía: Shrikhand (`fonts/Shrikhand-latin.woff2`, OFL).

## Reglas del estilo

- **Planos y ácidos:** sin degradados ni sombras. Cada color lindando con su complementario
  (naranja/magenta/verde ácido/violeta/amarillo). Tinta violeta muy oscura, nunca negro.
- **Contorno grueso en todo lo que es figura**, y ecos de 1–2 colores en lo protagonista.
- **Todo ondula, nada tiembla:** las deformaciones son senos suaves de `t` (`wavy`), no ruido.
- **Movimiento al compás:** balanceo de lado a lado por compás, aplastamiento en cada golpe
  (`Motion.pulse`).
- **Letras:** Shrikhand, con contorno y eco. Cuando se derriten, que caigan gotas redondas
  (pocas campanas), no un ruido de pinchos.
- **Fondo siempre en movimiento** (rayos que giran, anillos que ondulan), pero menos
  saturado que la figura.

## Checklist del estilo

- [ ] ¿Algún degradado, sombra suave o negro puro?
- [ ] ¿Las figuras tienen contorno de tinta y la protagonista, ecos?
- [ ] ¿El derretido se lee como gotas de pintura?
- [ ] ¿La figura destaca sobre el fondo (tamaño, contraste, ecos)?

## Lecciones

- 2026-09-24 · cadaver-exquisito · Un perfil de goteo aleatorio columna a columna se lee como pinchos: gotas = pocas campanas sobre una caída suave (ya en `melt`).
