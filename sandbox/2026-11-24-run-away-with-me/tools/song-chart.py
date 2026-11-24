"""Draws the song's map as one picture: level per beat in four bands, the bar grid, the
sections, the jumps and (if given) the sung lines, so the edit can be planned on the music.

  python3 -I tools/song-chart.py out/song-measure.json review/song-map.png [lines.json]

lines.json: [{"t": start, "e": end, "text": "..."}]. Sections come from SECTIONS below,
which are read off the measure (bars where the bands change) and the transcription.
"""
import sys, json
from PIL import Image, ImageDraw, ImageFont

m = json.load(open(sys.argv[1]))
out = sys.argv[2]
lines = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else []

BAR = 4 * m['beat']; B0 = m['bar0']
bt = lambda b: B0 + b * BAR
# [first bar, name, colour]
SECTIONS = [
    (0, 'intro', '#5a4a8a'), (8, 'verse 1', '#2f6f8f'), (23, 'pre', '#3f9f9f'),
    (31, 'gap', '#222'), (32, 'CHORUS 1', '#e0417a'), (48, 'drop', '#000'),
    (49, 'verse 2', '#2f6f8f'), (56, 'pre 2', '#3f9f9f'), (64, 'gap', '#222'),
    (65, 'CHORUS 2', '#e0417a'), (81, 'bridge A (full)', '#b0306a'),
    (89, 'bridge B (quiet)', '#c9a227'), (95, 'build', '#e08a27'), (97, 'riser', '#222'),
    (98, 'FINAL CHORUS', '#e0417a'), (114, 'outro', '#b0306a'), (122, 'end', '#000'),
]
W, H = 3000, 1050
PX = 40; PW = W - 2 * PX
dur = m['duration']
x = lambda t: PX + PW * t / dur
img = Image.new('RGB', (W, H), '#0d0b1a'); g = ImageDraw.Draw(img)
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
    FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
except OSError:
    F = FB = ImageFont.load_default()

# section band
for i, (b, name, col) in enumerate(SECTIONS):
    e = SECTIONS[i + 1][0] if i + 1 < len(SECTIONS) else len(m['bars'])
    g.rectangle([x(bt(b)), 40, x(min(dur, bt(e))), 90], fill=col)
    g.text((x(bt(b)) + 4, 52), name, font=FB, fill='#fff')
# time ruler
for s in range(0, int(dur) + 1, 10):
    g.line([x(s), 95, x(s), 105], fill='#888')
    g.text((x(s) - 14, 106), '%d:%02d' % (s // 60, s % 60), font=F, fill='#aaa')

# level per bar in bands: rows of rectangles, brightness = level
ROWS = [('all', '#ffffff', 30, 50), ('bass', '#ff4f9a', 15, 47), ('mid', '#4fe0ff', 18, 45),
        ('high', '#fff07a', 0, 37), ('centre', '#b0ff8a', -1, 7)]
top = 140
for k, (name, col, lo, hi) in enumerate(ROWS):
    y0 = top + k * 70
    g.text((PX, y0 - 22), name, font=F, fill=col)
    r_, g_, b_ = int(col[1:3], 16), int(col[3:5], 16), int(col[5:7], 16)
    for bar in m['bars']:
        v = max(0, min(1, (bar[name] - lo) / (hi - lo)))
        h = 50 * v
        g.rectangle([x(bar['t']), y0 + 50 - h, x(bar['t'] + BAR) - 1, y0 + 50],
                    fill=(int(r_ * (.35 + .65 * v)), int(g_ * (.35 + .65 * v)), int(b_ * (.35 + .65 * v))))
# bar lines every 4 bars, labelled
for b in range(0, len(m['bars']), 4):
    g.line([x(bt(b)), 120, x(bt(b)), 480], fill='#2a2744')
    g.text((x(bt(b)) + 2, 482), str(b), font=F, fill='#555')

# jumps
yj = 520
g.text((PX, yj - 24), 'jumps (rise ▲ / drop ▼, on the beat)', font=F, fill='#ddd')
for j in m['jumps']:
    c = '#5dff8a' if j['kind'] == 'rise' else '#ff5d5d'
    X = x(j['t'])
    g.line([X, 120, X, 470], fill=c, width=1)
    if j['kind'] == 'rise':
        g.polygon([(X, yj), (X - 8, yj + 16), (X + 8, yj + 16)], fill=c)
    else:
        g.polygon([(X, yj + 16), (X - 8, yj), (X + 8, yj)], fill=c)

# sung lines, staggered over four rows
yl = 580
g.text((PX, yl - 24), 'vocals (local transcription, word times)', font=F, fill='#ddd')
for i, L in enumerate(lines):
    yy = yl + (i % 6) * 72
    hot = L['text'].isupper()
    g.rectangle([x(L['t']), yy, max(x(L['t']) + 2, x(L['e'])), yy + 8], fill='#ff3b5c' if hot else '#ffb3e0')
    txt = L['text'] if len(L['text']) < 34 else L['text'][:32] + '…'
    g.text((x(L['t']), yy + 12), txt, font=FB if hot else F, fill='#ff6b85' if hot else '#ffd6ef')
    g.text((x(L['t']), yy + 34), '%.1f' % L['t'], font=F, fill='#777')

g.text((PX, 8), 'Run Away With Me · %.2f BPM · bar %.3f s · bar 0 at %.3f s' % (m['bpm'], BAR, B0),
       font=FB, fill='#fff')
img.save(out)
print('wrote', out)
