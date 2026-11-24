# run-away-with-me

- **Style:** retro-neon (new, to be built with **new-style**): 1980s Miami at night in neon,
  from the user's twelve synthwave/outrun references (people with a cyan and a magenta rim
  light, a couple kissing among falling lines of light, a girl in a neon street, a woman with
  a boombox, a glitched portrait, cars seen from behind, a city of lights from a hill,
  striped suns, grids, palms). The references stay out of the repo.
- **Format:** 16:9 (assumed, to confirm) · the whole song, 4:11 (251.4 s) · 24 fps
- **Purpose:** a videoclip for «Run Away With Me» (Carly Rae Jepsen, *E•MO•TION*, 2015).
  The user, translated: «retro neon, but not the typical empty one»; «very Miami: sex, drugs,
  party, the love of two people; obviously the sex would not be explicit»; «the drug use
  would lead to lights, maybe "visual hallucinations"; we have to catch the music's jumps
  well».
- **One-line idea:** one night in 1980s Miami Beach, from the party to the sunrise: excess,
  escape, love, dawn. The lights carry it: the party's neon, the hallucinations a pill
  brings, the blackouts where only the two of them glow, the city seen from above as a
  grid, and the sun rising out of the Atlantic (Miami Beach faces east, so the striped
  synthwave sun is a real sunrise over the sea).
- **On-screen text:** the title only, unless the user wants words on neon signs (asked).
- **Music:** the track itself, never committed (`private/song.mp3`; renders in the repo
  are silent). Measured below.
- **Signature:** `illodev x Claude` at the end, in the film's own lettering.
- **Must NOT happen:**
  - explicit sex or nudity in detail: intimacy by ellipsis (light through blinds sliding
    over two bodies, a hand on a sheet, a steamed car window with a handprint, silhouettes
    under the pool's water, the blackout that leaves two neon outlines together);
  - drug use as a how-to: one pill on a tongue at the party, then only its effect on the
    world;
  - anyone who could read as under age: two adults;
  - Carly Rae Jepsen's likeness, anything from the song's official video (a travel diary),
    characters from *Miami Vice* or *Vice City*, branded cars or boats (an invented wedge
    coupé, an invented speedboat);
  - lyrics as karaoke;
  - the empty synthwave landscape (a grid and a sun in a void) as a set: grid and sun only
    where the story brings them.

## The song's map (measured: `tools/measure-song.py`, `review/song-map.png`)

119.00 BPM, steady (the grid's phase is the same in every quarter of the song); a beat is
0.5042 s, a bar 2.017 s, bar 0 at 0.415 s. Bar *n* starts at 0.415 + 2.017 n.

| Bars | Time | Section | What the bands do |
|---|---|---|---|
| 0–7 | 0.4–16.6 | intro | thin bass, no lead voice |
| 8–22 | 16.6–46.8 | verse 1 | bass in; highs thin out bar by bar to almost none (bars 12–15), back at bar 16 (32.7) |
| 23–30 | 46.8–62.9 | pre-chorus | mids and highs climb |
| 31 | 62.9–65.0 | gap | **the bass leaves for one bar** |
| 32–47 | 65.0–97.2 | chorus 1 | **the biggest jump of the song** (+9 dB, bass +23 dB on the beat at 64.95) |
| 48 | 97.2–99.2 | drop | **near silence for one bar** |
| 49–55 | 99.2–113.4 | verse 2 | the lead voice at its most central |
| 56–63 | 113.4–129.5 | pre-chorus 2 | mids and highs climb |
| 64 | 129.5–131.5 | gap | **the bass leaves for one bar** |
| 65–80 | 131.5–163.8 | chorus 2 | full again on the beat at 131.0/131.5 |
| 81–88 | 163.8–179.9 | bridge A | full, the voice less central («hold on to me», backing «run away with me») |
| 89–94 | 179.9–192.0 | bridge B | the level falls; quiet; the highs vanish (bars 91–93) («turn the world to gold») |
| 95–96 | 192.0–196.0 | build | mids and highs rise fast |
| 97 | 196.0–198.1 | riser | **no bass, mids up** («oh, my baby» lands on the drop) |
| 98–113 | 198.1–230.4 | final chorus | full from the beat at 198.06 |
| 114–121 | 230.4–246.5 | outro | «run away with me» repeated |
| 122–124 | 246.5–251.4 | end | the last hit, decay to silence by 250.5 |

Word times: a local transcription (`tools/transcribe.py`: faster-whisper `medium.en` on
CPU, no paid service) in `out/words-*.json`, kept out of the repo; only times are used
(`out/lines.json`, short labels, drawn on `review/song-map.png`). Chorus 2 was skipped by
the model and is chorus 1 moved by 33 bars (+66.56 s), checked on a clip (the second
«lights go out» at 157.4). Word starts after a gap are early; refine each cue on the
centre channel when it is animated.

**The six «when the lights go out»** (the line ends on «out»): 74.9–77.7 · 91.0–93.8 ·
141.5–144.3 · 157.4–160.4 · 207.1–210.2 · 224.1–227.2. Six blackouts: each one built
differently.

**The jumps, and what each one does on screen:**

| Time | Jump | On screen |
|---|---|---|
| 0.43 | first note | the first neon tube strikes |
| 16.55 | bass in, voice in | the party |
| 24.6–32.7 | the highs thin out for four bars | the room goes quiet round the two of them: the pill |
| 32.68 | the highs come back | the pill is swallowed, the room comes back louder |
| 46.8–62.9 | pre-chorus climbs | the drive; streetlights on every beat; halos grow on every light |
| 62.94 | **the bass leaves for a bar** («ooh») | everything holds its breath: the car in the air on a crest, the lights stretch |
| 64.95 | **the drop** («baby» lands on it) | the trip arrives: tracers, colour pushed, the skyline breathing on the kick |
| 77.0, 93.0 | «out» | blackouts 1 and 2 |
| 97.22 | **near silence for a bar** | total black, two neon outlines |
| 99.24 | everything back, «up in the clouds» | they rise over the city; the streets become the grid |
| 129.49 | the bass leaves for a bar | the room holds its breath (the hotel) |
| 131.51 | chorus 2 | the night together, by ellipsis |
| 143.6, 159.6 | «out» | blackouts 3 and 4: the outlines of the two together |
| 163.78 | bridge A | the boat across the bay |
| 179.91 | the music falls | the comedown: the sky pales |
| 192.0–196.0 | the build | the horizon burns brighter on every beat |
| 196.04 | **riser, no bass** | the sun's rim touches the sea, held |
| 198.06 | **the final drop** | the sun comes out of the Atlantic; gold |
| 209, 226 | «out» | blackouts 5 and 6: the city's neon goes off because it is day |
| 246.47 | the last hit | the title |

## Hallucinations (to be drawn from the real thing, not from clichés)

What people report and what the eye does, to be styled in neon and driven by the bands:
tracers (moving lights leave decaying copies), halos and starbursts round every light,
colour pushed and cycling, surfaces that breathe and drift (on the bass), visual snow and
sparkle (on the highs), and the four geometric «form constants» of hallucination (Klüver):
lattices and grids, tunnels and funnels, spirals, cobwebs, appearing on dark surfaces. The
synthwave grid is one of them, and the city's streets seen from above are another.

## Shot list

Script v1, to be approved (times from the map above):

| Time | Section | What happens |
|---|---|---|
| 0:00–0:17 | intro | Ocean Drive at night, the Art Deco hotels' neon striking tube by tube, people, cars, palms. The party in a hotel: mirror ball, the crowd. |
| 0:17–0:47 | verse 1 | She is sick of the party. As the highs thin out (0:25–0:33) the room goes quiet round her: a pill on a tongue; the room comes back louder with the hi-hats (0:33). He finds her across it; they leave while everyone sleeps. |
| 0:47–1:05 | pre-chorus | A white convertible on the causeway, the streetlights passing over them on the beat, a kiss lit in flashes, halos growing. The bass leaves (1:03): the car on a crest, everything holds its breath. |
| 1:05–1:37 | chorus 1 | The drop: the trip arrives with it. Tracers from every light, the bay and the skyline breathing on the kick, colour pushed. Blackouts on «out» (1:17, 1:33). |
| 1:37–1:39 | drop | Total black; only their two neon outlines. |
| 1:39–2:11 | verse 2 | High over the city: the streets below become the grid, form constants on the night sky, nobody sleeps. |
| 2:11–2:43 | chorus 2 | The night together, by ellipsis: blinds, sheets, the pool; blackouts on «out» (2:23, 2:39) leave the outlines of the two together. |
| 2:43–3:00 | bridge A | A speedboat across the bay. |
| 3:00–3:16 | bridge B | The comedown: the sky pales over the beach; what they touch turns gold. The build: the horizon burns brighter on every beat; the riser: the sun's rim touches the sea. |
| 3:18–4:06 | final chorus, outro | The sun comes out of the Atlantic on the drop; the city's neon switches off on each «out» because it is day; they run into the water. |
| 4:06–4:11 | end | Title on the last hit, then the signature. |
