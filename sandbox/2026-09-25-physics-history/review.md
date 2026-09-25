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

### Round 8 (user)

> Lo doy por bueno, por ahora

The Newton's apple style test (dev/newton-apple) is approved as the bar for script v2: a
full-body rig that moves on spline channels, physics for everything that flies or falls, a
camera that rides with the action, close framing and dressed sets. The other scenes of v2 are
built to this bar.

### Round 9 (auto): Galileo on the roof (script v2, 0–5 s), joined to Newton's apple

`segments/galileo-roof.js`; dev scene `dev/v2` plays 0–12 s: Galileo, then Newton's apple.

**The set:** Padua in January 1610.
- An altana with turned balusters, posts and finials.
- A hanging lantern with a flickering flame and its glow.
- A black cat on the rail with its tail flicking (the cat Schrödinger will need).
- Beyond, roofs with tile courses, lit windows and smoking chimneys, the Santo's eight domes
  and two bell towers, and the keel roof of the Palazzo della Ragione.
- A starry sky with a soft Milky Way and a shooting star.

**Galileo, standing:**
- He is bent to the eyepiece of a leather telescope with gold tooling, on a wooden tripod.
- His right hand turns the focusing collar (the knurls move) and his left holds the tube from
  below; the elbows hang, through IK.
- He blinks, and his breath steams in the cold.

**The shot:**
1. A slow push-in (0–1.35 s).
2. The camera tilts and travels up the tube (1.35–2.35 s). The near world leaves fastest, the
   city slower, the sky only tilts.
3. Jupiter and its four moons, at their real radii ratios. Nights 0, 1 and 2 land on the
   beats 2.5, 3.0 and 3.5 s: the sky wheels round the pole, the stars streak, the moons move
   one day, and faint rings keep the places they left.
4. A log zoom dives into the disc and its belts. The disc morphs into the apple (4.55–4.85 s):
   the outline, the streaks, the shadow side, the stalk and a leaf. From 4.85 it holds the
   apple at radius 1400 in the frame's centre.

**The join into Newton:** a match cut through the apple's skin.
- Newton's segment now opens with a 0.6 s pull-out, from inside the skin (zoom 1400/30) to
  the hanging apple.
- The frames at 4.92 and 5.0 are identical.

**Checks:** the automatic review reports no warnings. The sound effects are provisional (no
music yet).

### Round 10 (user)

> Empezaría el vídeo con la primera escena de la cara cerca con el ojo del primer vídeo (me
> gustó), que se aleje y ya se vea Galileo alejado y me gustaría que la transición de Galileo a
> júpiter fuera más natural y la transición de la manzana falla en que las líneas de júpiter son
> horizontales y la de la manzana vertical (quizás rotar la cámara?)

What changed. Galileo is now 0–6.5 s, and Newton moves to 6.5–13.5 (the later scenes absorb
the 1.5 s).

1. **0–1.5: v1's macro.** The lens in its brass rim, the amber reflection, his eye, the
   blink, and the point of light gathering in the glass.
2. **1.5: a match cut on the beat** to the roof's close-up of the same eye and eyepiece. The
   camera eases back to the whole scene by 2.6.
3. **3.1–3.9: into the eyepiece.** The camera zooms into the eyepiece by his eye, and the
   telescope's field opens from it: a disc of sky with a brass lip, the tube's dark round it.
   A partial darkening only greys the roof, so the dark comes in at once when the field
   takes over.
4. **In the field:** Jupiter and its moons, the three nights on the beats 4.0, 4.5 and 5.0.
5. **5.1–6.35: the dive.**
   - The field opens to fill the frame.
   - The camera rolls 90° (5.1–6.0), so the belts turn vertical. They were placed where the
     apple's streaks will be, and they narrow into them during the morph.
   - The apple is held at radius 1400: the match cut through its skin into Newton.

**Lesson (transitions):** when one object turns into another, line up their structure first
(roll the camera so the stripes run the same way). A crossfade on a riso press only greys
both images, so use a match cut on the beat instead.

### Round 11 (user)

> La perspectiva de la lente está totalmente mal, tanto al principio, como cuando se mete en la
> lente (peor todavía), antes de meterse en la lente la cámara debería rotar. La transición de
> Jupiter-manzana tiene que ser más suave y progresiva en cuanto a color.

What changed:

- **The telescope is a real 3D object now** (`scope3d.js`).
  - A perspective camera looks at a cylinder of parts: the eyepiece cup, the draw tube, the
    knurled collar, the leather tube with gold fillets, the objective's cell.
  - Circles perpendicular to the axis project as the right ellipses, the sides are the
    tangents of the end circles (a convex hull), rings show only on their visible half, and
    the parts are drawn far to near.
  - The eyepiece's face is a brass rim with knurls and dust. Its glass has concentric
    reflections in the glass's own plane, the amber candle's reflection, and the point of
    light.
- **The camera turns before going in.**
  - 0–1.5 s: the macro, a three-quarter view of the 3D eyepiece beside his eye.
  - 1.5 s: a cut to the roof.
  - 3.5 s: a cut back to the macro's framing. Then the camera orbits round the eyepiece until
    it looks straight down its axis (3.5–4.25 s), closing in while his eye slides out of
    frame.
  - The sky opens in the glass from its centre, and the eyepiece keeps closing in until its
    rim leaves the frame for the dive.
- **Jupiter ripens into the apple** (5.75–6.85 s).
  - The colour goes from cream through ochre and orange to red, as screens first and solid
    ink at the end.
  - The belts narrow and turn yellow, and the shadow side comes in progressively.
  - The shape morphs last (6.5–6.85 s).
- **Timing:** Galileo is now 0–7 s and Newton 7–14 s.

**Lesson (animate):** a round mechanical object seen at an angle (a lens, a wheel, a tube) is
drawn as 3D geometry projected with a camera, never as hand-placed ellipses. Only a projection
keeps the face, the sides and the rings consistent while the camera moves.

### Round 12 (user)

> La transición de esas 2 vistas no está bien. También veo que Galileo tiene el telescopio
> detrás de la frente

What changed:

- **The telescope is in front of his face.**
  - The eyepiece now sits on his near eye, and the telescope is drawn after the head (the
    tube passes in front of the brow).
  - The roof's telescope is now the same 3D model as the macro's (`Scope3D`, seen almost from
    the side and nearly orthographic), so both shots show one object.
  - The near hand moves along the tube, clear of his face.
- **The cut matches.**
  - In the macro he leans in until his eye meets the eyepiece (1.05–1.5 s), and the macro's
    tube rises at the roof tube's angle.
  - The roof's close-up after the cut puts the eyepiece at the same place on screen, on his
    eye, with the tube rising the same way.

### Round 13 (user)

> Hay mejorado un poco, esa transición sigue estando mal, ocurre muy rápido y la perspectiva
> está mal. Las manos son horribles, no pueden estar peor hechas. Por favor, puedes prestar
> atención a los detalles? Animación, transición, perspectivas, manos, que todo tenga sentido,
> si dura más que dure

What changed:

- **One continuous shot, no cut** (Galileo is now 0–12.8 s).
  - A new detailed head (`head-galileo.js`) is built round the macro eye, with real
    proportions (thirds of the face, the ear behind the jaw, receding hair with strands, a
    short beard and moustache), so the opening macro and the wide shot are the same drawing.
  - The camera is a real one: a perspective view of the 3D telescope that dollies back from
    the eye (2.2–5.4 s, slow and eased) to the whole scene, with the man on the plane through
    the tube's axis. Far layers scale by their depth, the stars do not.
  - At 6.3 s he pulls back from the eyepiece, astonished (brows up, mouth open); the camera
    then closes in and turns round behind the eyepiece into his place (6.6–8.6 s), and the
    glass opens into the field.
  - The nights and the dive into the apple keep their beats, later and a little slower.
- **Hands redrawn** (`hands-galileo.js`), in the tube's own projected frame so they sit on it
  at any size.
  - Right hand: palm up under the tube, fingertips hooking over the top edge with nails, the
    thumb lying up the near face, the heel and wrist into a white shirt cuff.
  - Left hand: palm up under the tube, four fingers curling up the near face with knuckle
    wrinkles and nails, the knuckles' row underneath.
  - Sleeves of the gown with IK on screen, a lit edge and creases at the elbow; the gown
    has a doublet with buttons and a white falling collar.
- **Sound** follows the new beats (the lean, the pull-back, the collar, the surprise, the
  camera going into the eyepiece, the glass, the three nights).

**Lesson (animate):** a macro-to-wide move of one subject is one camera over one drawing at
full detail, never a cut between two drawings; hands on a 3D prop live in its projected frame;
to take a character's point of view, move the character out of the axis first.

### Round 14 (user)

> Viendo las imágenes las manos están mal, el pulgar está cortado y los dedos de la otra mano
> también. Además la mano derecha está al revés de como se tiene que agarrar algo de forma
> natural

What changed:

- **The right hand closes round the tube** the way a raised tube is really held. The back of
  the hand faces the camera, with the knuckles' row near the top edge, tendons and a vein.
  The fingers go over the top and away, and the thumb wraps round under the tube.
  - Before, the palm faced up under the tube, and the thumb lay up the near face and ended
    in the open.
- **The left hand holds from the far side.** Only its four fingers show, curling over the top
  and down the near face with nails and wrinkles. Its wrist and cuff are behind the tube,
  drawn before it so the tube hides them.
  - Before, the fingers ended abruptly at the top edge.

**Lesson (animate):** hands on a prop start from how a person really holds it (a raised tube:
a power grip, fingers over the top, thumb under). Every digit is either drawn whole to its tip
or goes out of sight behind the prop; a digit never ends in the open.

### Round 15 (user)

> Ahora está bien. Me he dado cuenta que en la de Newton el sol está anclado a la pantalla

What changed:

- **Galileo approved** (rounds 13–14).
- **Newton's sun and daytime moon are part of the sky now**, not stuck to the screen. They
  are a far layer: the camera's pans and tilts move them (a quarter of the world's motion),
  so the sun drops as the camera tilts up after the apple, and the zoom-out shrinks them
  gently before they fade into space.

**Lesson (animate):** an object at infinity keeps still only under a pure dolly. When the
camera pans, tilts or zooms to follow the action, the sky moves too; give it a far-layer
share of the motion, or it reads as pasted onto the screen.

### Round 16 (Faraday, and the user on the hands)

> Seguimos

> Veo que la mano está fatal (Faraday), está al revés! Y además divides la mano en
> secciones con bordes. También me he dado cuenta que Galileo tiene el dedo gordo de la mano
> derecha como si fuera la mano izquierda. Son errores muy tontos no?

What changed:

- **Faraday's coil (`segments/faraday-coil.js`, 11.2 s, after Newton).**
  - The apple speeds round the Earth and its trail winds into a helix. The camera turns a
    quarter round and the helix is a copper coil (`coil3d.js`, a real 3D helix).
  - The Earth, a magnet itself, opens its field lines and takes a north and a south pole.
    Then it stretches into Faraday's cylindrical bar magnet inside the coil.
  - The magnet slides out, and the camera swings to the coil's end and flies in.
  - An iris of rings in the four inks hides the switch from the orbit's world to the
    laboratory (the same coil, 5.57 times smaller). It opens on his hand holding the magnet
    and draws back to the bench (`lab-faraday.js`, a 3D set drawn as tiled cards).
  - In: the needle kicks. Held: nothing; he leans in, frowning. Out: it kicks the other way,
    under his nose. In hard: a spark across the gap (only the fast thrust gives it: the spark
    fires on the induced EMF).
  - The camera goes into the spark's light, as solid rings of blue-green: the join to
    Curie's radium.
- **Faraday's head** is the profile of the approved test (`Cast.faraday`, now with a
  `headOnly` option, a frown, raised brows and an open mouth), consistent with Newton. A
  realistic three-quarter head was tried and dropped: it read as a mannequin.
- **Hands:** the right hand had a left hand's geometry.
  - Checked by holding a real bar: a right hand holding a bar that points forward, seen
    from its right side, has its thumb on top pointing forward, its fingers curling under
    and its index in front.
  - `GalHands.near` is redrawn that way for Galileo and Faraday.
  - The far (left) hand reaching over has its index towards the body; its finger order was
    reversed and is now fixed.
  - The hand is one skin: its pieces are inked as one, with no outlines between them, only
    creases and a faint outer edge.

**Lesson (animate):** before drawing a hand on something, hold the object with your own right
or left hand the same way and note where the thumb and the index go. Mirror errors are not
visible in a single piece, only against a real hand. A hand is one skin: never outline its
parts.

### Round 16b (user)

> Ya te adelanto que has empeorado las manos y no te has enterado de mi revisión de antes

The grip depends on where the forearm comes from, and I had changed the whole grip instead
of the thumb's side.

- **Galileo:** the forearm comes up from below, nearly upright, with the palm against the
  tube's far side. So the right hand's thumb points back towards his face and wraps under the
  tube; the fingers go over the top, with the index next to the thumb (`GalHands.over`). Round
  14 had this grip mirrored: the thumb pointed forward, as a left hand's would.
- **Faraday:** the forearm comes from behind, along the magnet. So the torch grip is right
  for him (`GalHands.near`): the thumb on top pointing forward, the fingers under.
- Both hands are one skin, without outlines between the pieces.

**Lesson (animate):** a grip is decided by the forearm's direction and the palm's side, not by
the object. Hold the object with your own hand in the character's pose, forearm included,
before drawing. When the user flags one detail (the thumb's side), fix that detail; do not
redesign what was right.

## Script v2 · Einstein, Schrödinger, the whole film

- **Einstein:** the neat young hair read as Tesla; his own tousled hair and a bushy moustache,
  pushed bigger for a small head (`bold`), read as Einstein. The fists became a right hand
  from the thumb's side, with thick creases that survive the halftone; the forearm now stays
  ahead of the elbow. The Sun was replaced, at the user's idea, by a black hole: the grid
  (a corridor Lorentz-contracting and bunching forward as they speed up) swirls into it, the
  ray is swallowed, runners and cat are stretched towards it and fall in while the camera
  dives, rolling, to black; the cube then cuts in edge by edge on the black.
- **Schrödinger:** a wooden crate and then a transparent diagram did not convince. The user's
  idea carried it: the box closes opaque, the Geiger counter clicks, a scan turns the frame
  into a radiograph (the cat's skeleton, `Cat.xray`), reality splits into 2–16 worlds, and when
  Schrödinger lifts the lid they collapse into one: the cat peeks over the rim and looks at us
  (`Cat.peek`). Fixed on review: the X-ray tail left the box, the box's borders crossed the cat.
- **Film:** all six scenes in `dev/film` (57.8 s) with an ElevenLabs score (one section per
  scene, ducked for the dive into the black hole) and 67 effects.

**Lessons:** see the 2026-09-25 physics-history v2 lines in animate, style-risograph, sound
and engine.
