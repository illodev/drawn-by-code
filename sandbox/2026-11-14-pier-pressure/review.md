# Reviews · pier-pressure

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

State: **the whole opening, cut to the theme song: a first pass** (round 22): `scene.js` (the
edit and Kit's drop) + `film.js` (the other eleven shots), 31.75 s, `render/pier-pressure.mp4`
(silent copy; with the song: `out/`, not committed), `review/sheet-1.jpg`, `sheet-2.jpg`. Waiting
for the user's verdict. Only Kit is animated from key poses; the other five move between the two
drawings of their model sheets. Check any pose against its sheet with `dev/fidelity/scene.js` +
`tools/fidelity.py`. The set is approved up to round 16. The style stays *in testing*.

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

Sheets for Hoagie, Milo, Pip, Aunt Dot and Captain were then generated in the same flow
(`IZ6WMwgNs2KXvoLAzy0H`), four variants each, with Kit's approved sheet wired in as the style
reference so they come from the same hand. Cost: 433 credits a variant with a reference (190
without), 8,660 for the twenty; Kit's four were 760. The session still cannot download them:
the user attaches the pick for each and it goes to `ref/<who>-sheet.webp`, then
`python3 -I tools/trace.py ref/<who>-sheet.webp cast/<who>-ref.js <who> stand=x,y,w,h …`.

## Round 10 (user) · image or drawing?

> Pero es una imagen o un dibujo?

> No podríamos pasarlo a código?

→ The round-9 replica was honest vector data but a blob: thousands of anonymous polygons, the
ink a filled stain like any colour, one rigid piece per pose. Now it is a drawing written as
code:

- `tools/tocode.py` writes `cast/kit-drawn.js`: each flat colour is a shape of control points
  (`[x, y]` smooth, `[x, y, 1]` a corner; corners where the contour turns more than 52°), each
  line a **stroke along its centre** (the ink's skeleton, walked from node to node, the
  pixel staircase averaged away) with its own measured width, the solid blacks (pupils) as
  shapes; 154 shapes and 744 strokes for the jump, 208 and 840 standing; every one assigned
  to a body part (head, armL, armR, torso, shorts, bootNear, bootFar, board).
- `cast/drawn.js` (`Drawn.draw`) compiles them once through `SkateToon.path` and paints all
  fills, then all strokes with the engine's own line, each inside its part's transform: a
  part turns about a joint without its line being painted over by a neighbour. 20 ms a frame.
- Against the sheet: mean difference 5.4 of 255, 1.3 % of pixels off by more than 60 (the
  polygon copy was 4.8 and 0.8 %: the strokes are the engine's line now, not the sheet's
  pixels).
- `scene.js`: Kit over the quay, drifting, her head, arms and boots each turning a little
  about their joint on twos. `render/pier-pressure.mp4` (4 s, no sound), strip and GIF.

Faults found and fixed: a part's region drawn too tight left some of its strokes on the
neighbour (a ghost of the hand's outline, then of the boot's top, when the part turned) →
regions redrawn generously, in the order they are tested.

Still off: where a turning part meets the still one (the sleeve at the shoulder) the line
doubles by a pixel or two at the extremes; the plaster's own lines; parts are regions of the
sheet, not yet a rig (no elbows, no mouth shapes): a shot needs its key poses drawn.

## Round 11 (user) · the other five, and what went monochrome

The user sent a zip with all 24 generated sheets (no picks: the choice was left to me) and,
on Kit:

> Hay cosas, como la tirita y algunos detalles que se han quedado monocromo

→ Picks, one per character, by the cleanest line and the clearest two poses: Kit 2 (as
before, now from the lossless PNG), Hoagie 3, Milo 2, Pip 2, Aunt Dot 2, Captain 2
(`ref/<who>-sheet.png`).

What had gone monochrome, and why: details drawn in a darker tone of their own colour, one
sheet pixel wide (the plaster's outline and seams, eyelets, a seam), are neither a flat colour
nor half ink, so the measuring read them as anti-aliasing and cleaned them away; thin dark
stripes that are not black (navy on a sock) came out as black ink; and a dark magenta sat just
under the «dark fill» threshold and was repainted with the nearest light red (Kit's bobbles).

- `tools/measure.py` (replaces `trace.py`): the palette is clustered per sheet from the pixels
  of flat areas only; a ridge of the ink share (higher than a pixel away on both sides) is a
  line even when faint, and the shoulders of strong lines are not ridges, so nothing thickens;
  a patch holding a little ink but clear of every line becomes a colour of its own; the
  dark-fill threshold lowered.
- Strokes carry their own colour when they are not ink (`L(points, width, closed, colour)`):
  the plaster's seams are brown, a sock's stripe navy.
- Page seen through a figure (between an arm and the body, inside the camcorder's strap,
  through Pip's scooter) was painted as white cloth: such holes are listed per character
  (`HOLES` in `tools/tocode.py`), found by marking every enclosed pure-white region on the
  sheets and looking (eyes and paper cones are such regions too and stay white).
- `tools/tocode.py all` writes the six drawings; `dev/cast/scene.js` lines them up.

Limit that remains: the sheets are 1280×720, so a one-pixel detail is at the edge of what can
be measured; the plaster now has its outline and part of its seams, not all. Sheets at two to
four times the size would settle it.

Round 11, continued. Getting there took four wrong turns in the measuring, each found by
rendering and looking, not by the numbers:

- the first ridge rule also caught the shoulders of strong lines along a jagged edge: on
  Pip's thinner-lined sheet every outline thickened and broke into grey strokes → faint lines
  are looked for only well clear of the strong ones, and must be long;
- classifying dark colours through the ink-mix model hollowed the lines (a line's heart
  fitted «dark grey with a little ink») → a pixel that is one of the sheet's colours in an
  area thicker than a line is that colour, directly; near-ink colours never explain a mix, and
  a dark colour explains a pixel only beside its own fill;
- thin stripes of a palette colour (a red welt) were taken for faint lines and came out
  blotchy → a pixel that matches a palette colour is a fill, however thin;
- Milo's dark red glasses came out black twice: the frame is a band three pixels wide, never
  «flat», so its colour was not in the palette at all → the palette also looks for colours
  with a hue that nothing explains (neither a colour found, nor a mix of two).

And one thing authored by hand: `cast/kit-details.js` (`Drawn.add`) draws Kit's plaster in
both poses (band, outline, two seams, dots), after the sheet at 14× with a grid. A one-pixel
detail on a 720p sheet cannot be measured; it can be drawn.

`dev/cast/scene.js`: the line-up at relative heights and the six action poses. `review.mjs`:
no warnings (25 ms a frame with all six). Kit against her sheet: 4.8 / 255.

Still off: the tape on Milo's glasses lost its cross; a red speck on his neck; Kit's plaster
sits a little high in the jump; only Kit is split into parts.

## Round 12 (user) · go on to the first shot; the harbour's details

> Vale, sigue con el primer plano animado. Una cosa, en el plano del puerto hay muchos
> detalles que están mal

The user did not say which. The set alone, rendered at 2.4× and read zone by zone, gave:

- the near palm was the kit's sketch palm at 430 high: angular blades, a hard dark blob
  beside the traced cast → a palm drawn for the set (`palmTree`: a bowed, ringed trunk,
  fronds that droop with leaflets cut along the lower edge, far ones darker, coconuts, a half
  barrel for a planter), smaller, clear of where the cast plays;
- the crane's lattice jib across the houses read as scribble → out;
- a far palm stood exactly behind the trawler's mast (the mast grew leaves) → moved;
- fish boxes stood on the lamp post's foot → moved; the lamp post moved clear of Kit;
- the slip's foam was a thick white bank → a thin lip along the waterline;
- the menu's prices («TEA 50») → plain ones.

Not touched, and maybe what the user means: the pier does not join the quay (its root is
off frame), the slipway reads through its props more than its form, the far town is finer
and busier than the genre's distant buildings. Asked the user to point at what is wrong.

The shot (`scene.js`): the quay, quiet for a beat and a half; the board and then Kit come in
from the top left, falling on twos; she lands on beat 4 (the frame shakes three drawings,
squash and stretch, dust, impact ticks), Captain hops off his bollard and Dot looks up; her
name card slams in on beat 5; she keeps the beat (thumb, head) to the end. Kit's fall is her
jump drawing with its parts turning; the landing is her standing drawing, whose board is the
one that fell (`only: ['board']`). `review.mjs`: no warnings.

Seen and fixed on the way: holes at the frame's edge during the shake (the set is drawn 4 %
bigger while it shakes); Kit small and far (now 0.98 of her sheet, the size of the frame's
height); the palm's crown behind her hair; the lamp post through her arm.

Still off: the fall is one drawing sliding (no anticipation, no in-between from jump to
stand: one drawing changes into the other on the landing frame); Captain's hop is his
perch drawing lifted, wings shut; no sound.

## Round 13 (user) · the harbour's perspective

> Hay algunas perspectivas que están mal. Por ejemplo la palmera parece que está cerca, pero
> es enana. El cartel de Gull Harbor creo que la perspectiva no está bien. Hay cosas como lo de
> BAIT que parece un cartón, no tiene ni profundidad ni la pespectiva creo que sea correcta. La
> barco de la derecha? Es de juguete? parece un barco de juguete que está de costado contra el
> suelo. Lo que te paso en imagen no sé exactamente qué es pero la cuerda atraviesa y se
> superpone. La tabla de la mesa creo que tampoco tiene buena perpectiva. Creo que hay más
> cosas que o no tienen buena perspectiva o no tienen el tamaño correcto o se superponen con
> otra capa

(with a crop of the foreground: the coil of rope drawn through a lobster pot)

→ Every item has one cause: the set was drawn by eye, with no camera. Measured against the
cast: the horizon is at y = 552 and Kit (1.4 m) stands 677 units tall with her feet at 842,
so the camera is 0.6 m above the quay, and a thing standing on the quay at screen y is
(y − 552) / 0.6 units per metre. By that scale the potted palm was 1.1 m tall, the chip hut
1.6 m to its eaves, Aunt Dot in her hatch 1.2 m; and the pier was drawn as seen from below
though the camera looks down on its deck, which is why its sign and the bait shed could only
be flat cards.

- `cam.js` (`Cam`): the film's one camera (pinhole, 0.6 m up, level, horizon 552, focal
  1200), world in metres; `pt`, `scale`, `ground`, `poly` (near-plane clipping), `box`
  (visible faces, far to near), `circle`, `ring`, and the cast's heights.
- The set is being rebuilt on it by a parallel agent from a written brief (the user's words,
  a table of real sizes, the layout redesigned to work in this camera, guides with a metre
  grid and reference figures, the same `Harbor` contract).

Round 13, continued. The set came back rebuilt (`set.js`, every object placed in metres and
projected; its plan is the comment block at its top; `dev/set/scene.js` has guides: a metre
grid and figures 1.4 and 1.8 m tall). The user's six items, checked in the render:

1. palm: 5.6 m, behind the hut, its crown out of the top of the frame;
2. GULL HARBOR: a 3.1 × 1.4 board on 4.1 m posts at the pier's entrance, its lettering mapped
   onto the board's projected quad;
3. BAIT: a box on the pier's deck with a gable, a side wall, a roof, a door and a window;
4. the boat: a 3 m dinghy upright on its keel on a trolley, taller than a kid;
5. rope and pot: two pots and a coil lying beside them, drawn far to near;
6. the table: a projected circle at 0.75 m, seen edge-on from a 0.6 m eye.

And the hut is 2.4 m to its eaves with Aunt Dot 1.8 m inside it; the pier is seen from above.

Then by the lead: the foreground props filled the frame's bottom (pots at X −1.4, a cone in
the middle) → moved out to the corners; the cast staged through the camera (Kit 1.4 m at
Z 2.6, a little left of the pier's board, which she covered; Dot at her spot inside the hut,
clipped to the hatch's quad; Captain 0.46 m on the bollard's top, placed by his feet measured
on his sheet: he first stood 25 units in the air on a slice of his own drawing's bollard).

Left as it is: from 0.6 m up, the harbour's water only shows as a thin band beyond the quay
and the pier's piles are hidden under its deck; the far trawler is small. True to the camera;
a higher camera would show more sea (a choice for the user).

## Round 14 (user) · five small things in the harbour

> Creo que hay unos pequeños que estám mal: El pico del bote (parece como si estuviera roto o
> faltara por dibujar), la cuerda (parece en 2D, ek lugar de 3D), el cartel de menu se
> superpone con la barra, la cuerda del amarre también parece 2D, el dibujo blanco del cono
> parece como si se viera la parte de atrás del cono.

- **The dinghy's bow** really was not drawn: at the stem the hull's half-breadth is a power of
  a cosine that comes out −1e−17, so every point at the stem was NaN and the last plank of the
  bow, the end of the sheer strake and the stem were silently skipped. `Math.max(0, …)`; the
  strake and the plank lines now run to the stem, which has its post. (The trawlers' bows
  were missing their last plank for the same reason.)
- **Rope** was a flat band with hatch marks. It is now laid strand by strand, each a fat
  slanted lozenge over the last, so its edges are scalloped and it has volume; the coil is
  six turns of that rope in three layers, the bollard's turns stand proud of the post.
- **The menu board** stood in front of the counter and, being as tall as it, crossed its edge
  on screen: now a pavement board 0.8 m high, lower than the counter, by the hut's corner.
- **The cone's white bands** were the hull of two whole rings, which shows the far half of the
  upper ring, as if we looked into the cone: a band is the surface between the two arcs that
  face the camera (`lathe`: also the lighthouse's bands and the piles').

## Round 15 (user) · the ropes

> Creo que las cuerdas no han quedado realistas

→ The round-14 rope (overlapping slanted lozenges) read as scales or a string of beads. Looked
at what a laid rope is before drawing it again: a smooth tube of even thickness; its strands
show as S-shaped lines that cross it on the slant and run tangent to its edges at both ends
(a helix on a cylinder, seen from the side); a coil is turns of the same size piled up, each
showing as a band under the one above; a line made fast is turns side by side whose ends
round off where they go behind the post.

- `rope` in `set.js`: the tube (fill, its two edges, cut ends closed only where asked) and
  one S per strand as a Bézier whose ends are tangent to the edges; thickness per point from
  the camera (`rope3`).
- The coil: five turns piled, each its near stretch and (for the top two) its far stretch,
  stopping short of the ends, with a round shoulder at each end (a band drawn right round so
  flat an ellipse folds on itself there: it came out with jagged ends first); the tail leaves
  from under it, its end whipped.
- The bollard's turns: tubes with a round shoulder each side.

## Round 16 (user) · the coil's ends

> Los bordes de la cuerda azul están mal dibujados

(two crops of the coil's ends: an oval stuck on beside each band's square-cut end)

→ The «shoulders» of round 15 were separate ellipses beside bands cut square: blobs, with a
seam. A turn of rope seen nearly edge-on is one closed tube: its ring's projected line
stroked with the rope's thickness (ink, then the colour inside it), so the two ends are the
tube's own round turn-backs. Lower turns are filled in (nobody sees down their hole), the top
turn shows the pile's opening as a dark lens, and the strands are laid on the stretch that
faces the camera.

## Round 17 (user) · the shot's animation

> Vale, ahora mejora la animación del plano. Ten en cuenta que la animación tiene que parecer
> realista

→ What made it unreal: the fall lasted 1.25 s for a drop that takes 0.68 s (it floated), on an
eased curve; the board slid in beside her and was simply there; the landing squashed the whole
drawing like rubber; nothing lagged; the jump drawing turned into the standing one on the
frame of contact.

Now the motion is computed in the set's metres (`cam.js`) and then held on twos:

- falls are `h = H − g·t²/2`, g = 9.81: 2.3 m in 0.68 s, sideways speed constant in the air;
- the board comes first: it drops nose-down, hits the stone on beat 2, bounces twice
  (restitution 0.32, losing speed at each hit, rocking), rolls and stops under friction where
  her left boot will land; its flight is worked back from that spot;
- Kit drops on beat 4. For the last two drawings of the fall she gets her feet under her (her
  standing drawing in the air, hair and arm still flying), so contact changes no drawing; her
  legs take the landing (the upper body comes down over them and springs back: a damped
  oscillation), her feet slide a hand's width, the head nods late, the bunches of hair stream
  up in the fall and whip down after she has stopped, the arm swings down and comes up for the
  thumb on the card's beat with an overshoot;
- Captain starts at the clatter and again at her landing: two jumps under the same gravity;
  Dot looks up at the clatter; dust at every hit, sized by the hit; a short shake.

For that Kit was cut into more parts (`tools/tocode.py`: legs apart from the upper body, the
two bunches apart from the head), `Drawn.draw` paints groups of parts as layers (the upper
body really covers the legs when it comes down) and `cast/kit-act.js` (`KitAct.stand`, `air`,
`board`) poses her from a few numbers (crouch, droop, arm, nod, lean).

Limits that remain: seen from the front a crouch is the shorts coming down over the shins
(her knees do not bend in the drawing: that needs a drawn crouch pose); her face does not
change (no blink, no effort); still no sound.

## Round 18 (user) · the animation is not animation

(four crops: the board alone with half its deck missing; Kit in the air in her standing
drawing; her boot in the air with no line under its sole; her sleeve broken where the arm had
turned)

> Quitando el hecho de que falta media tabla. El personaje cae en la misma posición como una
> estatua. La manga del personaje no está bien dibujada, los zapatos no tiene el borde. El
> personaje no tiene una animación real.

→ Three faults of the cut-out, fixed:

- **half the board**: in her standing drawing the boot hides half the deck, and the board
  drawn alone showed the hole. The deck is now drawn whole (`KitAct.board`: its outline
  measured on the sheet, its far edge carried on under where the boot was) over the
  drawing's own trucks and wheels, which are a part of their own (`wheels`);
- **the boot's border**: the line under its sole had gone to the board's part (strokes are
  assigned by where their middle falls) and vanished with it; the boot's region now takes it;
- **the sleeve**: the arm's region had taken the sleeve's opening with it; it is now only the
  forearm that comes out of the sleeve, turning about the elbow inside it.

And the real one, not fixable with what there is: **a character animated from two drawings is
a statue being moved.** Physics on a cut-out gives the timing, not the acting: a fall is a
sequence of different drawings (tucked, reaching, contact, deep crouch, pushing up, standing).
Generated those as two key-pose sheets with her approved sheet as the reference (1,732
credits). The shot's fall uses her jump drawing again meanwhile, as a placeholder.

## Round 19 (user) · the key poses

The user attached the four generated sheets. Taken: the first of each (`ref/kit-drop-a.webp`:
tucked in the air, legs reaching down, contact; `ref/kit-drop-b.webp`: deep crouch, pushing
up, standing proud); the other two stay in `private/`.

- `tools/tocode.py`: a character can have poses from several sheets (`src`), each with its
  box and a `keep` polygon (the poses' hands reach into each other's boxes; the rest of the
  sheet is painted out before measuring). `kit-drop` → `cast/kit-drop-drawn.js`, six more
  poses of `kit`.
- The two sheets came at different sizes, and both with a bigger head and a shorter body than
  her model sheet: they are scaled against each other on one ground line
  (`dev/ref/scene.js`: sheet A × 1.06) and the shot uses only these six, so she does not
  change build in mid-shot. The thumbs-up of her model sheet is not in this shot.
- `scene.js`: on twos from the landing: tuck (two drawings in frame, turning), reach,
  **contact** on beat 4, crouch for three drawings (deepest on the second), rise for two,
  proud on beat 5 with the card, an overshoot and a settle, then a breath on the beat. Her
  place at each drawing still comes from the physics (the fall, a skid of a hand's width).
- She no longer lands on the board (the poses have her feet on the ground): it clatters in
  first, rolls to a stop beside her landing spot and jumps when she lands. The cone moved out
  of its way.

Still off: once she is up she only breathes (one standing drawing: no blink, no gesture);
the frame sees only the last metre and a half of the drop, so the tucked pose is in frame
for one drawing and a half; no sound.

## Round 20 (user) · the drawings lose details and colours

> Los recortes no están bien, pierden detalles y colores.

(four crops of the render: the standing hand with no lines between its fingers, two faces with
no plaster on the nose, the board's wheels as flat discs.)

True, and it was not the animation: the drawings written from the sheets were poorer than the
sheets. Until now a drawing was only ever looked at whole, where it reads as right. Built the
check that was missing, then fixed what it showed:

- **`dev/fidelity/scene.js` + `tools/fidelity.py`**: every pose drawn from its code at the
  sheet's own place and size, and compared with the sheet at 4×, either in boxes given by hand
  or `--worst N`, which finds the places that differ most by itself. The same scene on the
  film's yellow shows page left white, or white taken for page. **`tools/look.py`** shows what
  the measuring makes of a piece of a sheet (lines, paint) before any drawing is written.
- **`tools/measure.py`, rewritten around what the checks showed** (each rule has its fault
  beside it in the code):
  - lines are what is dark and thin (a black-tophat of the luminance), not what is black: the
    creases between fingers and the plaster's edges are brown and were being cleaned away as
    anti-aliasing. And whatever is as black as the ink is ink however thick (a pupil);
  - not everything dark and thin is a line: a sock's stripe, the star on a shoe, the frame of
    Milo's glasses, the navy between two laces are paint, told by being over two pixels wide
    somewhere, or a dot clear of the ink; they go back to the fills;
  - each region between lines is clustered on its own pixels. Nearest-palette-colour made a
    charcoal strap navy, olive shorts brown and a shoe's shadow purple; tones are one paint
    when they are as light and of the same hue, lightness and hue compared apart;
  - **a paint is read only where the colour is not changing.** Where two paints meet with no
    line between them, and beside every line, the sheet runs from one to the other through
    tones that are nobody's paint: a mustard rim round every flower, pink round a red star,
    olive smudges round the eyelets of a yellow boot. Rules about those tones' size and colour
    (small, thin, a mix of its neighbours) chased them for five tries and each softer sheet
    escaped; the slope of the colour removes them all at once, and the heart of a thin stripe,
    where the colour does not change either, is still read. Blotches inside a flat area (the
    sheets are lossy) are then small patches beside their own hue, and join it;
  - the page is the white that reaches the pose's border through white. «White in a region
    touching the border» emptied teeth and eyes wherever an outline had a hairline gap.
- **`tools/tocode.py`**: a stroke or a blot keeps its sampled colour unless it is near black
  (Dot's slate anchor was drawn in ink); a ring is a line going round, not a blot (the anchor's
  eye was a disc); where two lines cross is no blot (knots at every junction).
- **Kit's plaster on the six key poses** (`tools/plaster.py` → `cast/kit-drop-details.js`): on
  those sheets its outline and seams are a pixel wide and cannot be measured as lines, so they
  are drawn by rule from what can be, the plaster's patch of colour: its contour, and two
  seams across it.

Measured after: every sheet has 0.2–0.7 % of its pixels off by more than 34 levels (blurred
1.6 px), and the worst places `--worst` finds are now stripe edges and line widths a pixel
off. Checked by eye at 4×: the four places the user cropped (the hand's creases, both faces'
plasters, the wheels' hubs) and every sheet's seven worst.

Still approximate, all at the limit of what the sheets hold (1280 px wide for two or three
figures): the plasters' seams are drawn by rule, not copied; the eyelets of the boots in the
six key poses are three pixels wide on the sheet and come out as dots, not rings; Hoagie's
braces lose their little squares; Dot's slate anchor keeps its shape but half of it reads as
ink. None is in this shot at a size where it shows (Dot is 60 px tall in the hatch), and the
cure for all four is the same: a sheet per character at twice the size, or `Drawn.add` by
hand as for the plaster.

The user also asked for a prompt for the theme song (Suno) and sent the song: `suno-prompt.md`;
the track measures 120 BPM exactly (16 bars, 31.75 s), first beat at 0.05 s. It stays in
`private/`. The shot list was planned for 24 s: it is re-timed to the song's 16 bars when the
other shots are built.

Lessons: → `replicate` (a drawing measured from a sheet is checked against the sheet at 4×,
place by place, before it is animated; what the measuring rules ended on), → `review` (crops of
a drawing are compared with its source, not judged alone).

## Round 21 (user) · the gull hops with his perch, Kit stands on the rope

> Un par de cosas: el pájaro salta junto a donde está reposado y el personaje queda encima de
> la cuerda

Both true in the frames (crops at 3840):

- **Captain carried a slab of his sheet's bollard under his feet.** His model sheet stands him
  on a bollard; the shot used the drawing clipped just under his feet, but a bollard's top is
  seen from above and reaches higher than the feet standing on it, so a dark piece of it stayed
  inside the clip and hopped with him. He is now cut from it in the drawing itself
  (`tools/tocode.py`: parts `bird` and `post`, his feet traced on the sheet a line's width out)
  and the shot draws only `bird`, with no clip.
- **The blue rope's tail ended under Kit's boot.** In metres she lands 0.3 m behind it, but on
  screen the whipped end sat against her toe cap and read as stood on. The tail now turns
  towards the camera and ends 0.2 m to the side of where she lands (`set.js`, `coil`).

Lessons → `animate`: what a model sheet stands a character on is cut from them as a part before
anything moves; and where a character lands or stands, the set's loose ends keep clear on
screen, not only in depth.

## Round 22 (user) · the rest of the shots, on the song

> Vale, sigue con el resto de planos sobre la canción

The song (Suno, from `suno-prompt.md`; in `private/`): 120 BPM exactly, first beat at 0.05 s,
16 bars, last hit at 30.05 s, silence from 31 s. Its words could not be transcribed here (the
tool for it was refused), so the edit follows its **sections**, measured in four frequency
bands second by second: the bass drops out at 6–8 s, 10–12 s and 18–21 s (breaks); the full
band runs 12–18 s and 21–30 s (the loudest: the chorus).

| Time | Shot | What happens |
|---|---|---|
| 0–4.05 | GULL HARBOR | the town's sign, the camera coming down it; then the quay, Dot coming up behind her counter |
| 4.05–8.05 | KIT | the shot there was: the board hits on its third beat, she lands where the bass drops out |
| 8.05–10.05 | HOAGIE | in from the right through his own viewfinder (REC), Kit in the frame; his card |
| 10.05–12.05 | MILO | a finger up, the plan; on the third beat he goes heels over head (the song's break) |
| 12.05–14.05 | PIP | through the three of them on her scooter without stopping, the camera going with her |
| 14.05–16.05 | AUNT DOT | her hatch, close; on the third beat the spatula and the chips |
| 16.05–18.05 | CAPTAIN | on his bollard, a start at every beat; on the last, gone |
| 18.05–21.05 | AFTER HIM | the break: he crosses the quay with the chips; Pip is first after him, then the others, one a beat |
| 21.05–26.05 | THE PIER | side on, the camera running with them; closer for the last two bars |
| 26.05–28.05 | OFF THE END | the pier stops («NO RUNNING»); they do not |
| 28.05–30.05 | IN THE AIR | the four and the gull against a sunburst |
| 30.05–31.75 | PIER PRESSURE | the last hit: they drop out of frame, the sea comes up, the title; Captain lands on it |

How it is built:

- **One world, many views.** Every harbour shot is the same set through `Film.view` (a point of
  the frame to its centre and a zoom); the set's cached layers are painted again at the zoom's
  resolution (`env.k × zs`), so the close shots (Dot at 3×) are as sharp as the wide. Who has
  arrived stays where they are in the later shots (Kit and her board from bar 4 on).
- **The cast in metres** (`Film.put3`): each drawing has its pixels per metre and an anchor
  (between the soles, or its middle for a flying pose), so the five stand at their heights
  beside Kit without a number per shot.
- **A bar per character**: in on the first beat (a slide and a squash on twos), the card on the
  third (`Film.card`: Kit's card, any name), with the action each one's two drawings allow.
- **The pier** is a second, flat set (`pierSide`): shore, sea, deck, piles, lamps, each layer at
  its own speed.

Seen in the contact sheets and fixed before showing: Milo, Dot and Captain's shots were first
framed with whoever stood nearer filling the frame (Kit's head in Milo's shot, Milo's in Dot's,
Hoagie in Captain's): reframed on their subject, and Dot's and Captain's shots leave the others
out; the leap carried the four out of the right of the frame and left it empty: slower across,
a lower camera; the title's splash was a tenth of the frame: three times that.

Still off, and it is the big one: **Hoagie, Milo, Pip, Dot and Captain have two drawings each.**
They slide, hop, squash and swap pose; they do not act as Kit does in her shot (the round 18
lesson). The cure is the same as hers: key poses per character and shot (five or six drawings
each, 433 credits a sheet). Also: no sound effects yet (the song is dense; the clatter and the
splash would still earn theirs); the pier set is plainer than the harbour; the words of the
song are not matched to the pictures (the names could land on their own cards once the times
they are sung at are known).
