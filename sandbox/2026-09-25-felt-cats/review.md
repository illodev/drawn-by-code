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
