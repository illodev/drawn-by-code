# Reviews · physics-newton-faraday

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

### Round 1 (auto)

What we saw, and what changed, in blocking order:

- **Background knocked out to paper.** `g.rect` was called without `beginPath`, so every
  knockout also erased the background rectangle still sitting in the path.
  - `Ph.ink` and `Ph.put` now begin the path themselves.
- **Halftone dots twice too big at 16:9.** The riso kit scaled the screen, grain and
  register by `W / 1080`, which is 1.78× at 1920 × 1080.
  - It now scales by the short side (`Math.min(W, H) / 1080`), so square prints are
    unchanged and 16:9 matches the reference's 9.5 px pitch.
- **Too small, too flat.** The table was a huge slab, the busts sat on it and the right half
  of the frame was empty.
  - The portraits went up ×1.18.
  - The table became a lit top, an edge, an apron in shadow and legs, and the figures sit
    *behind* it with a lap and shins visible below.
  - Newton got a study: a window with the Moon, books and a flickering candle.
  - Faraday got a shelf of glassware, a Leyden jar and a hank of wire.
- **The two faces were the same face,** a pink blob with tiny features.
  - Both were redrawn in near profile: paper skin with a light warm screen, the shadow side
    as a shape, the nose's shade, a cheek, and navy brush features with a heavy lid.
  - Newton now has the long middle-parted waves falling past the shoulders, the white bands
    at the neck and a stronger chin.
  - Faraday has a side parting, a wave over the brow, full hair over the ear, sideburns, a
    high collar and a black stock.
- **The dissolve left a pale rectangle.** Fading a knocked-out table leaves paper behind.
  - Fading shapes are now screens only, without a knockout, so the dots thin out over the
    night.
- **The ball landed on a table that dissolves under Newton.**
  - Newton's table now ends past his knees.
  - The *drawn line* the ball lands on (the represented surface) is what lifts off, carries
    the ball and closes into the Earth.
- **The Earth's lands tore into spikes when they wrapped round.**
  - Each land now turns as a whole shape and is projected onto the sphere.
- **The coil flew off with the new world.**
  - The winding orbit now stays mid-frame while both worlds slide under it, and lands on the
    bench coil exactly when the pan ends. Before that, the bench shows only the tube.
- **The magnet was a stick hidden in the fist.**
  - It is now longer and thicker (N red, S blue) and the coil sits further from Faraday, so a
    good length shows while it goes in.
  - The sleeve got a dark rim and a sheen so it reads against a coat of the same cloth.
- **Still stretches** at 0–1.3 s (the hold before the drop) and 3–4.8 s (the orbit).
  - There is now a slow push-in on both.
  - The Earth turns.
  - The satellite is bigger.
- **The ending was a dot in the dark.**
  - The dark now spreads out from the light mark.
  - An ivory scale with ticks slides in under the mark, which runs along it.

Script checks (all pass):

| Time | Check | Result |
|---|---|---|
| 7.5 s | the needle answers | swung right |
| 8.5 s | the magnet is still | the needle is back at zero |
| 9.5 s | the magnet comes out | the needle swung left |
| — | the fall trace, the ball and the orbit | share the Earth's centre, shown by dotted radii |

### Round 2 (user)

> No está nada mal quizás me falte más detalles para que no se sienta tan vacío el espacio.
> La tierra (globo terraqueo), tiene 3 manchas verdes y parece un huevo de Yoshi, como
> siempre los detalles marcan la diferencia. ¿Newton está sentado sobre una silla invisible?

What changed:

- **The Earth** (`earth.js`) now draws the real continents.
  - They are coarse coastlines in longitude/latitude, projected orthographically, turning
    with its own rotation.
  - Deserts are in ochre, with ice caps, knocked-out cloud bands, the night side, an
    atmosphere ring and a lit rim.
- **Chairs** (`sets.js`):
  - Newton sits on a carved high-backed chair with a leather panel and brass nails, in
    breeches, stockings and buckled shoes.
  - Faraday sits on a Windsor chair.
  - Both have shins and shoes that reach the floor.
- **The rooms are furnished.**
  - Newton's study: a panelled wainscot, floorboards, a shelf of books with his reflecting
    telescope, curtains at the window, an inkwell and quill, and an hourglass whose sand
    runs.
  - When the table turns into a model, the room dissolves into dots and stars come out.
  - Faraday's laboratory: wainscot and floor, a swaying hanging oil lamp with its glow, the
    shelf of glassware, a hank of wire and a voltaic pile.
- **The ending:** the light mark is made by a visible beam with dust drifting in it.

Lesson: an empty background reads as unfinished even when the action reads. A set is dressed
with objects that belong to the person's world and period, and it keeps its own small
motions: the flame, the sand, the lamp, the stars.
