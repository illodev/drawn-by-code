# Reviews · pier-pressure

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

State: **model sheet and hand chart waiting for the user's approval.** No film yet: the
style test (one animated shot) and the set of Gull Harbor come after it. Until the style
test is approved the style stays *in testing* and is not yet in the README's table, the
cover's carousel or the site (new-style, steps 7 and 8).

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
