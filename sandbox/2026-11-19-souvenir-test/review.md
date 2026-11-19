# Review · souvenir-test

A new style (souvenir) and its style test: «Recuerdo de Andalucía», the emblem and the dive
through the guitar's mouth into the lemon tree. The reference (a video game's intro
sequence, given by the user for its style only) stays in `out/` and none of its content is
reproduced.

### Round 0 · the study and the plan

**The user:** «I want to make similar art, but not the same. It is only the reference for
the style.» Asked what world ours should paint: «Andalusia, and deep references, some
harder to understand and others less so. Magic, enchantment (embrujo), rootedness, culture,
poetry, art, and so on. We can debate it.» No people for now.

What was measured on the reference before drawing anything (brief.md has the table): one
continuous dive through five nested paintings, each in its own manner and its own hue
family; blacks lifted to 0.21–0.43, lights at 0.73–0.85; near layers far out of focus; a
radial smear through every hole. A script of five pictures of Andalusia was proposed to the
user to debate (brief.md); the test builds pictures 1 and 2 and the way between them.

How the paint was found, in the order it failed:

1. **A distance field as the volume** gave a faceted lemon (a crease along the ridge that
   the light finds). → a balloon over the outline (∇²u = −1, √(4u)), exact for spheres.
2. **A correct sphere looked like a 3D render**: bump-mapped pores read as hammered metal,
   and the gradient was airless. → pores a tenth as deep, a ramp of eight tones with the
   shadows redder and deeper, a raking light so a third of the form is in shadow.
3. **Brush strokes as translucent colour** flattened it again (pale strokes lifted the
   shadows). → strokes painted in greys on mid-grey and read back as tone before the ramp.
4. **Leaves all from one point, all flat to the camera, all the same gloss** read as a
   wallpaper. → shoots (a twig, leaves alternating along it, fruit hanging by its stalk,
   blossom on pedicels at the tip), every leaf at its own attitude, three lights for a
   leaf, a gloss only some have, a broken painted edge.
5. **A dark, moody tree** (median luminance 0.33 against the reference fruit picture's
   0.50). → the far layers are green light, not darkness (0.47).
6. **The emblem manner** (contour + airbrush) was set on the fan: carved sticks, a pleated
   leaf with a face in the light and one in shade on every fold, a garland painted across
   the pleats and shaded by them, lace.

Bugs worth remembering: a hole cut with `destination-out` after a painter that left a
translucent `fillStyle` was only 30 % cut (the lemon tree showed veiled in indigo through
the guitar's mouth); texture tiles pasted one by one left a seam; twelve averaged
exposures of the whip-in showed as twelve ghosts (now smeared along the zoom).

The rest of the emblem (guitar, olive and carnations, swallows and moon, ribbon and key,
castanets, cards and a pomegranate) was painted by five agents in parallel from
`agent-brief.md`, one file each, while the lead built the camera, the lemon tree, the fan
and the embroidery of the night.
