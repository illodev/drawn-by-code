# Reviews · pier-pressure

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

State: **Kit replicated from her approved concept sheet** (`review/kit-ref.jpg`, on the set:
`review/key.jpg`); sheets for the other five generated and waiting for the user's picks. The
earlier character art (the puppet cast in `cast/kit.js`…, `dev/keyart-puppets.js`, Kit by hand
in `cast/kit-hero.js`) is superseded and kept only as history; the set, the kit and `boot3d`
stay. No film yet; the style stays *in testing*.

## Round 0 (user) · the brief

> Quiero crear un nuevo vídeo, de dibujos estilo "Rocket Power", esta será una nueva serie de
> vídeos de diferentes estilos de dibujitos.

> Me gustaría discutir y que me des ideas de personajes originales y ambientación

> Vamos con tus ideas, lo que sí, si van a ser intros quizás lo enfocaría en inglés, con
> nombres en inglés.

> Importante que el nivel de detalles sea máximo

→ A series of fake show openings, one per drawing style; this one in the style of the genre
of the reference, with our own cast and town, in English. Detail first.

## Round 1 (auto) · first figure, a parametric puppet

Measured on the references: line 3–4 px in 2000 (even, hand-held), flat colour, the palette
(`SkateToon.COL`), five-finger splayed hands. Built a kit (`styles/skate-toon/toon.js`) and a
figure (`kid.js`) from a spec and a pose, and lined up six characters.

Seen: the line and the colour were right, the figures were not. Bodies as wide as the neck,
giant loaf shoes, tube limbs, generic heads, flat cut-out hair.

## Round 2 (user)

> Mira la diferencia en el nivel de calidad

(with the reference frame beside the first line-up, which the user saw while it was still
work in progress)

→ The gap was draughtsmanship, not finish. Studied the reference's construction in crops at
3× (heads, bodies, hands, boots) and rebuilt every part:

- **proportions** measured on the standing figures: head a third of the height, shirt two
  thirds of the head's width, shorts to the knee, boots a quarter of the height;
- **clothes** that hang: a shirt from the shoulders with a sagging, rippling hem, flap
  sleeves, shorts like a box with a banded hem, folds, a ribbed collar passing in front of
  the neck, slouchy socks;
- **limbs** as bands with a soft joint and a taper, in one skin with the hand;
- **hands** redrawn from the reference's: fat sausage fingers of even width, a thumb with a
  fat root, a hooked palm crease; a thumbs-up as four stacked curls; a fist with knuckles;
- **boots** with a toe box, a tongue, lace bars, a heel tab, a welt in colour, a tread;
- **mouths** from pieces: separate teeth, the dark, a tongue, a lower lip; a clenched grin
  with both rows;
- **inner lines** almost as heavy as the contour (they were thinner: it read as weak);
- **hair** as chunky shapes with corners instead of thin spikes;
- **poses** with the hips, the shoulders and the head each tilted their own way.

## Round 3 (auto) · the cast at 2× crops

- Kit's fringe as short wide ribbons came out as cabbage leaves → one shape with corners.
- A raised hand was behind the head on three characters → arms raised outwards.
- Fists on hips: the forearm redrawn in front of the body brought a wedge of upper arm over
  the sleeve and a hairline across the elbow (ink under a fill bleeds along a clip edge) →
  the forearm pass starts past the elbow (`armFront: 'fore'`).
- Pip's chin straps across her cheeks made the face unreadable at her size → straps down the
  sides of the face, an open mouth instead of a grin.
- Dot's sleeves stood out like epaulettes → shorter, narrower; her shorts were hidden under
  the apron → to the knee, with a band.
- Milo's armhole lines crossed the shirt's fold lines into two X marks → no armpit folds on
  a sleeveless top.
- `review.mjs` on the sheet (a four-second idle on twos) and on the style's template: no
  warnings, 69 ms a frame.

Hands, looked at as the **hands** skill asks (`dev/handcheck/hands.png`): they follow the
reference's hands piece by piece (which fingers, the thumb's root, the crease); right and
left are mirrors and the thumb is on the side F × N; every digit is whole; each hand is one
skin with its arm (only the thumb lying across a fist keeps its own line); the hand is a
third of the head's height, as measured. Open question for the user: the `point` hand's
folded thumb is a small bump at the side.

Not done yet, on purpose: the set (the sheet stands on a bare quay), the animated style
test, the music.

## Round 4 (user) · the model sheet

> Todavía le falta muchísimo

→ Put the sheet beside the reference at the same figure height. What was missing was not
finish:

- **a line-up of front-facing dolls.** The reference is a scene: every figure in three
  quarters, foreshortened (a boot or a hand towards the camera), overlapping the next one, at
  different depths;
- **symmetrical, cute faces.** There the far eye reaches the head's edge, the nose sits
  between the eyes, the mouth turns with the head, the near ear is inside the outline;
- **bodies still small**: their clothes are as wide as the head;
- **no place.** The reference is a whole set.

Changed:

- the figure (`kid.js`) became 2.5D: `head.turn` is a real three-quarter head (a second
  outline per character, `pts34`, blended in; eyes that part, the far one narrowing out to the
  edge; the nose between them; the near ear drawn inside the outline; a head turned left is
  the mirror of one turned right); `turn` on the body brings the far shoulder and hip in and
  points both feet; boots take `{ scale, view: 'sole' }` (kicked at the camera: the sole with
  its tread) and hands a `handScale`;
- every character: wider clothes (shirt 0.85 of the head's width), a `pts34` outline, hair
  and headgear that ride round with the skull (`Cast.turned`);
- the deliverable is now **key art**, as the reference is: Kit in the air over her board
  with a boot at the camera, Hoagie jumping with his camcorder a beat behind on its strap,
  Milo falling as his board leaves, Pip pointing in the foreground, Dot unimpressed by her
  hut, Captain away with the chip and the cone spilling; a hand-lettered title;
- the set of Gull Harbor drawn in parallel from a written brief (`set.js`);
- Captain got a flying drawing with long feathered wings (the first read as a slab).

The model sheet moved to `dev/sheet/` and still renders with the new figure.

## Round 5 (auto) · the key art on its set

`review/key.jpg`. The set (`set.js`, drawn by a parallel agent from a written brief: the
reference's backgrounds measured first, a calm zone kept for the cast, every coordinate handed
back in a table) came in at the reference's density: Dot's hut with its hatch and counter, the
harbour with two trawlers, a headland of crooked houses, a lighthouse, the pier with its dark
underside, the slipway, foreground pots and a bollard.

Layer and tangent pass at 2× crops, zone by zone:

- Dot stood in front of the hut and behind Pip → she serves from the hatch: drawn clipped to
  the opening, the counter and what stands on it drawn again over her (`Harbor.counter`). At
  first only her head showed above the counter, like a head on a plate → raised until her
  shoulders and the apron's straps show.
- The quay's lamp post rose from beside Milo's standing leg and read as a third leg → moved
  to the head of the slip, its notice with it.
- A background gull sat exactly behind Hoagie's cowlick (a cowlick with wings) → the gulls
  moved into clear sky.
- The spilled cone and its chips lay over Captain's wing → moved between Kit's hand and him.
- Pip's raised arm passed in front of her head and its sleeve covered her mouth → behind the
  head, raised outwards. Her scooter was hidden by the foreground pots → out of this shot.
- Kit's hair and Captain's beak were cut by the frame → both brought in.
- Bodies still small beside the heads → torsos a tenth longer and wider, the figures staged a
  tenth bigger and closer, overlapping.
- A hairline across Captain's neck (a square-cut tube's ink showing along its fill's edge) →
  such ends are filled a hair past their ink (`SkateToon.skin`).

`review.mjs`: no warnings on the key art (71 ms a frame warm), the set alone, the template
and the model sheet. Everything drifts on twos, each figure on its own phase; blinks.

Open, for the user: the title board's design and place; whether the key art's staging is the
level wanted before a shot is animated.

## Round 6 (user) · the key art

> Los personajes siguen siendo muy muy poco cuidados, dibujos muy prematuros

→ Kit beside the reference's jumping figure at the same height showed why, and it was not
something another pass over the puppet would fix:

- **chibi proportions**: in the key art her head was half the figure; the reference's kids
  are lanky (the head a quarter to a third, a long torso, long thin limbs);
- **flat parts pasted together**: a trapezoid for a shirt, flaps for sleeves, legs that never
  showed, a sole stuck on like a sticker; the reference draws clothes as volumes with
  openings (a sleeve is a bell with a hem that goes round the arm);
- **generic shapes**: ellipse eyes, a bowl mouth with pegs for teeth, zigzag hair.

Changed the method: **a character in a pose is one drawing, authored by hand**, contour by
contour, in its own file (`cast/kit-hero.js`, `Hero.kitJump`), not a puppet posed by numbers.
Kit in the air: the head a quarter of the figure, three quarters, thrown back; the tee a long
tube with hoops that bow round it and bell sleeves ringed parallel to their hems; shorts with
a leg opening we look into and the shin coming out of its dark; the kicked boot as a slab
(wall, welt, tread, the upper behind); bunches as fat leaves with strands; a band of teeth
with her gap; a heavier line (1.3× outside, 1.2× inside, as measured against the reference at
the same size). Two rounds against the side-by-side: the first had the head too small, a
teeth band a third of the face, both arms up again; the second is `review/kit-hero.jpg`.

Still short of the reference, seen at 2×: the trailing boot is the kit's profile boot turned
round (its tongue muddles the ankle; her sock is hidden); hands are the chart's, not drawn
for this pose; the face is cleaner but not yet as characterful as the reference's.

Not done: the other five characters and the key art still use the puppet. They are redrawn
this way only if the user says this is the direction.

## Round 7 (user) · Kit by hand, first pass

> Está mejor siguen siendo mejorables: la ropa, las perpestivas (ejemplo zapatos), naturalidad
> y proporción, formas (ejemplo la cara, que no sea tan geométrica), en general las líneas se
> notan muy artificiales

→ Four things, each taken at its root:

- **Lines.** Every contour was one closed stroke of even width through a smooth spline. Now
  `SkateToon.shape/line` have a `hand` mode: a contour is inked in several strokes, one per run
  between corners, each pressed harder along it and lighter where the pen lands and lifts,
  running a little past the corner where it meets the next; the wander is stronger and
  shorter-waved.
- **Shapes.** No primitive is left in the face: the eyes are two different eggs, the pupils
  blots, the teeth six separate teeth of different sizes hanging from the lip (her gap is a
  missing one), the nose a hook, the skull has a brow and a cheek that bulges, bobbles and
  the shorts' opening are authored outlines; freckles.
- **Perspective.** `cast/boot3d.js`: the boot is a small 3D model (a sole slab from its
  top-view outline, an upper in two forms, shaft and vamp, lofted from arches along the foot)
  turned by a toe and an up vector and projected with perspective; silhouettes are hulls of
  the projected parts, the welt, laces, patch and tread are projected lines drawn only where
  their face looks at the camera. The kicked boot is now sole-first with its wall and upper
  to one side; the other dangles toe-down, seen from its side.
- **Naturalness, proportion, clothes.** The trailing leg hangs instead of flicking up (its
  boot had read as a pennant and touched her hand); legs longer than the torso; the reaching
  shoulder rides up; the far hand cleared of the jaw; the tee's sides and hem are no longer
  straight, its hoops thicken and bow more towards the hem; baggier shorts with a seam.

Still short, seen at 2×: the tee and the shorts are simple next to the reference's (few
folds, no trim); the hands are the chart's; the arms are even tubes.

## Round 8 (user) · Kit by hand, second pass

> Todavía se sigue viendo muy poco pulido. Parece que lo ha dibujado un niño.

→ Two causes. The round-7 «hand» line was the wrong reading of «artificial»: wander, uneven
pressure and strokes crossing at the corners are what a child's drawing looks like; the
reference's line is steady, even and clean, and its irregularity is in the design of the
shapes. And, under it, five rounds of designing blind: inventing a drawing by typing
coordinates and correcting it from renders can copy a design well, it cannot produce one with
a draughtsman's polish.

- `hand` mode retuned to a steady hand (half the kit's wander, light pressure, strokes that
  meet at the corner without crossing).
- Asked the user where the design should come from: **generated concept art, replicated in
  code** (chosen), their own drawings, or carrying on blind.
- Generated four model sheets of Kit (standing and jumping, flat colour, on white) with the
  connected image generator, from a description of the manner and of the character (no show
  named). Could not look at them: the image host was not on the network allowlist (added to
  the repo's environment, `elevenlabsusercontent.com`, with the user's approval) and then
  the download itself was denied by the session's permission check. Not worked around.

Next: the user picks a sheet (and it reaches `ref/`); then the replicate method (measure
colours and regions, trace contours, one file per pose, `detail.mjs`-style comparison
against the sheet) for Kit, and the same for the other five.

## Round 9 (user) · the concept sheets

The user attached the four generated sheets of Kit:

> Las 4 están muy bien

→ The design is approved. Sheet 2 is the model (`ref/kit-sheet.webp`; the other three stay in
the uncommitted `private/`). Replicated by measurement, not by eye:

- `tools/trace.py` measures a flat-colour sheet into vector data: the palette from clustering
  and sampled medians; every pixel explained as a flat colour mixed with ink (its ink share
  decides line or fill: nearest-colour alone turned the thin lines, never pure black in a
  720p sheet, into slivers of the dark fills and lost them); dark fills (the mouth, the inside
  of a trouser leg, the deck) told from lines by their thickness; slivers of anti-aliasing
  opened away and refilled; each fill run under the ink to the middle of the line; contours
  taken at sub-pixel precision from smoothed masks.
- `cast/ref.js` draws a pose from that data (`Ref.draw`): fills, then the ink, cached paths,
  12 ms a frame.
- Measured against the sheet at its own size: mean difference 4.8 of 255, 0.8 % of pixels off
  by more than 60 (the first pass, with the lines lost, was 6.65 and 2.4 %).
- `scene.js`: Kit's jump over the quay on the set, drifting on twos, with the title.

Still off, at 2×: the plaster's own lines are gone (thin light-brown on brown); the sheet is
720p, so some corners are a little rounder than a hand would leave them.

Next: the same for Hoagie, Milo, Pip, Aunt Dot and Captain once their sheets are picked; then
split poses into parts (head, arms, legs) for the animation, and key poses per shot.
