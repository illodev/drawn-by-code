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

### Round 1 (auto) · the emblem assembled

The five agents came back in about 40 minutes, all at the bar on their first pass (their
reports are summarised in the style skill): a flamenco guitar with a rosette of Granada
marquetry and its maker's label inside the mouth; olive arms with olives in three
ripenesses and carnations built petal by petal; two swallows of about 150 pieces each, a
moon painted on a sphere with its real seas, eight-pointed stars; the ribbon as one strip
of cloth with «SONIDOS NEGROS» set on its curve, an old gilt key, a horseshoe; castanets
with their cord and tassels, three aces of the Spanish deck, a pomegranate with seventy
arils.

What I saw on the first assembly, at full size, and what changed:

- **The moon sat on the fan** (its earthshine read as a dark blot on the silk) · 2.6 s ·
  → moved to the one corner of sky the fans leave, with three stars.
- **The ribbon was cut by the bottom of the frame** and too near (its layer was 60 in
  front) · whole hold · → its own layer 20 in front, higher, and the camera looks 52 units
  below the axis during the hold, coming back onto it to go through the mouth.
- **The olive was hidden behind the fans** · → two arms hugging the guitar, in front of
  the fans' sticks, behind the carnations at the waist.
- **A swallow's wing lay across the moon, the other across the pomegranate** (tangents:
  each read as part of the thing behind) · → both birds moved clear.
- **An idea found while composing:** the key had no place of its own, so one swallow now
  comes back with it in its bill (Bécquer's swallows return; the key of the house that
  was left). First placed by eye it hung 30 units from the bill: read off a render, moved,
  checked at 1:1.
- **Flat frames at 0–0.5 s** (`review.mjs`: a single colour) · → the night has its stars
  from the first frame; they stream outwards when the camera leaves.
- **The flare was a stock lens flare with two long arms** · → an eight-pointed star, four
  long rays and four short.
- **The rosette was never seen large and sharp**: the camera crossed the last 900 units in
  a few frames and the smear ate it · 3.8–4.0 s · → a key at 3.92 s makes the approach
  linger on the mouth (the guitar grows to twice its size in half a second) before the
  0.7 s plunge.

`review.mjs` after this: no warnings but the two large jumps at 3.83 and 4.00 s, which are
the dive itself. Deterministic.

Known and left for the user to judge (not evident faults, choices):

- No sound yet. The reference's own is not used; a score would be generated only with
  the user's go-ahead.
- The lemon tree's blossom is smoother than its leaves; its twigs are thin.
- The capitals of the motto take 41 % of the ribbon's face, not the half that was asked
  (the text is wide in this typeface); the ribbon was lengthened to 980 instead.
- The agents' good helpers (airbrush and contour for `form` sprites, turning geometry
  instead of the canvas) still live in their own files: to move into the kit before the
  next picture is painted.
