# Reviews · physics-history

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Round 1

### Round 1 (auto): assembly

**How it was built**

- The piece is one experiment with a file per segment (`segments/*.js`, each an IIFE that
  sets `Seg.<name> = { init, draw, atlas }`). `scene.js` only assembles.
- Newton → Faraday is the approved test (sandbox/2026-09-25-physics-newton-faraday),
  unchanged, wrapped as a segment.
- Galileo, Curie, Einstein and Schrödinger were each built by a parallel agent.
  - All four worked from one written brief: the contract, the quality bar and the user's
    feedback on the test.
  - Each had a dev scene in `dev/`.
  - Each join was given in exact screen coordinates.
- The atlas and the joins are the lead's work.

**The joins**, checked frame by frame at 7.84–8.0, 19.92–20.08, 25.84–26.0 and 31.84–32.0:

| Join | How it works | Checked |
|---|---|---|
| Galileo → Newton | The camera pushes through the amber ring Galileo pencils round Jupiter. The scene draws Newton's first frame inside the ring; Galileo stops drawing his own ring when the scene's takes over. | — |
| Faraday → Curie | Curie's first drawing calls Faraday's own `scale()`. The camera then pulls back: the strip is her electrometer's reading scale, and the beam comes from its mirror. | mean pixel difference 0.84/255 across the cut |
| Curie → Einstein | One track stretches into a full-width amber line at y = 450, which becomes Einstein's light beam (a match cut). | — |
| Einstein → Schrödinger | A single light-blue vertical line at x = 800 becomes the left wall of the box. | — |

**The atlas** (37–40 s):
- Six lenses in brass rims, echoing the first shot's lens, threaded by the amber line in
  reading order.
- Schrödinger's frame shrinks into its lens (his `draw` is his `atlas` from local 5, so the
  swap does not show), while the other lenses open on the quarter beats.

**The automatic review:** no warnings, no still stretches.
- Large jumps are flagged at 1.67–2.5 s (Galileo's cut on the beat at 2.0) and 18.5–19.3 s
  (the push into the dial and the spreading dark, the same as in the approved test).
- Painting takes 470 ms per frame at 960.

**Sound:**
- `music.mjs` is a synthesized score, regenerated rather than committed. At 120 BPM the
  motif gains an instrument per stage: glass → plucked string → brass → granular →
  strings → harmonics, and the whole ensemble resolves on D major at the atlas.
- Every half-second stretch sits between −16 and −24 dB mean.
- Six new ElevenLabs effects sit on their contacts (`audio.json`, onset-aligned):
  - brass ring at 1.08;
  - pencil at 6.5;
  - ball knock at 9.42;
  - magnet in and out at 14.85 and 16.85;
  - the two dishes at 20.92 and 22.92;
  - the sheet at 32.35.

**Lesson:** parallel agents sharing one folder of dev scenes overwrite each other's
`out/stills` and `review/`. Give each dev scene its own folder.

### Round 2 (user)

> Notas sinceras:
> * Se me hace repetitivo los personajes sentados
> * Me falta mucho dinamismo
> * Hay transiciones que no están nada cuidadas
> * Los pesonajes parece que tienen la espalda jorobada y exageradamente desproporcional
> * Sigo pensando que hay muchos espacios vacios y no son de los que se arreglan poniendo estanterías
>
> Creo que el guion no está bien, se me han ocurrido cosas para que sea más dinámico:
> Galileo observa el cielo, parecido a como ahora, pero no en la habitacíon como tal con un
> plano más cercano, se va acercando hasta hacer zoom al planeta que es una manzana, Newton en
> un campo con el arbol le cae la manzana en la cabeza, la coje del suelo y la lanza y se ve la
> perspectiva alejarse del plano mientras la manzana sube hasta empezar a orbitar sobre el
> globo terraqueo, se va conviertiendo en la bobina de Faraday se agranda la imagen de la
> bobina (un poco psicodelico) hasta la escena de Faraday, igual, más cercana y dinámica,
> [escena de marie y epstein], el cubo se va conviertiendo en una caja y aparecen srodinger y
> el gato, la escena se va duplicando por cada probabilidad, gato muerto srodinger vivo, gato
> vivo srodinger muerto, diferentes posiciones, etc así hasta hacer un mosaico de probabilidad
> (tono irónico humor).

What this means:

- **The script changes.** It becomes one continuous chain of transformations with ironic
  humour: the planet is an apple, the apple falls on Newton's head, he throws it into orbit,
  the orbit becomes the coil, the cube becomes the box, and the box becomes a mosaic of
  probabilities.
  - The first brief's precision rules give way here to the user's direction: the apple on the
    head and the cat are now wanted.
- **No more seated figures.** Everyone stands and moves, drawn full body with upright spines
  and real proportions. This needs a proper full-body rig, not busts behind tables.
- **Empty space is fixed with framing,** not with props: closer shots, foreground layers,
  and a camera that travels with the action.
- **The joins are one object turning into the next,** designed by hand, not cuts or
  dissolves.

> (while building) Importante los detalles de las escenas, que las escenas tampoco sean
> totalmente alejadas, y que los escenarios tengan todo lujo de detalles

### Round 3 (auto): style test of script v2, Newton's apple (dev/newton-apple, 7 s)

**Full-body rig** (`figure.js`):
- Poses are a handful of targets; elbows and knees are solved by two-bone IK with fixed
  lengths.
- The figure is about 7.5 heads tall, with a straight back from the neck to the waist, the
  head over the shoulders, a coat skirt flaring to the knees, breeches, stockings with calves
  and buckled shoes.
- The cast's head is reused through `headOnly`.
- Nobody sits except Newton's nap against the trunk.

**Action:**
- The apple hangs and snaps off (0.6).
- The camera rides down with it; it bonks him on the beat (1.5), with little stars.
- It bounces and rolls; he gets up, bends to pick it up (knees bent, hand at the apple) and
  looks at it.
- He glances at the daytime Moon, winds up behind his back, throws overhand (4.5) and follows
  through.

**Framing:** medium shots, cut between the knees and the shins, with the camera travelling
with the action. There is no wide empty frame until the pull-back.

**Set:**
- The old apple tree, drawn in detail:
  - bark ridges, cracks, moss and a knot hole;
  - roots, branches with twigs;
  - leaf clusters with a lit crown and midribs on the leaves;
  - apples on stalks.
- The meadow:
  - blades in tufts;
  - daisies, buttercups, clover and dandelion clocks;
  - windfalls and fallen leaves;
  - mushrooms at the foot of the tree;
  - a cabbage-white butterfly.
- The middle distance:
  - a dry-stone wall with a stile;
  - sheep that graze;
  - an orchard;
  - Woolsthorpe Manor, with mullioned windows, a stone-slate roof and smoking chimneys;
  - ploughed fields and hedges;
  - a post mill with its sails turning;
  - swallows and clouds.

**Pull-back** (Powers of Ten, 4.55–6.9), a log zoom from 1.25 to the whole globe:
- the terrain rolls out in octaves that fade in over their own wavelength;
- copses and a layer of cumulus pass;
- the land band gives way to the globe.

**Bugs found and fixed:**
- A canvas path with coordinates near 1e7 silently drops its fill. The ground is now drawn
  relative to the anchor, never through the Earth's far centre.
- The pull-back's zoom started at 1 while the camera was at 1.25, so the world jumped. It
  now starts from the camera's last key.
- The released apple is placed from the hand, climbs to the top of the frame and stays there
  while the world falls away, then bends into orbit.

The hits sit on the beat and the automatic review reports no warnings. The test is mixed
with effects: pop, boing, knock, whoosh and a reveal.

### Round 4 (user)

> Lo he visto en x0.5 y hay animaciones que no están bien hechas y no cuadran a nivel tanto
> de físicas como de timing, también los movimientos de newton son un poco ortopédicos
>
> La manzana cuando cae desaparece, cuando la lanza, a pesar de haber hecho el gesto de
> lanzar, sale con retardo de la mano, cuando se aleja el zoom el escenario pierde detalles
> (aunque en general me siguen faltando densidad de detalles)

What changed:

**Motion without the stiffness** (`figure.js`):
- Poses are channels (`Fig.track`): Hermite splines through the keys, so velocity carries
  through them and repeated keys hold.
- The torso keeps its length (`Fig.build` derives the chest and head from the pelvis with
  the spine and neck angles).
- Elbows and knees follow moving pole points, so they never flip between solutions.
- Feet stay planted between steps and lift on an arc (`Fig.foot`).
- The acting has anticipation, overlap and settle:
  - he flinches at the bonk, rubs his head and blinks;
  - he gets up with a push off the trunk and one step;
  - he crouches with his knees bent to pick up the apple and stands;
  - he looks at the apple, then at the Moon (a double take);
  - the wind-up goes low and behind, with a step into the throw;
  - the release happens on the beat at the top of the arm's arc, with a follow-through.

**Physics:** the apple's path is computed, not keyed.
- It falls from rest with g (1 unit ≈ 2.4 mm), so the time of the fall sets the snap.
- It bounces off his head with a restitution, lands, bounces once more and rolls to a stop
  with friction.
- The hand's grab key is placed at the apple's resting point.
- The book jolts off his knees and falls.
- After the throw the apple is placed from the hand on the release frame and reaches the top
  of the frame in 0.18 s. The pull-back starts from the camera's last zoom (1.25), so there
  is no jump.
- The trail is the path of the last moments seen at the current zoom (no hook).

**The apple no longer disappears:**
- It hangs alone on a twig that reaches out from the trunk, below the crown.
- The crown leaves sky round it and under it, and the other apples keep out of its column.
- The camera follows the fall and hands over to the bonk framing without a jump.

**Detail kept while pulling back:**
- The near set fades later.
- Then the land takes over at every scale, each drawn while it is a few px to ~140 px:
  - hedgerow trees;
  - farmsteads with red roofs and haystacks;
  - villages with a church spire;
  - market towns;
  - woods;
  - rows of fields receding to the horizon at three scales.
- The sun and the Moon stay put in the sky (they are at infinity).

**More detail in the near set:**
- an orchard ladder against the trunk;
- a wicker basket of apples;
- dappled sunlight on the grass;
- leaves drifting down;
- the crown kept to the left, so the throw has open sky.

### Round 5 (user)

> El lanzamiento se sigue viendo antinatural, es como que la lanza y sube lento y después más
> rápido y sin sincronización es una cosa muy rara. También hay un detalle en la espalda que
> parece que tiene como un hilo que le va de la cabeza al trasero cuando se levanta. También su
> cuerpo al agacharse se ve muy raro, como si se plegara y tuviera unos cuadriceps larguísimos

What changed:

**The throw.** The camera used to lift the horizon (the ground rose towards the apple) while
the log zoom eased in, so the apple read as slow, then fast. Now the camera rides with the
apple:
- Its screen height AY leaves the hand at 260 and settles near the top.
- The ground's screen distance below it, GD, first grows: the apple climbs fast and slows,
  and the ground drops out of frame.
- Then the zoom-out brings the shrinking world back up under it, down to the globe.
- The apple's screen position is explicit while it climbs and hands over to its place on the
  orbit from 5.9.
- The trail is its screen path, stretched by the climb.

**The «thread» on his back:** a seam line drawn in screen axes crossed the leaning torso. It
is gone, and every torso offset (the chest, waist, waistcoat, seams and buttons) is now in
the body's own frame (across and along the spine), so a leaning figure keeps its parts in
place.

**The crouch:**
- The coat's skirt used to lie along the thighs, which read as enormously long quads. It now
  hangs from the waist by gravity, behind the thighs.
- The front panel is short.
- The pick-up is a stoop-squat: pelvis back, torso leaning, the far hand on his knee.

**Lesson (animate / engine):** offsets on a body are in the body's frame, never in screen
axes. Anything that hangs (skirts, hair, straps) follows gravity, not the limb.

### Round 6 (user)

> Mucho mejor, pero la manzana debería tener velocidad desde el principio, aparte debería
> salir en diagonal sería más natural que la lanzara para arriba pero no con un angulo de 90º
> si no un poco para delante

What changed:
- **The apple has its speed from the release.**
  - Its screen path leaves the hand fast (Hermite tangent from the first key).
  - The ground drops away at once: GD goes from 990 to 1400 in 0.12 s.
  - The zoom-out uses a smoothstep in log z, so it starts sooner. The world height h = GD / z
    always grows, so the apple never seems to sink.
- **It flies up and forward, about 20° from the vertical.**
  - The camera pans with it, so the ground slides back while it drops: anchor x = AX − 180·z
    − (GD − 792·z)·0.36.
  - The trail streams along the same diagonal.

### Round 7 (user)

> El lanzamiento ahora está bien, pero tienes que corregir la dirección nueva en los demás
> frames, la manzana va en diagonal, bien, pero de repente va para atrás xd, eso físicamente
> no tien sentido

The cause: the apple's horizontal offset was held in world units, so the zoom-out shrank it
on screen. Its handover to the orbit also pulled it back towards the globe's centre.

What changed:
- **The apple follows one screen path.** It leaves the hand up and forward, rides near the
  top while the world falls away, then from 6.6 falls round the finished globe in orbit.
  Its x only grows until it passes the side of the globe.
- **The ground only slides back,** from 800 to 780.
- **The zoom ends at 6.6.** From there the globe holds still and the apple circles it.

**Lesson:** a move that must read as forward needs a monotonic screen path. Perspective or
zoom can make a correct world path read as backwards.
