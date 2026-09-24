---
name: transiciones
description: Transiciones entre planos y entre estilos en illomotion (engine/transitions.js): entrar por un punto (ojo, boca), iris, engullir, vórtice, cuadro dentro del cuadro, bola de papel. Úsala al enlazar dos planos o dos estilos distintos, en vídeos «cadáver exquisito» o cuando un corte en seco se queda pobre.
---

# Transiciones

Referencia: *Rick and Morty · Exquisite Corpse*. Cada tramo lo hace un estudio distinto y
**nunca hay un corte en seco entre estilos**: la acción continúa y la transición pasa
**a través** de algo del plano (un ojo, una boca, un cuadro, unas nubes).

## Reglas

- **La transición es un plano**, con su propio hueco en `shots` (1–1,5 s) y cortes en golpe.
- **Pasa a través del hilo conductor** (el objeto o personaje que une los tramos) o de algo
  que ya estaba en el plano de salida. Si la transición no sale del plano, es un fundido
  con otro nombre.
- **El borde de la transición es del estilo de salida** (el borde de las nubes de esporas
  es de cartel de los 70; el borde de la bola de papel es de papel): así el cambio se lee
  como algo que hace el mundo A, no la edición.
- **Primero se ve el punto y después el mundo nuevo** (`enter` con `fadeIn`): si el portal
  sustituye al ojo en el primer fotograma, se lee como un disco plano.
- **El hilo conductor no desaparece nunca**, ni en el fotograma más pequeño del vórtice.
- Varía: no repitas la misma transición dos veces seguidas.

## Catálogo (`Trans.*`, cargar `engine/transitions.js` en `uses`)

| Función | Qué hace | Cuándo |
|---|---|---|
| `enter(g, env, u, { a, b, cx, cy, r0, zoom, spin, fadeIn, edge })` | La cámara empuja hacia un punto de `a`, que viaja al centro; dentro se abre `b` girando | Ojos, bocas, cerraduras, pantallas, agujeros |
| `iris(g, env, u, { a, b, cx, cy, edge })` | `b` crece en un círculo desde un punto, sin cámara | Algo que se abre o se despliega (una bola de papel, una flor) |
| `engulf(g, env, u, { a, b, origin, seed, count, puff })` | Nubes que salen de un punto y tapan `a`; dentro ya está `b` | Estornudos, humo, tinta, espuma, explosiones |
| `vortex(g, env, u, { a, b, cx, cy, turns })` | `a` se retuerce en espiral y se encoge a un punto | Remolinos, desagües, portales; buen paso a un clímax |
| `frame(g, env, u, { inner, outer, at, rim })` | La cámara se aleja: `inner` era un cuadro, un dibujo o una pantalla dentro de `outer` | Revelaciones («era un dibujo»), galerías, pantallas |

`u` va de 0 a 1 (`Ease.seg(t, inicio, fin)`); `a`, `b`, `inner` y `outer` son funciones
`(g) => void` que pintan su plano a sangre. `Motion.layer(env, nombre, fn)` pinta un plano
en un lienzo aparte cuando la transición necesita deformarlo como imagen.

Ejemplo completo con las cinco, más una bola de papel que se arruga y se abre:
`sandbox/2026-09-24-cadaver-exquisito/scene.js` y `tramos/garabato.js` (`Tramo.bola`).

## Lecciones

- 2026-09-24 · cadaver-exquisito · En `engulf`, los bordes de las nubes se pintan antes que `b`; si no, cada círculo deja su aro entero y sale una maraña (ya en el motor).
- 2026-09-24 · cadaver-exquisito · Todo lo que se deforma con recortes (arrugar, rasgar) se recorta también al rectángulo del plano, o asoman trozos fuera de la hoja.
