# felt-cats · review

## Style test v1 (2026-09-26)

Three felt kittens in one pose (arms out, 3.2 s of the reference) on three sets (desert
diorama, kitchen table, disco). Shown to the user as stills (`style-test.js`).

Fixed on the way:
- Marbled white felt: the soft shadow's «improved» estimate misread the inexact distances
  (smooth unions, squashed ears, a bent brim) as full shadow → plain h/t estimate, shadows
  traced without lumps, the brim built by mirroring instead of bending space.
- A disc of shadow round each cat: the bound cut the penumbra → a 0.1 shell inside the bound.
- Fibres drawn over faces: a near miss counts only once the ray moves away again.

## Round 2 · the model sheet (2026-09-26)

The user: «El gato de la derecha es conocido por estar medio calvo (hay que dejar espacio a
posta en la cabeza)… y por mear mientras baila, siempre va dejando un charco en el suelo».
«El gato de la izquierda no se parece mucho». → the glasses cat got a bare pink crown with
three strands combed over and a growing resin puddle (a floor decal); the ginger got folds,
forehead stripes and cream pads measured on the reference.

## Round 3 · the dance v1 (hand keys by three stretch agents)

Three agents keyed 0–4.1, 4.1–9.3, 9.3–15.84 s against silhouettes (mean IoU 0.70–0.75).
The user: «El baile no se parece en nada al original». Why: the rig had no knees and the keys
were fitted to silhouettes, not to motion; the cats stood stiff while the reference kittens
crouch, lean, shift their weight, bow their heads and swing their paws.

## Round 4 · the dance v3 (measured motion)

- IK rig (`Cats.jointsIK`): knees, feet planted where measured, paw targets, longer body and
  limbs (the reference kittens' proportions), a per-cat scale.
- Keypoints per drawing from a pose model (ViTPose+ AP-10K, private/kp.json): eyes and
  paws are good on faces seen from the front; hips, knees and anything seen from behind are not.
- `solve.mjs` turns them into poses; `track.mjs` fits the rig per drawing to the keyed mask
  (as 2D capsules, ~0.5 s a drawing in node) plus the keypoints, with limits (faces keep
  looking at the camera, nods from the eyes-to-crown measure, bounded depth and lean).
- The opening (bowed heads) and the turn (backs) are danced by the hand keys, crossfaded.
- Silhouette IoU ~0.78 on the checks; the shuffle reads like the reference.

The user on v3: «está gracioso, pero hay fallos evidentes en brazos, movimientos y física…
merece sesiones exhaustivas en otra máquina más potente». **Paused.**

## To resume (on a machine with a GPU)

- Render: SwiftShader here gives ~40 s a drawing at 720 on one core; a GPU makes iterating
  on the full film possible. Render the cats once with alpha and composite the sets.
- Arms: the paw keypoints are weak; measure elbows and paws by hand (or a better animal pose
  model) at key drawings, and give arms their own swing (overlap, follow-through).
- Physics: no weight yet (feet slide, no squash on landings, the hat is rigid to the head);
  add foot locking between steps, a hop's arc, the hat lagging the head.
- The camera: a proper per-drawing zoom and pan track (the hat-width zoom is rough late on).
