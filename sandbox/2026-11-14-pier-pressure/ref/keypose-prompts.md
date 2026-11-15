# Key-pose sheets: prompts (ElevenLabs flow, model gpt-image-2.5-sunburst, 16:9)

Each is generated with the character's approved model sheet wired in as the reference image
(the model-sheet node of that character in the flow). 433 credits a variation.

Generated on 2026-11-15 (two variations each): **Milo** (crouch tightening a wheel, smug on the
board, running in a panic), **Captain** (crouched to spring, taking off, wings down in flight),
**Kit** (pushing, gliding low, pointing ahead looking back, all on her board).

The first variation of each is in `ref/` (`milo-keys.png`, `captain-keys.png`, `kit-ride.png`) and
written as code; the second ones are in `private/`.

Generated after the user's go-ahead (two variations each, the first kept: `hoagie-keys.png`,
`pip-keys.png`, `dot-keys.png`):

## Hoagie (reference: his model sheet)

Animation key-pose sheet of the SAME character as the reference sheet (Hoagie: the same chubby pale freckled boy with a head wider than tall, sandy-blond buzz cut with one cowlick, jug-handle ears, round pink nose, braces, the same orange Hawaiian shirt with big white flowers, olive-green cargo shorts, white socks with one navy stripe, navy sneakers with white toe caps and an orange stripe, the same grey 1990s camcorder on a black strap), in exactly the same drawing style: bold even black ink outline, completely flat colours, no shading, no gradients.

Three full-body key poses side by side on a plain pure white background, well separated, nothing overlapping, all at the same size, all in three-quarter front view facing slightly to the left:
1. LEFT: running flat out, body leaning forward, one leg stretched forward and the other kicked up behind, holding the camcorder up to one eye with one hand while the other arm pumps, shirt flapping behind him, tongue sticking out in concentration.
2. MIDDLE: skidding to a stop: both heels dug into the ground with toes up, body leaning far back, both hands gripping the camcorder at his eye, shirt and cowlick thrown forward, teeth clenched.
3. RIGHT: standing relaxed, the camcorder lowered to his chest in one hand, looking straight at the viewer with a huge proud grin full of braces, the other hand giving a big thumbs-up.

Clean finished production line art with flat fills, as in an animation studio's key-pose model sheet. No text, no lettering, no numbers, no logos, no signature, no background, no ground shadows, no motion lines.

## Pip (reference: her model sheet)

Animation key-pose sheet of the SAME character as the reference sheet (Pip: the same small 8-year-old girl with the same oversized magenta helmet covered in stickers, the same green braids, the same face, the same pale yellow T-shirt under blue denim dungaree shorts, striped socks and red sneakers, on the same lime-green kick scooter with magenta wheels), in exactly the same drawing style: bold even black ink outline, completely flat colours, no shading, no gradients.

Three full-body key poses of her riding the scooter, side by side on a plain pure white background, well separated, nothing overlapping, all at the same scale, all in the same side three-quarter view as the riding pose in the reference, travelling to the right:
1. LEFT: pushing off hard: one foot on the scooter deck, the other leg stretched far out behind her just leaving the ground, body leaning low over the handlebars, both hands on the grips, braids streaming back, teeth gritted with effort.
2. MIDDLE: cruising, both feet on the deck, steering with one hand only, the other hand holding a round red lollipop to her mouth, eyelids half closed, completely bored and unbothered, braids streaming back.
3. RIGHT: cruising, both feet on the deck, both hands on the grips, head turned back over her shoulder towards the viewer, one eye winking, cheeky grin with the lollipop stick poking out of the corner of her mouth.

Clean finished production line art with flat fills, as in an animation studio's key-pose model sheet. No text, no lettering, no numbers, no logos, no signature, no background, no ground shadows, no motion lines.

## Aunt Dot (reference: her model sheet)

Animation key-pose sheet of the SAME character as the reference sheet (Aunt Dot: the same big strong woman with brown skin and a square jaw, the same teal visor, blonde bun with a pencil through it, gold hoop earrings, anchor tattoo on her arm, the same coral-red T-shirt, cream apron with a teal fish on it, denim shorts and flip-flops), in exactly the same drawing style: bold even black ink outline, completely flat colours, no shading, no gradients.

Three full-body key poses side by side on a plain pure white background, well separated, nothing overlapping, all at the same scale, all in three-quarter front view:
1. LEFT: shaking a steel wire frying basket full of golden chips with both hands, chips jumping out of it, looking down at the basket with one eyebrow raised and a confident half smile.
2. MIDDLE: holding a red-and-white striped paper cone of chips in one hand and shaking a salt shaker over it with the other hand held high, eyes on the cone, tongue at the corner of her mouth.
3. RIGHT: furious: leaning forward, mouth wide open yelling, one fist raised high shaking a metal spatula, the other arm stretched out pointing an accusing finger, eyebrows down, the empty hand that held the cone still open.

Clean finished production line art with flat fills, as in an animation studio's key-pose model sheet. No text, no lettering, no numbers, no logos, no signature, no background, no ground shadows, no motion lines.

## Frame sequences (round 27): the wording that gives consecutive frames

Same opening paragraph (the character, the style), then:

> FOUR CONSECUTIVE FRAMES of one continuous movement, in a single row from left to right, evenly
> spaced with a clear empty gap between them, nothing overlapping. In every frame he is drawn at
> exactly the same size, full body, standing with both feet planted on the same ground line in
> the same place; only the pose changes a little from one frame to the next, like four drawings
> in a row from a traditional animator's scene. The movement: …
> Frame 1: … Frame 2: … Frame 3: … Frame 4: …

Name each frame's job where it has one: (anticipation), (the thrust), (the settle), (a blink:
exactly the same pose as frame 3, eyes closed). Hoagie: `hoagie-seq-turn.png` (filming to the
side → turning → the lens at us → peeking over it), `hoagie-seq-thumb.png` (anticipation →
thumb up on his toes → settled → blink).

## The ground (round 33): never white again

Replace «on a plain pure white background» with: **«on a plain, flat, solid pure green
background (#00FF00), the same green everywhere, also in every gap between an arm and the body,
between the legs, inside handles and straps»**, and give the pose `'bg': (0, 255, 0)` in
`tools/tocode.py`. For a character with green on them (none here is pure green), pick another
colour they do not have. White is then always paint, and no holes need listing.

## Cycles and in-betweens (round 37)

- In-betweens: reference = the sheet with the key frames; «The reference shows four key frames
  of one movement: 1 …, 2 …, 3 …, 4 …. Draw the FOUR IN-BETWEEN FRAMES of that same movement …
  Frame A (between key 1 and key 2): … Frame D (after key 4): …».
- A run cycle: «FOUR CONSECUTIVE FRAMES of a looping run cycle … strict side view (profile),
  running towards the RIGHT, all four on the same ground line … Frame 1 (contact): the front
  leg stretched forward with its heel just touching the ground, the back leg stretched behind
  with its toe leaving the ground. Frame 2 (passing): the weight on the front leg, now under
  the body and bent; the other leg swinging forward with its knee high. Frame 3 (contact, other
  leg). Frame 4 (passing, other leg), the body at its highest.»
- A push cycle (board, scooter): planted beside the board ahead of the body → stretched out
  behind, toe leaving → swinging forward in the air → both feet on, gliding.
- A wing beat: up → level coming down → down → level coming up, «the body at exactly the same
  size and the same height in all four».

