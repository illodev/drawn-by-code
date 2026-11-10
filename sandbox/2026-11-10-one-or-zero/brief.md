# one-or-zero

- **Style:** terminal (new, in testing: `styles/terminal/`, skill `style-terminal`)
- **Format:** 16:9 · about 67 s · 24 fps (the style test is one shot, 10 s). One grid for
  the whole film: 192 × 54 characters on a 1920 × 1080 frame.
- **Purpose / audience:** a short film for the repo's gallery, built on the ideas of the
  series «Mr. Robot» (created by Sam Esmail, USA Network, 2015–2019). A fan piece: the
  user chose four passages they like (people and their vulnerabilities; «are you a one or
  a zero?»; «is any of it real?»; the speech about control and hope) and asked for a video
  based on that philosophy.
- **One-line idea:** the whole film is one terminal session, five commands long; the red
  cursor is a choice waiting to be made. It opens people as records, lists what replaced
  the real, digs for something real, finds what keeps everyone waiting, and ends blinking
  in front of the viewer: one or zero?
- **References:** the user's four passages (kept in the conversation, not copied here).
  From the series' look only what is a way of filming, not a design: characters small in a
  lower corner with a lot of empty frame, a cold dark palette, red as the one colour.
- **On-screen text (literal):** English (the user's decision, 2026-11-10). Written for
  this film in the voice of a shell; see the shot list. The series' own lines are not
  reproduced: only the title question, «are you a one or a zero?», and its answer, «life's
  not that binary», appear, as the short quotation the film is built around.
- **Music / rhythm:** dark minimal electronic, 96 BPM (one beat = 0.625 s = 15 frames, a
  bar = 2.5 s), generated with ElevenLabs (the user's connector). Cuts and hits on beats.
  Keys, a scan and glitches as effects.
- **Must NOT happen:**
  - no logo, title lettering, mask, character or actor's likeness from the series; no
    brand names from it. The hooded figure is nobody: a hood, a nose, one red eye.
  - no monologue reproduced: every idea is restated as something a terminal would print.
  - no green «digital rain», no skulls, no fake «hacking» gibberish scrolling: every
    command on screen is a real one that means what it does (`cat`, `ls -l`, `find`, `ps`,
    `kill`).
  - no more than 3 flashes per second (glitches are short and rare).
  - the speech about religion is taken as what it says about control, hope and division;
    the film names no faith and mocks no believer.

## The film: five commands

| Passage the user likes | Command | What the terminal shows |
|---|---|---|
| «people are all just people… they love something, they want something, they fear something» | `cat people/*` | every passenger opens as the same three-line record; the values differ, the fields never do |
| «is any of it real?… synthetic emotions in the form of pills…» | `ls -l /real` | everything real is a link to what replaced it (`feelings -> pills`) |
| «you'd have to dig pretty deep to find anything real» | `find / -name real` | the camera sinks through layers of text and finds one thing: the cursor |
| the speech on control: hope as a drug, division, «why should I listen to yours?» | `ps aux` | the processes that run on everyone and never finish: a bar of hope stuck at 99 % |
| «are you a one or a zero?» | `kill -9 …` → `[1/0]` | a door shaped like a 0, a man standing like a 1 |

## Shot list (v1, to be approved with the style test)

96 BPM, a bar = 2.5 s. Times in seconds.

| Time | Shot | What happens |
|---|---|---|
| 0–5 | Prompt | Black. The red cursor blinks alone, then types the question, large: `are you a one or a zero?`. No answer; it keeps blinking. |
| 5–15 | Carriage · `cat people/*` (**style test**) | A carriage at night; the one in the hood watches from the lower corner. He types the command and the cursor walks the bench: each passenger is scanned and becomes their own words, a record opens in the window behind them (`loves / wants / fears`). A fourth line lands on all four at once: `vulnerable: yes`. He types: `different details. same vulnerability.` |
| 15–17.5 | City of records | The camera pulls up and out: the carriage is one row in a wall of thousands of identical records, the city seen as a directory listing; the red labels line up into three columns. |
| 17.5–27.5 | Street · `ls -l /real` | He walks a street of screens. Each line of the listing lands on a beat and lights its billboard: `feelings -> pills`, `truth -> headlines`, `hunger -> additives`, `friends -> followers`, `freedom -> terms & conditions`. Passers-by walk through with their faces lit from below. |
| 27.5–32.5 | Skyline | Wide: the towers are bar charts that rise and fall; every head in the street tilts up and down with them. He stops walking. Typed: `is any of it real?` |
| 32.5–37.5 | Dig · `find / -name real` | He pulls the plug: the picture collapses to a line and a dot. From black the camera sinks through layers of text (ads, feeds, tickers, logs), faster and faster, to the bottom: one result, the blinking cursor. |
| 37.5–47.5 | Processes · `ps aux` | The crowd from above, everyone still, every face lifted to a bar in the sky: `hope [#########.] 99%`. It reaches 99, resets, starts again. The list of what runs on all of them scrolls beside it (`hope --dose daily`, `fear --loop`, `divide --and-rule`); a line splits the crowd in two halves that turn their backs. He is the only one looking down. |
| 47.5–52.5 | Room · `kill -9` | An empty room, him small in a lower corner, a door ajar at the far side leaking light. He types `kill -9 hope fear divide`; the terminal asks: `are you sure? [1/0]`. Typed, small: `life's not that binary.` |
| 52.5–57.5 | Greys | The frame fills with every grey the screen can make, a field of characters from sparse to dense. The camera pushes into the middle of it, into one character, and inside there are only two: 0 and 1. |
| 57.5–62.5 | One | Back in the room, now drawn only with 0 and 1. The door is a tall 0 of light; he walks to it, stops on the threshold, turns round. The door closes to a line. He stands: a 1. In the wall of records every `status: 0` flips to `1`, a wave from where he is. (The climax: 2.5 s.) |
| 62.5–67.5 | End | Black. The first question again, the cursor blinking after it, waiting for the viewer: `are you a one or a zero? █`. A small line of credit under it. |

**The object that changes:** the red cursor. It is always on screen and always the most
saturated thing: it types, it scans, it is the dot the picture collapses into, the one
result of the search, the thing nobody in the crowd looks at, and at the end the answer.

**Layers per shot:** something far that moves on its own clock (tunnel lamps, tickers,
the bar), people with one small loop each, and the cursor's action.

## Other ways to tell it (considered, not chosen)

- **One room, one conversation:** only the «one or zero» exchange, two voices typed on a
  split screen, the door the whole time. Simpler and closer to the scene, but it leaves
  out three of the four passages.
- **Kinetic typography of the speeches:** the words themselves, big, cut to the beat.
  It would mean putting the series' text on screen, and the style has more to give than
  letters.
